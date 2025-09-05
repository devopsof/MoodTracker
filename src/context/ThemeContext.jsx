import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Apply theme immediately before any rendering to prevent flashing
  const savedTheme = localStorage.getItem('moodflow-theme') || 'light'
  
  // Set theme immediately in a synchronous way to prevent any flashing
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', savedTheme)
    // Also set it on the HTML element for broader coverage
    document.documentElement.style.setProperty('--current-theme', savedTheme)
  }
  
  const [theme, setTheme] = useState(savedTheme)

  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isLoaded, setIsLoaded] = useState(true) // Start as loaded to prevent blocking

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('moodflow-theme', theme)
    
    // Mark as transitioning for smooth effect
    setIsTransitioning(true)
    
    // Apply theme class to document root - this triggers CSS transitions
    document.documentElement.setAttribute('data-theme', theme)
    
    // Complete transition after animation duration
    const timer = setTimeout(() => {
      setIsTransitioning(false)
      setIsLoaded(true)
    }, 1500) // Match the CSS gradient transition duration
    
    return () => clearTimeout(timer)
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const isDark = theme === 'dark'

  const value = {
    theme,
    isDark,
    toggleTheme,
    isTransitioning,
    isLoaded
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeContext
