import React from 'react'
import { MoodEmojis, MoodColors, IntensityLabels, TAG_CATEGORIES } from '../utils/constants'
import { getPromptById } from '../utils/prompts'

// Skeleton Loading Component
const LoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-20 bg-white/20 rounded"></div>
          <div className="h-8 w-8 bg-white/20 rounded-full"></div>
        </div>
        <div className="h-6 w-24 bg-white/20 rounded-full mb-3"></div>
        <div className="h-4 w-3/4 bg-white/20 rounded"></div>
      </div>
    ))}
  </div>
)

function EntryList({ entries, isLoading }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl">
      <h3 className="text-xl sm:text-2xl font-semibold text-white mb-8">Recent Entries</h3>
      <div className="space-y-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <div className="text-4xl mb-4">📝</div>
            <p>No entries yet. Add your first mood!</p>
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry.id}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70 text-sm font-medium">{entry.date}</span>
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{MoodEmojis[entry.mood]}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-white text-sm font-medium bg-gradient-to-r ${MoodColors[entry.mood]}`}>
                  Mood Level {entry.mood}
                </div>
                {(entry.intensity !== null && entry.intensity !== undefined) && (
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-white text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500">
                    <span className="mr-1">⚡</span>
                    Intensity {entry.intensity}/10
                    <span className="ml-1 text-xs opacity-80">({IntensityLabels[entry.intensity]})</span>
                  </div>
                )}
              </div>
              
              {/* Tags Display */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {entry.tags.map((tag, tagIndex) => {
                    const tagInfo = TAG_CATEGORIES[tag] || { emoji: '🏷️', color: 'bg-gray-500/80' }
                    // Make colors slightly more transparent for display
                    const displayColor = tagInfo.color.replace('/80', '/60')
                    return (
                      <span
                        key={tagIndex}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${displayColor} border border-white/20`}
                      >
                        <span className="text-xs">{tagInfo.emoji}</span>
                        {tag}
                      </span>
                    )
                  })}
                </div>
              )}
              
              {/* Prompt Display */}
              {entry.promptId && (() => {
                const prompt = getPromptById(entry.promptId)
                return prompt ? (
                  <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{prompt.emoji}</span>
                      <span className="text-white/80 text-sm font-medium">Prompt:</span>
                      <span className="text-white/90 text-sm">{prompt.title}</span>
                    </div>
                    <p className="text-white/60 text-xs ml-7">{prompt.subtitle}</p>
                  </div>
                ) : (
                  <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📝</span>
                      <span className="text-white/80 text-sm">Used a writing prompt</span>
                    </div>
                  </div>
                )
              })()}
              
              {entry.note && (
                <p className="text-white/90 mt-4 leading-relaxed">{entry.note}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default EntryList