import React, { useState } from 'react'
import { MoodEmojis, QuickMoodEmojis, IntensityLabels, TAG_CATEGORIES } from '../utils/constants'
import PromptSelector from './PromptSelector'

function EntryForm({ onAddEntry }) {
  const [mood, setMood] = useState(3)
  const [intensity, setIntensity] = useState(5)
  const [note, setNote] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [customTag, setCustomTag] = useState('')
  const [quickMoodMode, setQuickMoodMode] = useState(false)
  const [showPromptSelector, setShowPromptSelector] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onAddEntry) {
      onAddEntry({ 
        mood, 
        intensity,
        note, 
        tags: selectedTags,
        promptId: selectedPrompt?.id || null
      })
    }
    setNote('')
    setMood(3)
    setIntensity(5)
    setSelectedTags([])
    setCustomTag('')
    setQuickMoodMode(false)
    setSelectedPrompt(null)
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

  const handleQuickMoodSelect = (quickMood) => {
    setMood(quickMood.mood)
    setIntensity(quickMood.intensity)
    setQuickMoodMode(false)
    // Auto-submit for quick check-in
    if (onAddEntry) {
      onAddEntry({
        mood: quickMood.mood,
        intensity: quickMood.intensity,
        note: `Quick check-in: ${quickMood.label}`,
        tags: ['quick-checkin'],
        promptId: null // Quick check-ins don't use prompts
      })
    }
    // Reset form
    setNote('')
    setMood(3)
    setIntensity(5)
    setSelectedTags([])
    setCustomTag('')
    setQuickMoodMode(false)
  }

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt)
    if (prompt) {
      // Pre-fill note with prompt placeholder if note is empty
      if (!note.trim()) {
        setNote(prompt.placeholder)
      }
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="bg-theme-glass rounded-3xl p-6 sm:p-8 border border-theme-glass shadow-xl">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold text-theme-primary">Add Today's Mood</h3>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowPromptSelector(true)}
            className="px-4 py-2 rounded-xl bg-theme-glass text-theme-primary hover:bg-theme-glass border border-theme-glass hover:border-theme-glass transition-all duration-300 text-sm font-medium"
          >
            💭 Writing Prompts
          </button>
          <button
            type="button"
            onClick={() => setQuickMoodMode(!quickMoodMode)}
            className="px-4 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 text-sm font-medium"
          >
            ⚡ Quick Check-in
          </button>
        </div>
      </div>
      
      {quickMoodMode && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-400/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium flex items-center gap-2">
              ⚡ Quick Check-in Mode
            </h4>
            <button
              type="button"
              onClick={() => setQuickMoodMode(false)}
              className="text-white/60 hover:text-white text-sm"
            >
              Switch to Full Entry
            </button>
          </div>
          <p className="text-white/70 text-sm mb-4">Tap any emoji below to instantly log your mood:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QuickMoodEmojis.map((quickMood, index) => (
              <button
                key={index}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleQuickMoodSelect(quickMood)
                }}
                className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 text-center group hover:scale-105"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{quickMood.emoji}</div>
                <div className="text-white/90 text-sm font-medium">{quickMood.label}</div>
                <div className="text-white/60 text-xs mt-1">{quickMood.mood}/5 • {quickMood.intensity}/10</div>
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-white/60 text-xs text-center">
              📝 These will be saved immediately with "quick-checkin" tag
            </p>
          </div>
        </div>
      )}
      
      {/* Selected Prompt Display */}
      {selectedPrompt && (
        <div className="mb-8 p-6 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl border border-white/10">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedPrompt.emoji}</span>
              <div>
                <h4 className="text-white font-medium">{selectedPrompt.title}</h4>
                <p className="text-white/70 text-sm">{selectedPrompt.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPrompt(null)}
              className="text-white/60 hover:text-white text-lg w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              ×
            </button>
          </div>
          <div className="text-white/60 text-sm bg-white/5 rounded-lg px-3 py-2 border border-white/5">
            Reflection starter: "{selectedPrompt.placeholder}"
          </div>
        </div>
      )}
      
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
        
        {/* Intensity Slider */}
        <div>
          <label className="block text-white/90 text-base font-medium mb-4">
            How intense is this feeling? <span className="text-lg">{intensity}/10</span>
            <span className="text-white/70 text-sm ml-2">({IntensityLabels[intensity]})</span>
          </label>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60 text-sm">1</span>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="flex-1 mx-6 h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(intensity-1)*11.11}%, rgba(255,255,255,0.2) ${(intensity-1)*11.11}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <span className="text-white/60 text-sm">10</span>
            </div>
            <div className="flex justify-between max-w-lg mx-auto mt-4">
              {[1, 3, 5, 7, 10].map(num => (
                <div key={num} className="flex flex-col items-center">
                  <span 
                    className={`text-xs font-bold transition-all duration-300 ${
                      intensity === num ? 'text-amber-300 scale-110' : 'text-white/40'
                    }`}
                  >
                    {num}
                  </span>
                  <span 
                    className={`text-xs transition-all duration-300 ${
                      intensity === num ? 'text-amber-200' : 'text-white/30'
                    }`}
                  >
                    {IntensityLabels[num]}
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
        
        {/* Tags Section - Only show when not in quick mood mode */}
        {!quickMoodMode && (
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
        )}
        
        <button
          type="submit"
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-white to-gray-100 text-purple-700 font-semibold hover:from-gray-100 hover:to-white transform hover:scale-[1.02] transition-all duration-300 shadow-xl"
        >
          Save Entry
        </button>
      </div>
    </form>
    
    {/* Prompt Selector Modal - Outside form to prevent positioning issues */}
    <PromptSelector
      isOpen={showPromptSelector}
      onClose={() => setShowPromptSelector(false)}
      onSelectPrompt={handlePromptSelect}
      currentMood={mood}
    />
    </>
  )
}

export default EntryForm