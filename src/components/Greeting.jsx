import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSmartGreeting, getRandomGreeting } from '../utils/greetings'

/**
 * Animated greeting component that rotates messages every 20 seconds
 * @param {Object} props - Component props
 * @param {string} props.username - User's display name  
 * @param {Array} props.recentMoods - Array of recent mood entries
 * @param {number} props.rotationInterval - Rotation interval in seconds (default: 20)
 * @returns {JSX.Element} Greeting component
 */
function Greeting({ username = 'User', recentMoods = [], rotationInterval = 20 }) {
  const [currentGreeting, setCurrentGreeting] = useState(null)
  const [isInitial, setIsInitial] = useState(true)

  // Initialize first greeting
  useEffect(() => {
    const initialGreeting = getSmartGreeting(username, recentMoods)
    setCurrentGreeting(initialGreeting)
    setIsInitial(false)
  }, [username, recentMoods])

  // Set up rotation interval
  useEffect(() => {
    if (isInitial) return

    const interval = setInterval(() => {
      // For rotation, use random greetings to keep it fresh
      const newGreeting = getRandomGreeting(username)
      setCurrentGreeting(newGreeting)
    }, rotationInterval * 1000)

    return () => clearInterval(interval)
  }, [username, rotationInterval, isInitial])

  // Don't render until we have the initial greeting
  if (!currentGreeting) {
    return (
      <div className="h-16 flex items-center">
        <div className="animate-pulse bg-theme-glass rounded-lg h-8 w-48"></div>
      </div>
    )
  }

  return (
    <div className="greeting-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGreeting.timestamp}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ 
            duration: 0.5,
            ease: "easeOut"
          }}
          className="flex flex-col space-y-2"
        >
          {/* Main greeting message */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme-primary">
            {currentGreeting.message}
          </h1>
          
          {/* Context message for smart greetings */}
          {currentGreeting.hasContext && currentGreeting.contextMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-theme-secondary text-sm sm:text-base"
            >
              {currentGreeting.contextMessage}
            </motion.p>
          )}
          
          {/* Greeting type indicator (for debugging - can be removed) */}
          {process.env.NODE_ENV === 'development' && (
            <span className="text-xs text-theme-tertiary opacity-50">
              {currentGreeting.type} • {new Date(currentGreeting.timestamp).toLocaleTimeString()}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/**
 * Simple greeting component without rotation (for places where you want static greeting)
 * @param {Object} props - Component props  
 * @param {string} props.username - User's display name
 * @param {Array} props.recentMoods - Array of recent mood entries
 * @returns {JSX.Element} Static greeting component
 */
export function SimpleGreeting({ username = 'User', recentMoods = [] }) {
  const greeting = getSmartGreeting(username, recentMoods)

  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme-primary">
        {greeting.message}
      </h1>
      
      {greeting.hasContext && greeting.contextMessage && (
        <p className="text-theme-secondary text-sm sm:text-base">
          {greeting.contextMessage}
        </p>
      )}
    </div>
  )
}

/**
 * Welcome greeting for new users (one-time use)
 * @param {Object} props - Component props
 * @param {string} props.username - User's display name  
 * @returns {JSX.Element} Welcome greeting component
 */
export function WelcomeGreeting({ username = 'User' }) {
  const [welcomeMessage] = useState(() => {
    const welcomes = [
      `Welcome to MoodFlow, ${username}! 🌈`,
      `Hello ${username}! Ready to start your mood journey? ✨`,
      `Great to have you here, ${username}! 🎉`,
      `Welcome aboard, ${username}! Let's track your emotional wellness 🌱`,
      `Hi ${username}! Your mood tracking journey begins now 🚀`
    ]
    return welcomes[Math.floor(Math.random() * welcomes.length)]
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6,
        ease: "easeOut"
      }}
      className="text-center"
    >
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-theme-primary mb-4">
        {welcomeMessage}
      </h1>
      <p className="text-theme-secondary text-lg">
        Let's start tracking your emotional journey together!
      </p>
    </motion.div>
  )
}

export default Greeting
