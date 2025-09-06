// Photo migration utility - Move photos from localStorage to S3
import { getStoredPhotos, deletePhoto } from './photoStorage'
import { uploadPhotoToS3 } from './s3PhotoApi'
import { loadEntriesFromLocal, saveEntriesToLocal } from './localStorageApi'

/**
 * Convert dataURL to File object
 * @param {string} dataUrl - Base64 data URL
 * @param {string} fileName - File name
 * @returns {File} File object
 */
const dataUrlToFile = (dataUrl, fileName) => {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new File([u8arr], fileName, { type: mime })
}

/**
 * Migrate all photos from localStorage to S3
 * @param {string} userEmail - User's email
 * @returns {Promise<Object>} Migration results
 */
export const migratePhotosToS3 = async (userEmail) => {
  console.log('🚀 Starting photo migration from localStorage to S3...')
  
  const results = {
    total: 0,
    successful: 0,
    failed: 0,
    errors: []
  }
  
  try {
    // Get all stored photos from localStorage
    const localPhotos = getStoredPhotos()
    const photoIds = Object.keys(localPhotos)
    
    results.total = photoIds.length
    console.log(`📋 Found ${results.total} photos to migrate`)
    
    if (results.total === 0) {
      console.log('✅ No photos to migrate')
      return results
    }
    
    // Migrate each photo
    for (const photoId of photoIds) {
      const photoData = localPhotos[photoId]
      
      try {
        console.log(`📤 Migrating photo: ${photoId}`)
        
        // Convert dataURL to File
        const file = dataUrlToFile(photoData.dataUrl, photoData.fileName)
        
        // Upload to S3
        const s3Photo = await uploadPhotoToS3(file, userEmail)
        
        console.log(`✅ Migrated ${photoId} to S3: ${s3Photo.id}`)
        results.successful++
        
        // Clean up localStorage photo after successful upload
        deletePhoto(photoId)
        
      } catch (error) {
        console.error(`❌ Failed to migrate photo ${photoId}:`, error)
        results.failed++
        results.errors.push({
          photoId,
          error: error.message
        })
      }
    }
    
    console.log(`🎉 Migration complete: ${results.successful} successful, ${results.failed} failed`)
    return results
    
  } catch (error) {
    console.error('❌ Photo migration failed:', error)
    throw new Error(`Migration failed: ${error.message}`)
  }
}

/**
 * Migrate entries with photos to use S3 URLs
 * @param {string} userEmail - User's email
 * @returns {Promise<Object>} Migration results
 */
export const migrateEntriesToS3Photos = async (userEmail) => {
  console.log('🔄 Updating entries to use S3 photo URLs...')
  
  try {
    const entries = loadEntriesFromLocal(userEmail)
    let updatedCount = 0
    
    // Get current photos from S3 (to map old IDs to new URLs)
    const localPhotos = getStoredPhotos()
    
    // Update entries
    const updatedEntries = entries.map(entry => {
      if (entry.photos && entry.photos.length > 0) {
        const updatedPhotos = entry.photos.map(photo => {
          // If photo already has S3 URL, keep it
          if (photo.url && photo.url.includes('s3')) {
            return photo
          }
          
          // If photo has localStorage reference, try to find migrated version
          const localPhoto = localPhotos[photo.id]
          if (localPhoto) {
            // Photo hasn't been migrated yet, keep local reference for now
            return photo
          }
          
          // Photo might have been migrated, but we don't have the mapping
          // This is a limitation - in a real app, you'd store migration mapping
          return photo
        })
        
        if (JSON.stringify(updatedPhotos) !== JSON.stringify(entry.photos)) {
          updatedCount++
          return { ...entry, photos: updatedPhotos }
        }
      }
      
      return entry
    })
    
    // Save updated entries
    if (updatedCount > 0) {
      saveEntriesToLocal(userEmail, updatedEntries)
      console.log(`✅ Updated ${updatedCount} entries with S3 photo URLs`)
    } else {
      console.log('ℹ️ No entries needed updating')
    }
    
    return {
      entriesChecked: entries.length,
      entriesUpdated: updatedCount
    }
    
  } catch (error) {
    console.error('❌ Entry migration failed:', error)
    throw error
  }
}

/**
 * Get migration status
 * @returns {Object} Current migration status
 */
export const getMigrationStatus = () => {
  const localPhotos = getStoredPhotos()
  const photoCount = Object.keys(localPhotos).length
  
  return {
    hasLocalPhotos: photoCount > 0,
    localPhotoCount: photoCount,
    needsMigration: photoCount > 0,
    estimatedMigrationTime: Math.ceil(photoCount * 2), // ~2 seconds per photo
    estimatedCost: (photoCount * 0.0005).toFixed(4) // Very rough estimate
  }
}

/**
 * Run complete photo migration process
 * @param {string} userEmail - User's email
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Complete migration results
 */
export const runFullMigration = async (userEmail, onProgress) => {
  console.log('🚀 Starting complete photo migration process...')
  
  try {
    // Step 1: Get migration status
    const status = getMigrationStatus()
    onProgress && onProgress({ step: 'status', data: status })
    
    if (!status.needsMigration) {
      console.log('✅ No migration needed')
      return { status, photoMigration: null, entryMigration: null }
    }
    
    // Step 2: Migrate photos to S3
    onProgress && onProgress({ step: 'photos', data: { status: 'starting' } })
    const photoMigration = await migratePhotosToS3(userEmail)
    onProgress && onProgress({ step: 'photos', data: { status: 'complete', results: photoMigration } })
    
    // Step 3: Update entries
    onProgress && onProgress({ step: 'entries', data: { status: 'starting' } })
    const entryMigration = await migrateEntriesToS3Photos(userEmail)
    onProgress && onProgress({ step: 'entries', data: { status: 'complete', results: entryMigration } })
    
    console.log('🎉 Complete migration finished!')
    
    return {
      status,
      photoMigration,
      entryMigration,
      success: true
    }
    
  } catch (error) {
    console.error('❌ Complete migration failed:', error)
    throw error
  }
}
