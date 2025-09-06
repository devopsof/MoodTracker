// Local storage API for MoodTracker entries
// Fallback when API doesn't support photos yet

const ENTRIES_KEY = 'moodtracker_entries'

/**
 * Save entries to localStorage
 * @param {string} userEmail - User's email
 * @param {Array} entries - Array of entries
 */
export const saveEntriesToLocal = (userEmail, entries) => {
  try {
    const allEntries = getAllLocalEntries()
    const userKey = userEmail.replace(/[^a-zA-Z0-9]/g, '_')
    allEntries[userKey] = entries
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(allEntries))
  } catch (error) {
    console.error('Error saving entries to localStorage:', error)
  }
}

/**
 * Load entries from localStorage
 * @param {string} userEmail - User's email
 * @returns {Array} Array of entries
 */
export const loadEntriesFromLocal = (userEmail) => {
  try {
    const allEntries = getAllLocalEntries()
    const userKey = userEmail.replace(/[^a-zA-Z0-9]/g, '_')
    return allEntries[userKey] || []
  } catch (error) {
    console.error('Error loading entries from localStorage:', error)
    return []
  }
}

/**
 * Add entry to localStorage
 * @param {string} userEmail - User's email
 * @param {Object} entry - Entry to add
 */
export const addEntryToLocal = (userEmail, entry) => {
  try {
    const entries = loadEntriesFromLocal(userEmail)
    const newEntry = {
      ...entry,
      id: entry.id || Date.now(),
      timestamp: entry.timestamp || new Date().toISOString()
    }
    entries.unshift(newEntry) // Add to beginning (newest first)
    saveEntriesToLocal(userEmail, entries)
    return newEntry
  } catch (error) {
    console.error('Error adding entry to localStorage:', error)
    throw error
  }
}

/**
 * Update entry in localStorage
 * @param {string} userEmail - User's email
 * @param {Object} updatedEntry - Updated entry
 */
export const updateEntryInLocal = (userEmail, updatedEntry) => {
  try {
    const entries = loadEntriesFromLocal(userEmail)
    const index = entries.findIndex(entry => entry.id === updatedEntry.id)
    if (index !== -1) {
      entries[index] = { ...entries[index], ...updatedEntry }
      saveEntriesToLocal(userEmail, entries)
    }
  } catch (error) {
    console.error('Error updating entry in localStorage:', error)
    throw error
  }
}

/**
 * Get all entries from localStorage
 * @returns {Object} All entries organized by user
 */
const getAllLocalEntries = () => {
  try {
    const stored = localStorage.getItem(ENTRIES_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error getting all entries from localStorage:', error)
    return {}
  }
}

/**
 * Check if an entry has photos
 * @param {Object} entry - Entry to check
 * @returns {boolean} True if entry has photos
 */
export const entryHasPhotos = (entry) => {
  return entry.photos && Array.isArray(entry.photos) && entry.photos.length > 0
}

/**
 * Merge API entries with local entries (prioritizing local for entries with photos)
 * @param {Array} apiEntries - Entries from API
 * @param {Array} localEntries - Entries from localStorage
 * @returns {Array} Merged entries
 */
/**
 * Check if two entries are duplicates (same content, different IDs)
 */
const areEntriesDuplicates = (entry1, entry2) => {
  // If IDs are the same, they're the same entry
  if (entry1.id === entry2.id) return true
  
  // Get timestamps
  const time1 = new Date(entry1.createdAt || entry1.timestamp || 0).getTime()
  const time2 = new Date(entry2.createdAt || entry2.timestamp || 0).getTime()
  const timeDiff = Math.abs(time1 - time2)
  
  console.log('🔍 Checking for duplicates:', {
    entry1: {
      id: entry1.id,
      mood: entry1.mood,
      intensity: entry1.intensity,
      note: entry1.note?.substring(0, 20) + '...',
      tags: entry1.tags,
      timestamp: entry1.createdAt || entry1.timestamp,
      hasPhotos: entryHasPhotos(entry1)
    },
    entry2: {
      id: entry2.id,
      mood: entry2.mood,
      intensity: entry2.intensity,
      note: entry2.note?.substring(0, 20) + '...',
      tags: entry2.tags,
      timestamp: entry2.createdAt || entry2.timestamp,
      hasPhotos: entryHasPhotos(entry2)
    },
    timeDiff: timeDiff + 'ms'
  })
  
  // Special case: If entries have EXACTLY the same timestamp (created at same millisecond)
  // This catches the double-save issue where localStorage and API save the same entry
  if (timeDiff === 0) {
    console.log('❗ EXACT TIMESTAMP MATCH - likely duplicate from double-save')
    return true
  }
  
  // More flexible time range - within 30 seconds for other cases
  if (timeDiff < 30000) {
    // Check if key properties match (more lenient)
    const sameMood = entry1.mood === entry2.mood
    const sameIntensity = entry1.intensity === entry2.intensity
    const sameNote = (entry1.note || '').trim() === (entry2.note || '').trim()
    
    // Tags comparison - handle undefined/null
    const tags1 = (entry1.tags || []).sort()
    const tags2 = (entry2.tags || []).sort()
    const sameTags = JSON.stringify(tags1) === JSON.stringify(tags2)
    
    const sameContent = sameMood && sameIntensity && sameNote && sameTags
    
    console.log('🔄 Content comparison:', {
      sameMood,
      sameIntensity,
      sameNote,
      sameTags,
      overall: sameContent
    })
    
    if (sameContent) {
      console.log('✅ DUPLICATE DETECTED:', {
        entry1Id: entry1.id,
        entry2Id: entry2.id,
        timeDiff: timeDiff + 'ms',
        entry1HasPhotos: entryHasPhotos(entry1),
        entry2HasPhotos: entryHasPhotos(entry2)
      })
      return true
    }
  }
  
  return false
}

export const mergeEntries = (apiEntries = [], localEntries = []) => {
  console.log('🔀 Starting merge process:', {
    apiEntriesCount: apiEntries.length,
    localEntriesCount: localEntries.length
  })
  
  const allEntries = [...apiEntries, ...localEntries]
  const uniqueEntries = []
  
  // Deduplicate entries
  allEntries.forEach(entry => {
    const existingIndex = uniqueEntries.findIndex(existing => areEntriesDuplicates(existing, entry))
    
    if (existingIndex === -1) {
      // No duplicate found, add the entry
      console.log('➕ Adding unique entry:', {
        id: entry.id,
        hasPhotos: entryHasPhotos(entry),
        photosCount: entry.photos?.length || 0,
        source: apiEntries.includes(entry) ? 'API' : 'localStorage'
      })
      uniqueEntries.push(entry)
    } else {
      // Found a duplicate, decide which one to keep
      const existing = uniqueEntries[existingIndex]
      const entryHasPhotosFlag = entryHasPhotos(entry)
      const existingHasPhotosFlag = entryHasPhotos(existing)
      
      console.log('🔄 Processing duplicate:', {
        existingId: existing.id,
        newId: entry.id,
        existingHasPhotos: existingHasPhotosFlag,
        newHasPhotos: entryHasPhotosFlag,
        existingSource: apiEntries.includes(existing) ? 'API' : 'localStorage',
        newSource: apiEntries.includes(entry) ? 'API' : 'localStorage'
      })
      
      // Keep the version with photos, or the localStorage version if both have photos
      if (entryHasPhotosFlag && !existingHasPhotosFlag) {
        // New entry has photos, existing doesn't - replace
        console.log('➡️ Replacing with photo version')
        uniqueEntries[existingIndex] = entry
      } else if (entryHasPhotosFlag && existingHasPhotosFlag) {
        // Both have photos - prefer localStorage version (more likely to have S3 URLs)
        if (!apiEntries.includes(entry)) {
          console.log('➡️ Replacing with localStorage version (both have photos)')
          uniqueEntries[existingIndex] = entry
        } else {
          console.log('➡️ Keeping existing localStorage version')
        }
      } else {
        console.log('➡️ Keeping existing entry')
      }
    }
  })
  
  // Sort by timestamp (newest first)
  const result = uniqueEntries.sort((a, b) => {
    const timeA = new Date(a.createdAt || a.timestamp || 0).getTime()
    const timeB = new Date(b.createdAt || b.timestamp || 0).getTime()
    return timeB - timeA
  })
  
  console.log('✅ Merge complete:', {
    originalCount: allEntries.length,
    uniqueCount: result.length,
    duplicatesRemoved: allEntries.length - result.length,
    entriesWithPhotos: result.filter(entryHasPhotos).length
  })
  
  return result
}

/**
 * Clean up duplicate entries for a user (manual cleanup function)
 * @param {string} userEmail - User's email
 */
export const cleanupDuplicateEntries = (userEmail) => {
  console.log('🧽 Starting manual duplicate cleanup for:', userEmail)
  
  const localEntries = loadEntriesFromLocal(userEmail)
  console.log('📁 Found entries in localStorage:', localEntries.length)
  
  if (localEntries.length === 0) return
  
  // Apply the same deduplication logic
  const uniqueEntries = []
  
  localEntries.forEach(entry => {
    const existingIndex = uniqueEntries.findIndex(existing => areEntriesDuplicates(existing, entry))
    
    if (existingIndex === -1) {
      uniqueEntries.push(entry)
    } else {
      const existing = uniqueEntries[existingIndex]
      
      console.log('🗝 Found duplicate in localStorage:', {
        existingId: existing.id,
        duplicateId: entry.id,
        existingHasPhotos: entryHasPhotos(existing),
        duplicateHasPhotos: entryHasPhotos(entry)
      })
      
      // Keep the version with photos
      if (entryHasPhotos(entry) && !entryHasPhotos(existing)) {
        uniqueEntries[existingIndex] = entry
        console.log('➡️ Keeping version with photos')
      } else {
        console.log('➡️ Keeping existing version')
      }
    }
  })
  
  const duplicatesRemoved = localEntries.length - uniqueEntries.length
  
  if (duplicatesRemoved > 0) {
    console.log('🧽 Cleanup result:', {
      originalCount: localEntries.length,
      cleanedCount: uniqueEntries.length,
      duplicatesRemoved: duplicatesRemoved
    })
    
    // Save the cleaned entries
    saveEntriesToLocal(userEmail, uniqueEntries)
    console.log('✅ Cleaned localStorage entries saved')
  } else {
    console.log('✅ No duplicates found in localStorage')
  }
  
  return duplicatesRemoved
}
