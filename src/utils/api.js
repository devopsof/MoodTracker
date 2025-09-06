// API utility functions for MoodTracker AWS backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://e7a99njzra.execute-api.us-east-1.amazonaws.com/prod'

/**
 * Add a new mood entry via API
 * @param {Object} entry - New mood entry to add
 * @param {string} userEmail - User's email for identification
 * @returns {Promise<Object>} Created entry response
 */
export const createEntry = async (entry, userEmail) => {
  // console.log('🚀 createEntry called:', { entry, userEmail }) // Debug logging disabled
  
  try {
    const requestBody = {
      mood: entry.mood,
      intensity: entry.intensity || null,
      note: entry.note || '',
      tags: entry.tags || [],
      promptId: entry.promptId || null,
      photos: entry.photos || [], // Include photos in API request
      date: entry.date || new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      createdAt: entry.createdAt || new Date().toISOString(),
      timestamp: entry.timestamp || new Date().toISOString()
    }
    
    // console.log('📝 Request body:', requestBody) // Debug logging disabled
    
    const response = await fetch(`${API_BASE_URL}/entries?userEmail=${encodeURIComponent(userEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header with JWT token when Cognito is set up
        // 'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(requestBody)
    })

    // console.log('📡 Response status:', response.status) // Debug logging disabled
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()
    // console.log('✅ Entry created successfully:', data) // Debug logging disabled
    
    // Transform API response to match existing UI format
    return {
      id: data.entry.id,
      mood: data.entry.mood,
      intensity: data.entry.intensity,
      note: data.entry.note,
      tags: data.entry.tags || [],
      promptId: data.entry.promptId,
      photos: data.entry.photos || [], // Include photos in response
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
  // console.log('📥 loadEntries called for:', userEmail) // Debug logging disabled
  
  try {
    const url = `${API_BASE_URL}/entries?userEmail=${encodeURIComponent(userEmail)}`
    // console.log('🌍 Fetching from URL:', url) // Debug logging disabled
    
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
    // console.log('✅ Entries loaded successfully:', data) // Debug logging disabled
    
    // Return entries in the format expected by UI, sorted by creation time (newest first)
    const entries = data.entries || []
    const sortedEntries = entries.sort((a, b) => {
      // Sort by createdAt timestamp, newest first
      const timeA = new Date(a.createdAt || a.timestamp || 0).getTime()
      const timeB = new Date(b.createdAt || b.timestamp || 0).getTime()
      return timeB - timeA
    })
    
    // console.log('📋 Sorted entries:', sortedEntries) // Debug logging disabled
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

/**
 * Analyze sentiment of text using AI
 * @param {string} text - Text to analyze
 * @param {string} userEmail - User's email for identification
 * @returns {Promise<Object>} Sentiment analysis results
 */
export const analyzeSentiment = async (text, userEmail) => {
  console.log('🤖 analyzeSentiment called for:', userEmail)
  
  try {
    // HUGGING FACE IMPLEMENTATION 🤗
    console.log('🤗 Using Hugging Face AI for mood analysis!')
    
    const huggingFaceAnalysis = await analyzeMoodWithHuggingFace(text)
    console.log('✅ Hugging Face analysis completed:', huggingFaceAnalysis)
    
    return {
      success: true,
      analysis: huggingFaceAnalysis
    }
    
    // REAL AWS IMPLEMENTATION - Uncomment when backend is deployed
    /*
    const requestBody = {
      text: text.trim(),
      userEmail: userEmail
    }
    
    console.log('📝 Sentiment analysis request:', requestBody)
    
    const response = await fetch(`${API_BASE_URL}/sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header with JWT token when Cognito is set up
        // 'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Sentiment API Error:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }
    
    const data = await response.json()
    console.log('✅ Sentiment analysis completed:', data)
    
    return data
    */
  } catch (error) {
    console.error('❌ Failed to analyze sentiment:', error)
    throw new Error(`Failed to analyze sentiment: ${error.message}`)
  }
}

// Hugging Face AI sentiment analysis function (FREE!) 🤗
async function analyzeMoodWithHuggingFace(text) {
  try {
    console.log('🤗 Starting Hugging Face analysis for:', text.substring(0, 50) + '...')
    
    // Use multiple Hugging Face models for better accuracy
    const [sentimentResult, emotionResult] = await Promise.all([
      // Model 1: Sentiment Analysis (positive/negative/neutral)
      callHuggingFaceAPI(
        'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
        text
      ),
      // Model 2: Emotion Detection (joy, sadness, anger, etc.)
      callHuggingFaceAPI(
        'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base',
        text
      )
    ])
    
    console.log('🤖 Sentiment result:', sentimentResult)
    console.log('😊 Emotion result:', emotionResult)
    
    // Convert Hugging Face results to our format
    const analysis = convertHuggingFaceToMoodAnalysis(sentimentResult, emotionResult, text)
    
    return analysis
    
  } catch (error) {
    console.warn('⚠️ Hugging Face API failed, using fallback:', error.message)
    
    // Fallback to our keyword analysis if Hugging Face fails
    return createMockSentimentAnalysis(text)
  }
}

// Call Hugging Face API with retry logic
async function callHuggingFaceAPI(modelUrl, text, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Using public inference API (no token needed for basic usage)
        },
        body: JSON.stringify({
          inputs: text.substring(0, 500) // Limit text length
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        return data
      } else if (response.status === 503 && attempt < retries) {
        // Model loading, wait and retry
        console.log('🔄 Model loading, retrying in 2 seconds...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        continue
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      if (attempt === retries) throw error
      console.log(`🔄 Retry ${attempt + 1}/${retries} after error:`, error.message)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

// Convert Hugging Face results to our mood analysis format
function convertHuggingFaceToMoodAnalysis(sentimentData, emotionData, originalText) {
  // Process sentiment data
  let sentiment = 'NEUTRAL'
  let confidence = 60
  let suggestedMood = 3
  
  if (sentimentData && Array.isArray(sentimentData) && sentimentData.length > 0) {
    const topSentiment = sentimentData[0] // Highest confidence result
    confidence = Math.round(topSentiment.score * 100)
    
    // Map Hugging Face labels to our format
    switch (topSentiment.label) {
      case 'LABEL_2':
      case 'POSITIVE':
        sentiment = 'POSITIVE'
        suggestedMood = confidence > 80 ? 5 : 4
        break
      case 'LABEL_0':
      case 'NEGATIVE':
        sentiment = 'NEGATIVE'
        suggestedMood = confidence > 80 ? 1 : 2
        break
      default:
        sentiment = 'NEUTRAL'
        suggestedMood = 3
    }
  }
  
  // Process emotion data
  let emotions = []
  if (emotionData && Array.isArray(emotionData) && emotionData.length > 0) {
    emotions = emotionData
      .sort((a, b) => b.score - a.score) // Sort by confidence
      .slice(0, 3) // Top 3 emotions
      .map(emotion => ({
        label: emotion.label.toUpperCase(),
        score: emotion.score
      }))
  }
  
  // If no emotions detected, infer from sentiment
  if (emotions.length === 0) {
    switch (sentiment) {
      case 'POSITIVE':
        emotions = [{ label: 'JOY', score: 0.8 }]
        break
      case 'NEGATIVE':
        emotions = [{ label: 'SADNESS', score: 0.8 }]
        break
      default:
        emotions = [{ label: 'NEUTRAL', score: 0.7 }]
    }
  }
  
  return {
    sentiment: sentiment,
    sentimentScores: {
      Positive: sentiment === 'POSITIVE' ? confidence / 100 : 0.1,
      Negative: sentiment === 'NEGATIVE' ? confidence / 100 : 0.1,
      Neutral: sentiment === 'NEUTRAL' ? confidence / 100 : 0.6,
      Mixed: 0.1
    },
    suggestedMood: suggestedMood,
    confidence: confidence,
    emotions: emotions,
    textAnalyzed: originalText.substring(0, 100) + (originalText.length > 100 ? '...' : ''),
    timestamp: new Date().toISOString(),
    analyzedBy: 'Hugging-Face-AI'
  }
}

// Mock sentiment analysis function (for testing without AWS backend)
function createMockSentimentAnalysis(text) {
  const lowerText = text.toLowerCase()
  
  // Simple keyword-based analysis for demo
  const positiveWords = ['happy', 'great', 'amazing', 'wonderful', 'excited', 'love', 'fantastic', 'awesome', 'good', 'excellent', 'perfect', 'beautiful', 'successful', 'proud', 'grateful', 'blessed', 'joy', 'delighted']
  const negativeWords = ['sad', 'terrible', 'awful', 'bad', 'horrible', 'upset', 'angry', 'frustrated', 'disappointed', 'depressed', 'worried', 'anxious', 'hate', 'annoyed', 'stressed', 'tired', 'exhausted']
  const neutralWords = ['okay', 'fine', 'normal', 'average', 'usual', 'typical', 'regular']
  
  let positiveCount = 0
  let negativeCount = 0
  let neutralCount = 0
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++
  })
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++
  })
  
  neutralWords.forEach(word => {
    if (lowerText.includes(word)) neutralCount++
  })
  
  // Determine sentiment and mood
  let sentiment, suggestedMood, confidence
  let emotions = []
  
  if (positiveCount > negativeCount && positiveCount > 0) {
    sentiment = 'POSITIVE'
    suggestedMood = positiveCount >= 2 ? 5 : 4
    confidence = Math.min(70 + (positiveCount * 10), 95)
    emotions = [
      { label: 'JOY', score: 0.8 },
      { label: 'EXCITEMENT', score: 0.6 }
    ]
  } else if (negativeCount > positiveCount && negativeCount > 0) {
    sentiment = 'NEGATIVE'
    suggestedMood = negativeCount >= 2 ? 1 : 2
    confidence = Math.min(70 + (negativeCount * 10), 95)
    emotions = [
      { label: 'SADNESS', score: 0.7 },
      { label: 'FRUSTRATION', score: 0.5 }
    ]
  } else if (neutralCount > 0) {
    sentiment = 'NEUTRAL'
    suggestedMood = 3
    confidence = 75
    emotions = [
      { label: 'NEUTRAL', score: 0.8 }
    ]
  } else {
    // Default neutral if no keywords found
    sentiment = 'NEUTRAL'
    suggestedMood = 3
    confidence = 60
    emotions = [
      { label: 'NEUTRAL', score: 0.6 }
    ]
  }
  
  return {
    sentiment: sentiment,
    sentimentScores: {
      Positive: sentiment === 'POSITIVE' ? confidence / 100 : 0.1,
      Negative: sentiment === 'NEGATIVE' ? confidence / 100 : 0.1,
      Neutral: sentiment === 'NEUTRAL' ? confidence / 100 : 0.6,
      Mixed: 0.1
    },
    suggestedMood: suggestedMood,
    confidence: confidence,
    emotions: emotions,
    textAnalyzed: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    timestamp: new Date().toISOString(),
    analyzedBy: 'Mock-AI-System'
  }
}

/**
 * Fetch analytics data from API
 * @param {string} userEmail - User's email for identification
 * @param {number} days - Number of days to analyze (default 7)
 * @returns {Promise<Object>} Analytics data
 */
export const loadAnalytics = async (userEmail, days = 7) => {
  console.log('📊 loadAnalytics called for:', userEmail, 'days:', days)
  
  try {
    const url = `${API_BASE_URL}/analytics?userEmail=${encodeURIComponent(userEmail)}&days=${days}`
    console.log('🌍 Fetching analytics from URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Add Authorization header with JWT token when Cognito is set up
        // 'Authorization': `Bearer ${getAuthToken()}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Analytics API Error:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Analytics loaded successfully:', data)
    
    return data
  } catch (error) {
    console.error('❌ Failed to load analytics:', error)
    throw new Error(`Failed to load analytics: ${error.message}`)
  }
}
