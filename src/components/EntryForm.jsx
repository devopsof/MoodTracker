import React, { useState } from 'react'
import { MoodEmojis, TAG_CATEGORIES } from '../utils/constants'

function EntryForm({ onAddEntry }) {
  const [mood, setMood] = useState(3)
  const [note, setNote] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [customTag, setCustomTag] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onAddEntry) {
      onAddEntry({ 
        mood, 
        note, 
        tags: selectedTags 
      })
    }
    setNote('')
    setMood(3)
    setSelectedTags([])
    setCustomTag('')
  }

  const handleTagToggle = (tagName) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(tag => tag !== tagName)
        : [...prev, tagName]
    )
  }

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim().toLowerCase())) {
      setSelectedTags(prev => [...prev, customTag.trim().toLowerCase()])
      setCustomTag('')
    }
  }

  const handleRemoveTag = (tagName) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagName))
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
        
        {/* Tags Section */}
        <div>
          <label className="block text-white/90 text-base font-medium mb-4">
            Add tags (optional) 🏷️
          </label>
          
          {/* Quick Tags */}
          <div className="mb-4">
            <p className="text-white/70 text-sm mb-3">Quick tags:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TAG_CATEGORIES).map(([tagName, tagInfo]) => (
                <button
                  key={tagName}
                  type="button"
                  onClick={() => handleTagToggle(tagName)}
                  className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                    selectedTags.includes(tagName)
                      ? `${tagInfo.color} text-white border-white/30 shadow-lg scale-105`
                      : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:scale-105'
                  }`}
                >
                  <span className="mr-1">{tagInfo.emoji}</span>
                  {tagName}
                </button>
              ))}
            </div>
          </div>
          
          {/* Custom Tag Input */}
          <div className="mb-4">
            <p className="text-white/70 text-sm mb-3">Or add your own:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
                className="flex-1 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300"
                placeholder="Enter custom tag..."
                maxLength={20}
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                disabled={!customTag.trim()}
                className="px-4 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Add
              </button>
            </div>
          </div>
          
          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div>
              <p className="text-white/70 text-sm mb-3">Selected tags:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => {
                  const tagInfo = TAG_CATEGORIES[tag] || { emoji: '🏷️', color: 'bg-gray-500/80' }
                  return (
                    <div
                      key={tag}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${tagInfo.color} text-white border border-white/30 shadow-lg`}
                    >
                      <span>{tagInfo.emoji}</span>
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-white/80 hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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