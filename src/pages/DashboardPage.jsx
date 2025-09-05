import React, { useState, useEffect } from 'react'
import EntryForm from '../components/EntryForm'
import EntryList from '../components/EntryList'
import Analytics from '../components/Analytics'
import CalendarHeatmap from '../components/CalendarHeatmap'
import { loadEntries, addEntry } from '../utils/api'
import { useAuth } from '../context/AuthContext'

function DashboardPage({ user }) {
  const { signOut } = useAuth()
  const [entries, setEntries] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('entries')

  // Load entries from API when component mounts or user changes
  useEffect(() => {
    const loadUserEntries = async () => {
      // Clear entries immediately when user changes
      setEntries([])
      setIsLoading(true)
      
      if (user && user.email) {
        try {
          const savedEntries = await loadEntries(user.email)
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
    const now = new Date()
    const entry = {
      id: Date.now(), // Temporary ID for UI, API will provide real ID
      date: now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      createdAt: now.toISOString(), // Add proper timestamp for sorting
      timestamp: now.toISOString(), // Backup timestamp field
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
    <div className="min-h-screen relative w-full" style={{ margin: 0, padding: 0 }}>
      {/* Floating animated orbs */}
      <div 
        className="fixed top-20 right-20 w-32 h-32 theme-orb-1 rounded-full blur-2xl" 
        style={{
          animation: 'floatOrb1 22s ease-in-out infinite'
        }}
      ></div>
      <div 
        className="fixed bottom-20 left-20 w-40 h-40 theme-orb-2 rounded-full blur-2xl" 
        style={{
          animation: 'floatOrb2 28s ease-in-out infinite reverse'
        }}
      ></div>
      <nav className="bg-theme-glass border-b border-theme-glass sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-300"
              onClick={() => {
                setActiveTab('entries')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              title="Go to Mood Entries"
            >
              <span className="text-2xl">🌈</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">MoodFlow</h1>
            </div>
            <button 
              onClick={() => signOut()} 
              className="px-4 py-2 rounded-2xl bg-theme-glass text-theme-primary hover:bg-theme-glass border border-theme-glass hover:border-theme-glass transition-all duration-300 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-12 text-center sm:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold text-theme-primary mb-3">
            Hello, {user.email.split('@')[0]} 👋
          </h2>
          <p className="text-theme-secondary text-lg sm:text-xl">How are you feeling today?</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-theme-glass rounded-2xl p-1">
            <button
              onClick={() => setActiveTab('entries')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'entries'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'text-theme-primary hover:bg-theme-glass'
              }`}
            >
              📝 Mood Entries
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'calendar'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'text-theme-primary hover:bg-theme-glass'
              }`}
            >
              📅 Calendar
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'text-theme-primary hover:bg-theme-glass'
              }`}
            >
              📊 Analytics
            </button>
          </div>
        </div>
        
        {showSuccess && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-white backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✨</span>
              <span className="font-medium">Mood entry saved successfully!</span>
            </div>
          </div>
        )}
        
        {/* Tab Content */}
        <div style={{ minHeight: '600px' }} className="overflow-hidden">
          {activeTab === 'entries' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <EntryForm onAddEntry={handleAddEntry} />
              <EntryList entries={entries} isLoading={isLoading} />
            </div>
          )}
          {activeTab === 'calendar' && (
            <CalendarHeatmap userEmail={user.email} />
          )}
          {activeTab === 'analytics' && (
            <Analytics userEmail={user.email} />
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage