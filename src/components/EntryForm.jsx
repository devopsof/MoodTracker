import React, { useState } from 'react'

const MoodEmojis = {
  1: '😔',
  2: '😕', 
  3: '😐',
  4: '😊',
  5: '😄'
}

function EntryForm({ onAddEntry }) {
  const [mood, setMood] = useState(3)
  const [note, setNote] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onAddEntry) {
      onAddEntry({ mood, note })
    }
    setNote('')
    setMood(3)
  }

  return (
    <div className="glass-morphism rounded-2xl p-6 animate-slideIn max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-white mb-6">Add Today's Mood</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Mood Picker */}
        <div>
          <label className="block text-white/90 text-sm font-medium mb-4">
            How's your mood? <span className="text-2xl">{MoodEmojis[mood]}</span>
          </label>

          <div className="flex flex-col items-center bg-white/10 rounded-xl p-4 border border-white/20">
            <div className="flex items-center w-full justify-between mb-2">
              <span className="text-2xl">{MoodEmojis[1]}</span>
              
              <input
                type="range"
                min="1"
                max="5"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-40 h-2 rounded-lg cursor-pointer accent-purple-500"
              />
              
              <span className="text-2xl">{MoodEmojis[5]}</span>
            </div>

            <div className="flex justify-between w-40 mx-auto mt-2">
              {[1, 2, 3, 4, 5].map(num => (
                <span 
                  key={num} 
                  className={`text-sm font-bold ${mood === num ? 'text-purple-400 scale-125' : 'text-white/40'}`}
                  style={{ transition: 'transform 0.2s' }}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Note Input */}
        <div>
          <label className="block text-white/90 text-sm font-medium mb-2">
            Add a note (optional)
          </label>
          <textarea 
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 resize-none"
            rows="4"
            placeholder="What's on your mind?"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-6 rounded-xl bg-white text-purple-600 font-semibold hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-lg animate-pulseGlow"
        >
          Save Entry
        </button>
      </form>
    </div>
  )
}

export default EntryForm
