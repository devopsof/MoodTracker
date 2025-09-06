import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme, theme, isTransitioning } = useTheme()
  
  const handleClick = () => {
    toggleTheme()
  }

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
        bg-theme-glass backdrop-blur-lg hover:bg-theme-glass 
        border border-theme-glass hover:border-theme-glass
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-white/40
        transition-all duration-300 shadow-lg hover:shadow-xl
        text-theme-primary cursor-pointer
        ${isTransitioning ? 'animate-pulse' : ''}
        ${className}
      `}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        backgroundColor: isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.2)',
        borderColor: isDark ? 'rgba(139, 92, 246, 0.6)' : 'rgba(255, 255, 255, 0.4)',
        transition: 'all 0.3s ease'
      }}
    >
      <span className="text-sm">
        {isDark ? '🌙' : '☀️'}
      </span>
      <span className="hidden sm:inline">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}

export default ThemeToggle
