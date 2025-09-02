// localStorage utility functions for MoodTracker

// Keys for different data types
const STORAGE_KEYS = {
  USER: 'moodtracker_user',
  ENTRIES: 'moodtracker_entries_'
}

/**
 * Save user data to localStorage
 * @param {Object} user - User object to save
 */
export const saveUser = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  } catch (error) {
    console.error('Failed to save user to localStorage:', error)
  }
}

/**
 * Load user data from localStorage
 * @returns {Object|null} User object or null if not found
 */
export const loadUser = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER)
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Failed to load user from localStorage:', error)
    return null
  }
}

/**
 * Clear user data from localStorage
 */
export const clearUser = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER)
  } catch (error) {
    console.error('Failed to clear user from localStorage:', error)
  }
}

/**
 * Get storage key for user-specific entries
 * @param {string} userEmail - User's email address
 * @returns {string} Storage key for the user's entries
 */
const getUserEntriesKey = (userEmail) => {
  return `${STORAGE_KEYS.ENTRIES}${userEmail}`
}

/**
 * Save mood entries for a specific user
 * @param {string} userEmail - User's email address
 * @param {Array} entries - Array of mood entries
 */
export const saveEntries = (userEmail, entries) => {
  try {
    const key = getUserEntriesKey(userEmail)
    localStorage.setItem(key, JSON.stringify(entries))
  } catch (error) {
    console.error('Failed to save entries to localStorage:', error)
  }
}

/**
 * Load mood entries for a specific user
 * @param {string} userEmail - User's email address
 * @returns {Array} Array of mood entries or empty array if not found
 */
export const loadEntries = (userEmail) => {
  try {
    const key = getUserEntriesKey(userEmail)
    const entriesData = localStorage.getItem(key)
    return entriesData ? JSON.parse(entriesData) : []
  } catch (error) {
    console.error('Failed to load entries from localStorage:', error)
    return []
  }
}

/**
 * Add a new entry for a specific user
 * @param {string} userEmail - User's email address
 * @param {Object} newEntry - New mood entry to add
 * @returns {Array} Updated array of entries
 */
export const addEntry = (userEmail, newEntry) => {
  try {
    const existingEntries = loadEntries(userEmail)
    const updatedEntries = [newEntry, ...existingEntries]
    saveEntries(userEmail, updatedEntries)
    return updatedEntries
  } catch (error) {
    console.error('Failed to add entry:', error)
    return loadEntries(userEmail)
  }
}

/**
 * Clear all entries for a specific user
 * @param {string} userEmail - User's email address
 */
export const clearEntries = (userEmail) => {
  try {
    const key = getUserEntriesKey(userEmail)
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to clear entries from localStorage:', error)
  }
}

/**
 * Get storage statistics
 * @returns {Object} Storage usage information
 */
export const getStorageInfo = () => {
  try {
    let totalSize = 0
    let itemCount = 0
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith('moodtracker_')) {
        totalSize += localStorage.getItem(key).length
        itemCount++
      }
    }
    
    return {
      totalSize,
      itemCount,
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100
    }
  } catch (error) {
    console.error('Failed to get storage info:', error)
    return { totalSize: 0, itemCount: 0, totalSizeKB: 0 }
  }
}
