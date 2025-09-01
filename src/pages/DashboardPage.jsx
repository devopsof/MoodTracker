import React, { useState } from 'react'
import EntryForm from '../components/EntryForm'
import EntryList from '../components/EntryList'

function DashboardPage({ user, onLogout }) {
  const [entries, setEntries] = useState([
    { id: 1, date: 'Aug 30, 2024', mood: 4, note: 'Had a wonderful productive day working on projects!' },
    { id: 2, date: 'Aug 29, 2024', mood: 2, note: 'Feeling stressed about upcoming deadlines and work pressure' }
  ])
  const [showSuccess, setShowSuccess] = useState(false)

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
    setEntries([entry, ...entries])
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 -z-10"></div>
      <div className="fixed inset-0 bg-gradient-to-tr from-transparent via-purple-500/20 to-cyan-500/20 -z-10"></div>
      <div className="fixed top-20 right-20 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="fixed bottom-20 left-20 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
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