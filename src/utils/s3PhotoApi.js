// S3 Photo API utilities for MoodTracker

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://e7a99njzra.execute-api.us-east-1.amazonaws.com/dev'

/**
 * Upload a photo to S3 using presigned URL
 * @param {File} file - File to upload
 * @param {string} userEmail - User's email
 * @returns {Promise<Object>} Photo data with S3 URL
 */
export const uploadPhotoToS3 = async (file, userEmail) => {
  console.log('📤 Starting S3 photo upload:', file.name)
  
  try {
    // Step 1: Get presigned URL from Lambda
    const presignedResponse = await fetch(`${API_BASE_URL}/photos/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        userEmail: userEmail
      })
    })
    
    if (!presignedResponse.ok) {
      const error = await presignedResponse.text()
      throw new Error(`Failed to get upload URL: ${error}`)
    }
    
    const { upload, photo } = await presignedResponse.json()
    console.log('✅ Got presigned URL:', upload.photoId)
    
    // Step 2: Upload file directly to S3
    const uploadResponse = await fetch(upload.presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    })
    
    if (!uploadResponse.ok) {
      throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
    }
    
    console.log('📸 Photo uploaded to S3:', photo.id)
    
    // Return photo data for use in entries
    return {
      id: photo.id,
      fileName: photo.fileName,
      fileType: photo.fileType,
      fileSize: photo.fileSize,
      url: photo.url,
      s3Key: photo.s3Key,
      createdAt: photo.createdAt,
      // For compatibility with existing code
      dataUrl: photo.url
    }
    
  } catch (error) {
    console.error('❌ S3 photo upload failed:', error)
    throw new Error(`Photo upload failed: ${error.message}`)
  }
}

/**
 * Upload multiple photos to S3
 * @param {Array<File>} files - Array of files to upload
 * @param {string} userEmail - User's email
 * @returns {Promise<Array>} Array of photo data
 */
export const uploadMultiplePhotosToS3 = async (files, userEmail) => {
  console.log('📤 Starting batch S3 photo upload:', files.length, 'files')
  console.log('📁 Files to upload:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))
  
  const uploadPromises = files.map((file, index) => {
    console.log(`🚀 Starting upload ${index + 1}/${files.length}: ${file.name}`)
    return uploadPhotoToS3(file, userEmail)
  })
  
  try {
    const results = await Promise.allSettled(uploadPromises)
    
    const successful = []
    const failed = []
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ Upload ${index + 1} successful:`, result.value.fileName)
        successful.push(result.value)
      } else {
        console.error(`❌ Upload ${index + 1} failed:`, result.reason.message)
        failed.push({
          file: files[index].name,
          error: result.reason.message
        })
      }
    })
    
    if (failed.length > 0) {
      console.warn('⚠️ Some photos failed to upload:', failed)
      // Still return successful uploads
    }
    
    console.log('✅ Batch upload complete:', successful.length, 'successful,', failed.length, 'failed')
    return successful
    
  } catch (error) {
    console.error('❌ Batch photo upload failed:', error)
    throw error
  }
}

/**
 * Delete a photo from S3
 * @param {string} photoId - Photo ID to delete
 * @param {string} userEmail - User's email
 * @returns {Promise<boolean>} Success status
 */
export const deletePhotoFromS3 = async (photoId, userEmail) => {
  console.log('🗑️ Deleting photo from S3:', photoId)
  
  try {
    const response = await fetch(`${API_BASE_URL}/photos/manage?userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        photoId: photoId
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to delete photo: ${error}`)
    }
    
    console.log('✅ Photo deleted from S3:', photoId)
    return true
    
  } catch (error) {
    console.error('❌ Failed to delete photo from S3:', error)
    throw error
  }
}

/**
 * List all photos for a user
 * @param {string} userEmail - User's email
 * @returns {Promise<Array>} Array of photo data
 */
export const listUserPhotos = async (userEmail) => {
  console.log('📋 Listing user photos from S3')
  
  try {
    const response = await fetch(`${API_BASE_URL}/photos/manage?userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to list photos: ${error}`)
    }
    
    const { photos } = await response.json()
    console.log('✅ Retrieved user photos:', photos.length)
    
    return photos.map(photo => ({
      ...photo,
      // For compatibility with existing code
      dataUrl: photo.url
    }))
    
  } catch (error) {
    console.error('❌ Failed to list user photos:', error)
    throw error
  }
}

/**
 * Compress an image file before upload
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width (default: 1920)
 * @param {number} maxHeight - Maximum height (default: 1080) 
 * @param {number} quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise<File>} Compressed file
 */
export const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        'image/jpeg',
        quality
      )
    }
    
    img.onerror = () => reject(new Error('Failed to load image for compression'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Process and upload photos (with compression)
 * @param {Array} photoDataArray - Array of photo data from upload component
 * @param {string} userEmail - User's email
 * @returns {Promise<Array>} Array of uploaded photo data
 */
export const processAndUploadPhotos = async (photoDataArray, userEmail) => {
  console.log('⚙️ Processing and uploading photos:', photoDataArray.length)
  console.log('📋 Photo data structure:', photoDataArray.map(p => ({
    id: p.id,
    fileName: p.fileName,
    fileSize: p.fileSize,
    hasFile: !!p.file,
    hasDataUrl: !!p.dataUrl
  })))
  
  const processedFiles = []
  
  for (const photoData of photoDataArray) {
    try {
      if (!photoData.file) {
        console.error('❌ Photo data missing file object:', photoData)
        continue
      }
      
      let file = photoData.file
      console.log(`📁 Processing file: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`)
      
      // Compress large images
      if (file.size > 1024 * 1024) { // > 1MB
        console.log(`🗜️ Compressing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
        file = await compressImage(file, 1920, 1080, 0.8)
        console.log(`✅ Compressed to ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      }
      
      processedFiles.push(file)
    } catch (error) {
      console.error('❌ Error processing photo:', photoData.fileName, error)
      // Skip failed files
    }
  }
  
  console.log(`📤 Ready to upload ${processedFiles.length} files to S3`)
  
  if (processedFiles.length === 0) {
    console.warn('⚠️ No valid files to upload to S3')
    return []
  }
  
  // Upload processed files to S3
  const uploadedPhotos = await uploadMultiplePhotosToS3(processedFiles, userEmail)
  console.log(`✅ Successfully uploaded ${uploadedPhotos.length} photos to S3`)
  return uploadedPhotos
}
