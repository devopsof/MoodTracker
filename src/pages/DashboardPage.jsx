import React, { useState, useEffect } from 'react'
import EntryForm from '../components/EntryForm'
import EntryList from '../components/EntryList'
import { loadEntries, addEntry } from '../utils/localStorage'

function DashboardPage({ user, onLogout }) {
  const [entries, setEntries] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load entries from localStorage when component mounts or user changes
  useEffect(() => {
    if (user && user.email) {
      const savedEntries = loadEntries(user.email)
      
      // If no saved entries exist, add some sample data for first-time users
      if (savedEntries.length === 0) {
        const sampleEntries = [
          { id: Date.now() - 1000, date: 'Aug 30, 2024', mood: 4, note: 'Had a wonderful productive day working on projects!' },
          { id: Date.now() - 2000, date: 'Aug 29, 2024', mood: 2, note: 'Feeling stressed about upcoming deadlines and work pressure' }
        ]
        // Save sample entries to localStorage first
        sampleEntries.forEach(entry => {
          addEntry(user.email, entry)
        })
        // Load the updated entries from localStorage to keep everything in sync
        setEntries(loadEntries(user.email))
      } else {
        setEntries(savedEntries)
      }
    }
    setIsLoading(false)
  }, [user])

  const handleAddEntry = (newEntry) => {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      ...newEntry
    }
    
    // Update state immediately for UI responsiveness
    const updatedEntries = [entry, ...entries]
    setEntries(updatedEntries)
    
    // Save to localStorage
    if (user && user.email) {
      addEntry(user.email, entry)
    }
    
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated moving background */}
      <div 
        className="fixed inset-0 -z-10" 
        style={{
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab, #667eea, #764ba2)',
          backgroundSize: '400% 400%',
          animation: 'gradientMove 15s ease infinite',
          zIndex: -10
        }}
      ></div>
      <div 
        className="fixed inset-0 -z-10" 
        style={{
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(0,0,0,0.1), transparent, rgba(255,255,255,0.05))',
          backgroundSize: '200% 200%',
          animation: 'shimmer 8s ease-in-out infinite reverse',
          zIndex: -9
        }}
      ></div>
      
      {/* Floating animated orbs */}
      <div 
        className="fixed top-20 right-20 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl" 
        style={{
          position: 'fixed', 
          top: '5rem', 
          right: '5rem', 
          width: '8rem', 
          height: '8rem', 
          backgroundColor: 'rgba(34 211 238 / 0.3)', 
          borderRadius: '50%', 
          filter: 'blur(40px)',
          animation: 'floatOrb1 22s ease-in-out infinite'
        }}
      ></div>
      <div 
        className="fixed bottom-20 left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl" 
        style={{
          position: 'fixed', 
          bottom: '5rem', 
          left: '5rem', 
          width: '10rem', 
          height: '10rem', 
          backgroundColor: 'rgba(147 51 234 / 0.3)', 
          borderRadius: '50%', 
          filter: 'blur(40px)',
          animation: 'floatOrb2 28s ease-in-out infinite reverse'
        }}
      ></div>
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🌈</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">MoodFlow</h1>
            </div>
            <button 
              onClick={onLogout} 
              className="px-4 py-2 rounded-2xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Hello, {user.email.split('@')[0]} 👋
          </h2>
          <p className="text-white/80 text-lg sm:text-xl">How are you feeling today?</p>
        </div>
        {showSuccess && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-white backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✨</span>
              <span className="font-medium">Mood entry saved successfully!</span>
            </div>
          </div>
        )}
        <div className="grid lg:grid-cols-2 gap-8">
          <EntryForm onAddEntry={handleAddEntry} />
          <EntryList entries={entries} />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage