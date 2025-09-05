import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getDailyPrompts, getPromptsByMood, getPromptsByCategory, PROMPT_CATEGORIES } from '../utils/prompts'
import './PromptSelector.css'

function PromptSelector({ isOpen, onClose, onSelectPrompt, currentMood = 3 }) {
  const [selectedTab, setSelectedTab] = useState('daily')
  const [dailyPrompts, setDailyPrompts] = useState([])
  const [moodBasedPrompts, setMoodBasedPrompts] = useState([])

  useEffect(() => {
    if (isOpen) {
      // Get daily prompts (same every day)
      const daily = getDailyPrompts(new Date(), 3)
      setDailyPrompts(daily)
      
      // Get mood-based suggestions
      const moodPrompts = getPromptsByMood(currentMood)
      setMoodBasedPrompts(moodPrompts)
    }
  }, [isOpen, currentMood])

  const handlePromptSelect = (prompt) => {
    onSelectPrompt(prompt)
    onClose()
  }

  const handleSkip = () => {
    onSelectPrompt(null) // null means no prompt selected
    onClose()
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'daily', label: '📅 Daily', prompts: dailyPrompts },
    { id: 'mood', label: '🎯 Mood', prompts: moodBasedPrompts },
    { id: 'reflection', label: '🤔 Reflect', prompts: getPromptsByCategory(PROMPT_CATEGORIES.REFLECTION) },
    { id: 'gratitude', label: '🙏 Gratitude', prompts: getPromptsByCategory(PROMPT_CATEGORIES.GRATITUDE) },
    { id: 'goals', label: '🎯 Goals', prompts: getPromptsByCategory(PROMPT_CATEGORIES.GOALS) },
    { id: 'emotions', label: '💭 Emotions', prompts: getPromptsByCategory(PROMPT_CATEGORIES.EMOTIONS) }
  ]

  const activeTab = tabs.find(tab => tab.id === selectedTab) || tabs[0]

  return createPortal(
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content-inner">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">✨ Choose Your Reflection</h2>
                <p className="text-white/70 text-sm">Pick a prompt to guide your journal entry</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0 ml-4"
              >
                ×
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-4 sm:px-6 py-3 border-b border-white/10">
            <div className="flex flex-wrap gap-2 justify-start">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedTab === tab.id
                      ? 'bg-white text-purple-700 shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 240px)' }}>
            <div className="p-4 sm:p-6">
              {activeTab.id === 'daily' && (
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🌅</span>
                    <h3 className="text-white font-medium text-sm">Today's Reflection Prompts</h3>
                  </div>
                  <p className="text-white/60 text-xs">
                    Carefully curated prompts that change daily.
                  </p>
                </div>
              )}

              {activeTab.id === 'mood' && (
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🎯</span>
                    <h3 className="text-white font-medium text-sm">Matched to Your Mood ({currentMood}/5)</h3>
                  </div>
                  <p className="text-white/60 text-xs">
                    Prompts that might resonate with your current mood.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {activeTab.prompts.map((prompt, index) => (
                  <div
                    key={prompt.id}
                    className="group cursor-pointer"
                    onClick={() => handlePromptSelect(prompt)}
                  >
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group-hover:scale-[1.01]">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                          {prompt.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium mb-1 text-sm">
                            {prompt.title}
                          </h3>
                          <p className="text-white/60 text-xs mb-2 leading-relaxed">
                            {prompt.subtitle}
                          </p>
                          <div className="text-white/40 text-xs bg-white/5 rounded-lg px-2 py-1">
                            "{prompt.placeholder}"
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {activeTab.prompts.length === 0 && (
                <div className="text-center py-8 text-white/60">
                  <div className="text-3xl mb-3">💭</div>
                  <p className="text-sm">No prompts available in this category.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex justify-between items-center gap-3">
              <div className="text-white/60 text-xs">
                💡 Prompts help you reflect deeper
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleSkip}
                  className="px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 font-medium text-xs"
                >
                  Skip
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all duration-200 font-medium text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default PromptSelector
