// Greeting utility functions for personalized user experience

/**
 * Get time-based greeting
 * @returns {string} Time-based greeting
 */
export const getTimeBasedGreeting = () => {
  const hour = new Date().getHours()
  
  if (hour < 5) return 'Good night'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 22) return 'Good evening'
  return 'Good night'
}

/**
 * Get inspirational greeting messages
 * @returns {Array} Array of inspirational messages
 */
export const getInspirationalMessages = () => [
  "Keep shining", 
  "You're doing great",
  "Stay awesome", 
  "Keep pushing forward",
  "You've got this",
  "Stay strong", 
  "Keep growing",
  "Believe in yourself",
  "You're amazing",
  "Stay positive",
  "Keep exploring",
  "Trust the journey",
  "You're unstoppable",
  "Keep dreaming",
  "Stay curious",
  "You're incredible",
  "Keep creating",
  "Stay inspired",
  "You're wonderful",
  "Keep thriving"
]

/**
 * Get mood-specific greeting messages
 * @returns {Array} Array of mood-focused messages  
 */
export const getMoodMessages = () => [
  "How are you feeling today",
  "What's on your mind today", 
  "Ready to track your mood",
  "Let's check in on your emotions",
  "Time to reflect on your day",
  "How's your energy today",
  "What emotions are you experiencing",
  "Let's explore your feelings",
  "Ready to capture your mood",
  "How's your mental space today"
]

/**
 * Get casual greeting messages
 * @returns {Array} Array of casual greetings
 */
export const getCasualMessages = () => [
  "Welcome back",
  "Great to see you again",
  "Hello there", 
  "Hey there",
  "Nice to see you",
  "Welcome",
  "Glad you're here",
  "Hope you're well",
  "Ready for today",
  "Let's get started"
]

/**
 * Get random greeting message for user
 * @param {string} username - User's display name
 * @param {number} moodTrend - Optional mood trend (-1: declining, 0: stable, 1: improving)
 * @returns {string} Personalized greeting message
 */
export const getRandomGreeting = (username, moodTrend = 0) => {
  const timeGreeting = getTimeBasedGreeting()
  const inspirational = getInspirationalMessages()
  const moodMessages = getMoodMessages() 
  const casual = getCasualMessages()
  
  // Choose message type based on random selection and mood trend
  const rand = Math.random()
  
  let message = ''
  let messageType = ''
  
  if (rand < 0.3) {
    // Time-based greeting (30%)
    message = `${timeGreeting}, ${username}!`
    messageType = 'time'
  } else if (rand < 0.6) {
    // Inspirational message (30%)
    const inspirationalMsg = inspirational[Math.floor(Math.random() * inspirational.length)]
    message = `${inspirationalMsg}, ${username}!`
    messageType = 'inspirational'
  } else if (rand < 0.8) {
    // Mood-focused message (20%)
    const moodMsg = moodMessages[Math.floor(Math.random() * moodMessages.length)]
    message = `${moodMsg}, ${username}?`
    messageType = 'mood'
  } else {
    // Casual greeting (20%)
    const casualMsg = casual[Math.floor(Math.random() * casual.length)]
    message = `${casualMsg}, ${username}!`
    messageType = 'casual'
  }
  
  return {
    message,
    type: messageType,
    timestamp: new Date().toISOString()
  }
}

/**
 * Get greeting with mood trend consideration
 * @param {string} username - User's display name
 * @param {Array} recentMoods - Array of recent mood entries
 * @returns {Object} Greeting object with message and context
 */
export const getSmartGreeting = (username, recentMoods = []) => {
  let moodTrend = 0
  let contextMessage = ''
  
  if (recentMoods.length >= 2) {
    const recent = recentMoods.slice(0, 2)
    const latestMood = recent[0]?.mood || 3
    const previousMood = recent[1]?.mood || 3
    
    if (latestMood > previousMood) {
      moodTrend = 1 // Improving
      contextMessage = "You seem to be feeling better lately! 🌟"
    } else if (latestMood < previousMood) {
      moodTrend = -1 // Declining  
      contextMessage = "Take care of yourself today 💚"
    } else {
      moodTrend = 0 // Stable
      contextMessage = "Consistency is strength 💪"
    }
  }
  
  const greeting = getRandomGreeting(username, moodTrend)
  
  return {
    ...greeting,
    contextMessage,
    moodTrend,
    hasContext: recentMoods.length >= 2
  }
}

/**
 * Get welcome message for new users
 * @param {string} username - User's display name
 * @returns {string} Welcome message
 */
export const getWelcomeMessage = (username) => {
  const welcomes = [
    `Welcome to MoodFlow, ${username}! 🌈`,
    `Hello ${username}! Ready to start your mood journey? ✨`,
    `Great to have you here, ${username}! 🎉`,
    `Welcome aboard, ${username}! Let's track your emotional wellness 🌱`,
    `Hi ${username}! Your mood tracking journey begins now 🚀`
  ]
  
  return welcomes[Math.floor(Math.random() * welcomes.length)]
}

export default {
  getTimeBasedGreeting,
  getRandomGreeting,
  getSmartGreeting,
  getWelcomeMessage,
  getInspirationalMessages,
  getMoodMessages,
  getCasualMessages
}
