// API utility functions for MoodTracker AWS backend

const API_BASE_URL = 'https://e7a99njzra.execute-api.us-east-1.amazonaws.com/dev'

/**
 * Add a new mood entry via API
 * @param {Object} entry - New mood entry to add
 * @param {string} userEmail - User's email for identification
 * @returns {Promise<Object>} Created entry response
 */
export const createEntry = async (entry, userEmail) => {
  console.log('🚀 createEntry called:', { entry, userEmail })
  
  try {
    const requestBody = {
      mood: entry.mood,
      note: entry.note || '',
      date: entry.date || new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    
    console.log('📝 Request body:', requestBody)
    console.log('📧 User email:', userEmail)
    
    const response = await fetch(`${API_BASE_URL}/entries?userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header with JWT token when Cognito is set up
        // 'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', response.headers)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Entry created successfully:', data)
    
    // Transform API response to match existing UI format
    return {
      id: data.entry.id,
      mood: data.entry.mood,
      note: data.entry.note,
      date: data.entry.date,
      createdAt: data.entry.createdAt
    }
  } catch (error) {
    console.error('❌ Failed to create entry:', error)
    throw new Error(`Failed to create entry: ${error.message}`)
  }
}

/**
 * Load mood entries from API
 * @param {string} userEmail - User's email for identification
 * @returns {Promise<Array>} Array of mood entries
 */
export const loadEntries = async (userEmail) => {
  console.log('📥 loadEntries called for:', userEmail)
  
  try {
    const url = `${API_BASE_URL}/entries?userEmail=${encodeURIComponent(userEmail)}`
    console.log('🌍 Fetching from URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header with JWT token when Cognito is set up
        // 'Authorization': `Bearer ${getAuthToken()}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Entries loaded successfully:', data)
    
    // Return entries in the format expected by UI, sorted by creation time (newest first)
    const entries = data.entries || []
    const sortedEntries = entries.sort((a, b) => {
      // Sort by createdAt timestamp, newest first
      const timeA = new Date(a.createdAt || a.timestamp || 0).getTime()
      const timeB = new Date(b.createdAt || b.timestamp || 0).getTime()
      return timeB - timeA
    })
    
    console.log('📋 Sorted entries:', sortedEntries)
    return sortedEntries
  } catch (error) {
    console.error('❌ Failed to load entries:', error)
    // Return empty array on error so UI doesn't break
    return []
  }
}

/**
 * Add a new entry (wrapper function to match localStorage API)
 * @param {string} userEmail - User's email address
 * @param {Object} newEntry - New mood entry to add
 * @returns {Promise<Array>} Updated array of entries
 */
export const addEntry = async (userEmail, newEntry) => {
  try {
    // Create the entry via API
    await createEntry(newEntry, userEmail)
    
    // Reload all entries to get the updated list
    const updatedEntries = await loadEntries(userEmail)
    return updatedEntries
  } catch (error) {
    console.error('❌ Failed to add entry:', error)
    throw error
  }
}

// TODO: Implement when authentication is added
// const getAuthToken = () => {
//   // Get JWT token from Cognito/Auth context
//   return localStorage.getItem('authToken')
// }

// Placeholder functions to match localStorage API (not implemented yet)
export const saveEntries = (userEmail, entries) => {
  console.log('📝 saveEntries called (API mode - not implemented)')
}

export const clearEntries = (userEmail) => {
  console.log('🗑️ clearEntries called (API mode - not implemented)')
}

export const getStorageInfo = () => {
  return { totalSize: 0, itemCount: 0, totalSizeKB: 0 }
}
