import React, { useState } from 'react'
import EntryForm from '../components/EntryForm'
import EntryList from '../components/EntryList'

function DashboardPage({ user, onLogout }) {
  const [entries, setEntries] = useState([
    { id: 1, date: 'Aug 30, 2024', mood: 4, note: 'Had an fabulous gooning session today' },
    { id: 2, date: 'Aug 29, 2024', mood: 2, note: 'Feeling stressed about deadlines' }
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
    <div className="min-h-screen">
      <div className="gradient-bg"></div>

  <div className="orb w-96 h-96 bg-cyan-500 top-20 right-20"></div>
  <div className="orb w-64 h-64 bg-purple-500 bottom-20 left-20"></div>

  <nav className="glass-morphism border-b border-white/20 px-6 py-4 sticky top-0 z-10">
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold text-white">MoodFlow</h1>
      <button 
        onClick={onLogout} 
        className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
      >
        Logout
      </button>
    </div>
  </nav>

  <div className="max-w-6xl mx-auto p-6">
    <div className="mb-8 animate-slideIn">
      <h2 className="text-3xl font-bold text-white mb-2">
        Hello, {user.email.split('@')[0]} 👋
      </h2>
      <p className="text-white/80">How are you feeling today?</p>
    </div>

    {showSuccess && (
      <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-white animate-slideIn">
        ✨ Mood entry saved successfully!
      </div>
    )}

    <div className="grid md:grid-cols-2 gap-6">
      <EntryForm onAddEntry={handleAddEntry} />
      <EntryList entries={entries} />
    </div>
  </div>
</div>
  )
}

export default DashboardPage