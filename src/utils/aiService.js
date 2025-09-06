/**
 * AI Service for therapy conversations using secure Lambda backend
 * This service calls the secure Lambda function that handles AI API calls
 */

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://e7a99njzra.execute-api.us-east-1.amazonaws.com/prod'

// Check if Lambda AI service is available
function isAIServiceAvailable() {
  return !!API_BASE_URL
}

/**
 * Get AI therapy response using secure Lambda backend
 * @param {string} userMessage - User's message
 * @param {Object} moodContext - User's mood context
 * @param {Array} conversationHistory - Previous messages
 * @returns {Promise<string>} AI response
 */
export const getAITherapyResponse = async (userMessage, moodContext = null, conversationHistory = []) => {
  try {
    if (!isAIServiceAvailable()) {
      console.log('⚠️ AI service not configured')
      return "I'm currently offline for maintenance. Your feelings are still valid and important. Consider reaching out to a friend, family member, or mental health professional if you need immediate support."
    }
    
    console.log('🤖 Calling secure AI Lambda function')
    
    // Call the secure Lambda function
    const response = await fetch(`${API_BASE_URL}/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userMessage,
        moodContext,
        conversationHistory
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`✅ AI response received from ${data.provider?.toUpperCase() || 'Lambda'}`)
    
    return data.response
    
  } catch (error) {
    console.error('❌ AI service error:', error)
    
    // Provide helpful fallback responses based on error type
    if (error.message.includes('fetch')) {
      return "I'm having trouble connecting right now. Your feelings are still valid and important. Would you like to try again in a moment, or is there something specific you'd like to talk about?"
    }
    
    return "I'm having trouble responding right now, but I want you to know that your feelings are valid. Sometimes it helps to write down your thoughts or talk to someone you trust. What's the most important thing you'd like support with today?"
  }
}

// All API implementation has moved to secure Lambda function
// This keeps API keys secure on the server side

export default {
  getAITherapyResponse
}
