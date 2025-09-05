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
        flex items-center justify-center w-12 h-12 rounded-xl
        bg-theme-glass backdrop-blur-lg hover:bg-theme-glass 
        border border-theme-glass hover:border-theme-glass
        hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-white/40
        transition-all duration-500 shadow-lg hover:shadow-xl
        text-theme-primary cursor-pointer
        ${isTransitioning ? 'animate-pulse' : ''}
        ${className}
      `}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        // Fast, visible theme-aware styling
        backgroundColor: isDark ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.15)',
        borderColor: isDark ? 'rgba(139, 92, 246, 0.8)' : 'rgba(255, 255, 255, 0.3)',
        transition: 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transform: isTransitioning ? 'scale(1.05) rotate(10deg)' : 'scale(1) rotate(0deg)'
      }}
    >
      <span 
        className="text-xl transition-all duration-700 hover:scale-110"
        style={{
          transform: isTransitioning ? 'rotate(360deg) scale(1.2)' : 'rotate(0deg) scale(1)',
          opacity: isTransitioning ? 0.5 : 1,
          filter: isTransitioning ? 'blur(1px)' : 'blur(0px)'
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  )
}

export default ThemeToggle
