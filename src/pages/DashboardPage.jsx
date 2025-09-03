import React, { useState, useEffect } from 'react'
import EntryForm from '../components/EntryForm'
import EntryList from '../components/EntryList'
import { loadEntries, addEntry } from '../utils/api'
import { useAuth } from '../context/AuthContext'

function DashboardPage({ user }) {
  const { signOut } = useAuth()
  const [entries, setEntries] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load entries from API when component mounts or user changes
  useEffect(() => {
    const loadUserEntries = async () => {
      // Clear entries immediately when user changes
      setEntries([])
      setIsLoading(true)
      
      if (user && user.email) {
        console.log('🔄 Loading entries for user:', user.email)
        try {
          const savedEntries = await loadEntries(user.email)
          console.log('📊 Loaded entries:', savedEntries)
          setEntries(savedEntries)
        } catch (error) {
          console.error('❌ Failed to load entries:', error)
          // Set empty array on error so UI doesn't break
          setEntries([])
        }
      }
      setIsLoading(false)
    }
    
    loadUserEntries()
  }, [user?.email])

  const handleAddEntry = async (newEntry) => {
    const entry = {
      id: Date.now(), // Temporary ID for UI, API will provide real ID
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
    
    try {
      // Save to API
      if (user && user.email) {
        await addEntry(user.email, entry)
        // Reload entries from API to get the real data
        const apiEntries = await loadEntries(user.email)
        setEntries(apiEntries)
      }
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save entry to API:', error)
      // Revert optimistic update on error
      setEntries(entries)
      // TODO: Show error message to user
      alert('Failed to save entry. Please try again.')
    }
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
              onClick={() => signOut()} 
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
          <EntryList entries={entries} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default DashboardPage