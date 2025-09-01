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
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl">
      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-8">Add Today's Mood</h3>
      <div className="space-y-8">
        <div>
          <label className="block text-white/90 text-base font-medium mb-6">
            How's your mood? <span className="text-3xl ml-2">{MoodEmojis[mood]}</span>
          </label>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{MoodEmojis[1]}</span>
              <input
                type="range"
                min="1"
                max="5"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="flex-1 mx-6 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(mood-1)*25}%, rgba(255,255,255,0.2) ${(mood-1)*25}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <span className="text-2xl">{MoodEmojis[5]}</span>
            </div>
            <div className="flex justify-between max-w-sm mx-auto mt-4">
              {[1, 2, 3, 4, 5].map(num => (
                <div key={num} className="flex flex-col items-center">
                  <span 
                    className={`text-sm font-bold transition-all duration-300 ${
                      mood === num ? 'text-purple-300 scale-110' : 'text-white/40'
                    }`}
                  >
                    {num}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-white/90 text-base font-medium mb-4">
            Add a note (optional)
          </label>
          <textarea 
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 resize-none"
            rows="4"
            placeholder="What's on your mind?"
          />
        </div>
        <button
          type="submit"
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-white to-gray-100 text-purple-700 font-semibold hover:from-gray-100 hover:to-white transform hover:scale-[1.02] transition-all duration-300 shadow-xl"
        >
          Save Entry
        </button>
      </div>
    </form>
  )
}

export default EntryForm