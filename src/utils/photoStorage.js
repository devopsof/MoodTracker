// Photo storage utilities for MoodTracker
// Initially using localStorage, can be extended to use cloud storage later

const PHOTOS_STORAGE_KEY = 'moodtracker_photos'

/**
 * Generate a unique photo ID
 */
export const generatePhotoId = () => {
  return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Store photo data in localStorage
 * @param {string} photoId - Unique photo identifier
 * @param {Object} photoData - Photo data object
 */
export const storePhoto = (photoId, photoData) => {
  try {
    const existingPhotos = getStoredPhotos()
    existingPhotos[photoId] = {
      id: photoId,
      dataUrl: photoData.dataUrl,
      fileName: photoData.fileName,
      fileSize: photoData.fileSize,
      fileType: photoData.fileType,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(existingPhotos))
    return photoId
  } catch (error) {
    console.error('Error storing photo:', error)
    // If localStorage is full, try to clean up old photos
    if (error.name === 'QuotaExceededError') {
      cleanupOldPhotos()
      // Try again after cleanup
      try {
        const existingPhotos = getStoredPhotos()
        existingPhotos[photoId] = {
          id: photoId,
          dataUrl: photoData.dataUrl,
          fileName: photoData.fileName,
          fileSize: photoData.fileSize,
          fileType: photoData.fileType,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(existingPhotos))
        return photoId
      } catch (retryError) {
        console.error('Error storing photo after cleanup:', retryError)
        throw new Error('Photo storage is full. Please delete some old photos.')
      }
    }
    throw error
  }
}

/**
 * Retrieve photo data from localStorage
 * @param {string} photoId - Photo identifier
 * @returns {Object|null} Photo data or null if not found
 */
export const getPhoto = (photoId) => {
  try {
    const photos = getStoredPhotos()
    return photos[photoId] || null
  } catch (error) {
    console.error('Error retrieving photo:', error)
    return null
  }
}

/**
 * Get all stored photos
 * @returns {Object} Object containing all stored photos
 */
export const getStoredPhotos = () => {
  try {
    const stored = localStorage.getItem(PHOTOS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error getting stored photos:', error)
    return {}
  }
}

/**
 * Delete a photo from storage
 * @param {string} photoId - Photo identifier
 */
export const deletePhoto = (photoId) => {
  try {
    const existingPhotos = getStoredPhotos()
    delete existingPhotos[photoId]
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(existingPhotos))
  } catch (error) {
    console.error('Error deleting photo:', error)
  }
}

/**
 * Clean up old photos to free storage space
 * Removes photos older than 30 days that aren't referenced in any entry
 */
export const cleanupOldPhotos = () => {
  try {
    const photos = getStoredPhotos()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Get all entries to check which photos are still in use
    const entriesKey = 'moodtracker_entries'
    let usedPhotoIds = new Set()
    
    try {
      const entriesData = localStorage.getItem(entriesKey)
      if (entriesData) {
        const entries = JSON.parse(entriesData)
        Object.values(entries).forEach(userEntries => {
          if (Array.isArray(userEntries)) {
            userEntries.forEach(entry => {
              if (entry.photos && Array.isArray(entry.photos)) {
                entry.photos.forEach(photo => {
                  if (photo.id) usedPhotoIds.add(photo.id)
                })
              }
            })
          }
        })
      }
    } catch (error) {
      console.error('Error checking used photos:', error)
    }
    
    // Remove old unused photos
    const cleanedPhotos = {}
    let removedCount = 0
    
    Object.entries(photos).forEach(([photoId, photoData]) => {
      const photoDate = new Date(photoData.timestamp || 0)
      const isOld = photoDate < thirtyDaysAgo
      const isUsed = usedPhotoIds.has(photoId)
      
      if (!isOld || isUsed) {
        cleanedPhotos[photoId] = photoData
      } else {
        removedCount++
      }
    })
    
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(cleanedPhotos))
    console.log(`Cleaned up ${removedCount} old photos`)
  } catch (error) {
    console.error('Error cleaning up old photos:', error)
  }
}

/**
 * Process and store multiple photos from upload
 * @param {Array} photoDataArray - Array of photo data objects
 * @returns {Array} Array of stored photo objects with IDs
 */
export const storeMultiplePhotos = async (photoDataArray) => {
  const storedPhotos = []
  
  for (const photoData of photoDataArray) {
    try {
      const photoId = generatePhotoId()
      const storedId = storePhoto(photoId, photoData)
      
      storedPhotos.push({
        id: storedId,
        fileName: photoData.fileName,
        fileSize: photoData.fileSize,
        fileType: photoData.fileType,
        url: photoData.dataUrl, // For backward compatibility
        dataUrl: photoData.dataUrl,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error storing photo:', error)
      // Continue with other photos even if one fails
    }
  }
  
  return storedPhotos
}

/**
 * Get storage usage information
 * @returns {Object} Storage usage statistics
 */
export const getStorageInfo = () => {
  try {
    const photos = getStoredPhotos()
    const photoCount = Object.keys(photos).length
    let totalSize = 0
    
    Object.values(photos).forEach(photo => {
      if (photo.fileSize) {
        totalSize += photo.fileSize
      } else if (photo.dataUrl) {
        // Estimate size from base64 data URL
        totalSize += Math.round(photo.dataUrl.length * 0.75)
      }
    })
    
    return {
      photoCount,
      totalSize,
      formattedSize: formatFileSize(totalSize)
    }
  } catch (error) {
    console.error('Error getting storage info:', error)
    return { photoCount: 0, totalSize: 0, formattedSize: '0 B' }
  }
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
