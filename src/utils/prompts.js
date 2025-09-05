// Journal prompt library with categories and rotation logic

export const PROMPT_CATEGORIES = {
  REFLECTION: 'reflection',
  GRATITUDE: 'gratitude', 
  GOALS: 'goals',
  EMOTIONS: 'emotions',
  GROWTH: 'growth',
  RELATIONSHIPS: 'relationships',
  CREATIVITY: 'creativity',
  WELLNESS: 'wellness'
}

export const JOURNAL_PROMPTS = {
  [PROMPT_CATEGORIES.REFLECTION]: [
    {
      id: 'reflection-1',
      title: "What happened today?",
      subtitle: "Capture the key moments from your day",
      emoji: "📝",
      placeholder: "Today I...",
      category: PROMPT_CATEGORIES.REFLECTION
    },
    {
      id: 'reflection-2', 
      title: "What surprised you today?",
      subtitle: "Something unexpected or different",
      emoji: "😮",
      placeholder: "I was surprised by...",
      category: PROMPT_CATEGORIES.REFLECTION
    },
    {
      id: 'reflection-3',
      title: "What did you learn today?",
      subtitle: "A new insight, skill, or perspective",
      emoji: "🧠",
      placeholder: "I learned that...",
      category: PROMPT_CATEGORIES.REFLECTION
    },
    {
      id: 'reflection-4',
      title: "How did you grow today?",
      subtitle: "A moment of personal development",
      emoji: "🌱",
      placeholder: "I grew by...",
      category: PROMPT_CATEGORIES.REFLECTION
    }
  ],

  [PROMPT_CATEGORIES.GRATITUDE]: [
    {
      id: 'gratitude-1',
      title: "What are you grateful for today?", 
      subtitle: "Three things that brought you joy",
      emoji: "🙏",
      placeholder: "I'm grateful for...",
      category: PROMPT_CATEGORIES.GRATITUDE
    },
    {
      id: 'gratitude-2',
      title: "Who made your day better?",
      subtitle: "Someone who showed kindness or support",
      emoji: "💝",
      placeholder: "Today, [person] made my day better by...",
      category: PROMPT_CATEGORIES.GRATITUDE
    },
    {
      id: 'gratitude-3',
      title: "What small pleasure did you enjoy?",
      subtitle: "A simple moment that brought happiness",
      emoji: "✨", 
      placeholder: "I enjoyed...",
      category: PROMPT_CATEGORIES.GRATITUDE
    }
  ],

  [PROMPT_CATEGORIES.GOALS]: [
    {
      id: 'goals-1',
      title: "One small win from today",
      subtitle: "An accomplishment worth celebrating",
      emoji: "🎯",
      placeholder: "Today I accomplished...",
      category: PROMPT_CATEGORIES.GOALS
    },
    {
      id: 'goals-2',
      title: "What's your focus for tomorrow?",
      subtitle: "Your main priority or intention",
      emoji: "🚀",
      placeholder: "Tomorrow I want to focus on...",
      category: PROMPT_CATEGORIES.GOALS
    },
    {
      id: 'goals-3',
      title: "What progress did you make?",
      subtitle: "Steps toward a larger goal",
      emoji: "📈",
      placeholder: "I made progress on...",
      category: PROMPT_CATEGORIES.GOALS
    }
  ],

  [PROMPT_CATEGORIES.EMOTIONS]: [
    {
      id: 'emotions-1',
      title: "What are you feeling right now?",
      subtitle: "Explore your current emotional state",
      emoji: "💭",
      placeholder: "Right now I feel...",
      category: PROMPT_CATEGORIES.EMOTIONS
    },
    {
      id: 'emotions-2',
      title: "What do you want to let go of?",
      subtitle: "Something that's been weighing on you",
      emoji: "🍃",
      placeholder: "I want to release...",
      category: PROMPT_CATEGORIES.EMOTIONS
    },
    {
      id: 'emotions-3',
      title: "What brought you peace today?",
      subtitle: "A moment of calm or tranquility",
      emoji: "🕊️",
      placeholder: "I felt peaceful when...",
      category: PROMPT_CATEGORIES.EMOTIONS
    },
    {
      id: 'emotions-4',
      title: "What challenged you today?",
      subtitle: "A difficult situation and how you handled it",
      emoji: "💪",
      placeholder: "I was challenged by...",
      category: PROMPT_CATEGORIES.EMOTIONS
    }
  ],

  [PROMPT_CATEGORIES.GROWTH]: [
    {
      id: 'growth-1',
      title: "How did you step outside your comfort zone?",
      subtitle: "A moment of courage or risk-taking",
      emoji: "🦋",
      placeholder: "I pushed myself by...",
      category: PROMPT_CATEGORIES.GROWTH
    },
    {
      id: 'growth-2',
      title: "What would you do differently?",
      subtitle: "A learning opportunity from today",
      emoji: "🔄",
      placeholder: "Next time I would...",
      category: PROMPT_CATEGORIES.GROWTH
    },
    {
      id: 'growth-3',
      title: "What strength did you discover?",
      subtitle: "A quality or ability you showed today",
      emoji: "💎",
      placeholder: "I showed strength by...",
      category: PROMPT_CATEGORIES.GROWTH
    }
  ],

  [PROMPT_CATEGORIES.RELATIONSHIPS]: [
    {
      id: 'relationships-1',
      title: "How did you connect with others?",
      subtitle: "Meaningful interactions or conversations",
      emoji: "🤝",
      placeholder: "I connected with others by...",
      category: PROMPT_CATEGORIES.RELATIONSHIPS
    },
    {
      id: 'relationships-2',
      title: "Who do you want to reach out to?",
      subtitle: "Someone you'd like to contact or support",
      emoji: "📞",
      placeholder: "I want to reach out to...",
      category: PROMPT_CATEGORIES.RELATIONSHIPS
    },
    {
      id: 'relationships-3',
      title: "How did you show kindness today?",
      subtitle: "Ways you helped or supported someone",
      emoji: "💖",
      placeholder: "I showed kindness by...",
      category: PROMPT_CATEGORIES.RELATIONSHIPS
    }
  ],

  [PROMPT_CATEGORIES.CREATIVITY]: [
    {
      id: 'creativity-1',
      title: "What inspired you today?",
      subtitle: "Something that sparked your imagination",
      emoji: "💡",
      placeholder: "I was inspired by...",
      category: PROMPT_CATEGORIES.CREATIVITY
    },
    {
      id: 'creativity-2',
      title: "What did you create or build?",
      subtitle: "Something you made, wrote, or designed",
      emoji: "🎨",
      placeholder: "Today I created...",
      category: PROMPT_CATEGORIES.CREATIVITY
    },
    {
      id: 'creativity-3',
      title: "What new idea are you exploring?",
      subtitle: "A concept or project you're thinking about",
      emoji: "🌟",
      placeholder: "I'm exploring the idea of...",
      category: PROMPT_CATEGORIES.CREATIVITY
    }
  ],

  [PROMPT_CATEGORIES.WELLNESS]: [
    {
      id: 'wellness-1',
      title: "How did you take care of yourself?",
      subtitle: "Ways you prioritized your wellbeing",
      emoji: "🌸",
      placeholder: "I took care of myself by...",
      category: PROMPT_CATEGORIES.WELLNESS
    },
    {
      id: 'wellness-2',
      title: "What energized you today?",
      subtitle: "Something that boosted your mood or energy",
      emoji: "⚡",
      placeholder: "I felt energized by...",
      category: PROMPT_CATEGORIES.WELLNESS
    },
    {
      id: 'wellness-3',
      title: "How did you rest or recharge?",
      subtitle: "Moments of relaxation or restoration",
      emoji: "🧘‍♀️",
      placeholder: "I recharged by...",
      category: PROMPT_CATEGORIES.WELLNESS
    }
  ]
}

// Flatten all prompts for easy access
export const ALL_PROMPTS = Object.values(JOURNAL_PROMPTS).flat()

/**
 * Get daily prompts based on date - ensures consistent prompts per day
 * @param {Date} date - The date to get prompts for (defaults to today)
 * @param {number} count - Number of prompts to return (default 3)
 * @returns {Array} Array of prompt objects
 */
export const getDailyPrompts = (date = new Date(), count = 3) => {
  // Use date as seed for consistent daily prompts
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
  const baseSeed = date.getFullYear() * 1000 + dayOfYear
  
  // Simple seeded random function
  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
  }
  
  // Shuffle prompts based on seed (use index to vary seed)
  const shuffled = [...ALL_PROMPTS].sort((a, b) => {
    const seedA = baseSeed + ALL_PROMPTS.indexOf(a)
    const seedB = baseSeed + ALL_PROMPTS.indexOf(b) 
    return seededRandom(seedA) - seededRandom(seedB)
  })
  
  // Return the first 'count' prompts, ensuring variety across categories
  const selected = []
  const usedCategories = new Set()
  
  for (const prompt of shuffled) {
    if (selected.length >= count) break
    
    // Try to get prompts from different categories
    if (!usedCategories.has(prompt.category) || selected.length === count - 1) {
      selected.push(prompt)
      usedCategories.add(prompt.category)
    }
  }
  
  return selected.slice(0, count)
}

/**
 * Get prompts by category
 * @param {string} category - The category to get prompts from
 * @returns {Array} Array of prompts in that category
 */
export const getPromptsByCategory = (category) => {
  return JOURNAL_PROMPTS[category] || []
}

/**
 * Get a random prompt from a specific category
 * @param {string} category - The category to get a prompt from
 * @returns {Object} A random prompt from the category
 */
export const getRandomPromptFromCategory = (category) => {
  const prompts = getPromptsByCategory(category)
  if (prompts.length === 0) return null
  
  const randomIndex = Math.floor(Math.random() * prompts.length)
  return prompts[randomIndex]
}

/**
 * Find a prompt by ID
 * @param {string} promptId - The ID of the prompt to find
 * @returns {Object|null} The prompt object or null if not found
 */
export const getPromptById = (promptId) => {
  return ALL_PROMPTS.find(prompt => prompt.id === promptId) || null
}

/**
 * Get prompt suggestions based on mood
 * @param {number} mood - Mood value (1-5)
 * @returns {Array} Array of suggested prompts
 */
export const getPromptsByMood = (mood) => {
  if (mood <= 2) {
    // Low mood - focus on emotions, gratitude, and wellness
    return [
      ...getPromptsByCategory(PROMPT_CATEGORIES.EMOTIONS),
      ...getPromptsByCategory(PROMPT_CATEGORIES.GRATITUDE),
      ...getPromptsByCategory(PROMPT_CATEGORIES.WELLNESS)
    ].slice(0, 3)
  } else if (mood >= 4) {
    // High mood - focus on goals, creativity, and growth  
    return [
      ...getPromptsByCategory(PROMPT_CATEGORIES.GOALS),
      ...getPromptsByCategory(PROMPT_CATEGORIES.CREATIVITY),
      ...getPromptsByCategory(PROMPT_CATEGORIES.GROWTH)
    ].slice(0, 3)
  } else {
    // Neutral mood - balanced mix
    return getDailyPrompts(new Date(), 3)
  }
}
