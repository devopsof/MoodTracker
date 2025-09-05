import React, { useState } from 'react'
import { MoodEmojis } from '../utils/constants'

const AISuggestion = ({ 
  analysis, 
  onAccept, 
  onModify, 
  onDismiss, 
  isLoading = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return (
      <div className="bg-purple-500/20 backdrop-blur-sm rounded-2xl p-4 border border-purple-400/30 mb-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin text-2xl">🤖</div>
          <div className="flex-1">
            <div className="text-white font-medium">AI is analyzing your text...</div>
            <div className="text-white/70 text-sm">This may take a few seconds</div>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) return null

  const { suggestedMood, confidence, sentiment, emotions, analyzedBy } = analysis

  return (
    <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-4 border border-purple-400/30 mb-4">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">🤖</div>
        
        <div className="flex-1">
          {/* Main suggestion */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">AI Suggests:</span>
              <span className="text-2xl">{MoodEmojis[suggestedMood]}</span>
              <span className="text-white font-bold">{suggestedMood}/5</span>
            </div>
            <div className="text-sm text-white/70">
              {confidence}% confident
            </div>
          </div>

          {/* Sentiment info */}
          <div className="text-sm text-white/80 mb-3">
            <span className="capitalize">{sentiment?.toLowerCase()}</span> sentiment detected
            {emotions && emotions.length > 0 && (
              <span className="ml-2">
                • Top emotions: {emotions.slice(0, 2).map(e => e.label.toLowerCase()).join(', ')}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAccept(suggestedMood)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-sm transition-all duration-300 flex items-center space-x-1"
            >
              <span>✓</span>
              <span>Accept</span>
            </button>
            
            <button
              onClick={() => onModify(suggestedMood)}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium text-sm transition-all duration-300 flex items-center space-x-1"
            >
              <span>✏️</span>
              <span>Adjust</span>
            </button>
            
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium text-sm transition-all duration-300 flex items-center space-x-1"
            >
              <span>✕</span>
              <span>Dismiss</span>
            </button>

            {/* Details toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-all duration-300"
            >
              {isExpanded ? '▼' : '▶'} Details
            </button>
          </div>

          {/* Expanded details */}
          {isExpanded && (
            <div className="mt-4 p-3 bg-black/20 rounded-xl border border-white/10">
              <div className="text-xs text-white/70 mb-2">Analysis Details:</div>
              
              {/* Confidence breakdown */}
              <div className="mb-3">
                <div className="text-sm text-white/80 mb-1">Confidence: {confidence}%</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      confidence > 80 ? 'bg-green-500' :
                      confidence > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${confidence}%` }}
                  ></div>
                </div>
              </div>

              {/* Emotions breakdown */}
              {emotions && emotions.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm text-white/80 mb-2">Detected Emotions:</div>
                  <div className="space-y-1">
                    {emotions.slice(0, 3).map((emotion, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-white/70 capitalize">{emotion.label.toLowerCase()}</span>
                        <span className="text-white/60">{Math.round(emotion.score * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analysis source */}
              <div className="text-xs text-white/50">
                Analyzed by: {analyzedBy || 'AI System'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AISuggestion
