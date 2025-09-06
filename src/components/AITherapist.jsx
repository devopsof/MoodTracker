import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { loadEntriesFromLocal } from '../utils/localStorageApi'
import { getAITherapyResponse } from '../utils/aiService'

const AITherapist = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      content: "Hello! I'm here to listen and support you. How are you feeling right now?",
      timestamp: new Date(),
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Get user's recent mood context for AI
    if (user?.email && !sessionStarted) {
      const recentEntries = loadEntriesFromLocal(user.email).slice(0, 3)
      if (recentEntries.length > 0) {
        const latestEntry = recentEntries[0]
        const contextualGreeting = getContextualGreeting(latestEntry, recentEntries)
        
        setMessages([{
          id: 1,
          sender: 'ai',
          content: contextualGreeting,
          timestamp: new Date(),
        }])
      }
      setSessionStarted(true)
    }
  }, [user?.email, sessionStarted])

  const getContextualGreeting = (latestEntry, recentEntries) => {
    if (!latestEntry) {
      return "Hello! I'm here to listen and support you. How are you feeling right now?"
    }

    const moodLevel = latestEntry.mood
    const intensity = latestEntry.intensity
    const hasPhotos = latestEntry.photos && latestEntry.photos.length > 0

    let greeting = "Hello! I'm your AI wellness companion. "

    // Mood-aware greeting
    if (moodLevel <= 2) {
      greeting += "I noticed you've been having a challenging time lately. "
    } else if (moodLevel >= 4) {
      greeting += "It looks like you've been feeling pretty good recently! "
    } else {
      greeting += "I see you've been tracking your moods consistently. "
    }

    // Intensity awareness
    if (intensity >= 8) {
      greeting += "Those feelings seem quite intense right now. "
    }

    // Photo context
    if (hasPhotos) {
      greeting += "I love that you've been capturing moments with photos - that shows mindfulness. "
    }

    greeting += "I'm here to listen without judgment and help you process whatever you're experiencing. What's on your mind today?"

    return greeting
  }

  const getAIResponse = async (userMessage, conversationHistory) => {
    try {
      // Get user's mood context
      const recentEntries = user?.email ? loadEntriesFromLocal(user.email).slice(0, 5) : []
      
      const moodContext = recentEntries.length > 0 ? {
        currentMood: recentEntries[0],
        recentPattern: recentEntries.map(e => ({
          mood: e.mood,
          intensity: e.intensity,
          tags: e.tags,
          date: e.date
        }))
      } : null

      // Use the AI service
      const response = await getAITherapyResponse(userMessage, moodContext, conversationHistory)
      
      return response
    } catch (error) {
      console.error('Error getting AI response:', error)
      return "I'm having trouble connecting right now. But I want you to know that your feelings are valid, and I'm here when you're ready to talk."
    }
  }


  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const aiResponse = await getAIResponse(userMessage.content, messages)
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: "I'm sorry, I'm having trouble responding right now. Your feelings are still valid and important.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50/20 to-purple-50/20 rounded-3xl border border-white/20 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Wellness Companion</h3>
            <p className="text-sm text-white/70">Here to listen and support you</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-white/20 backdrop-blur-sm text-white border border-white/20'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.sender === 'user' ? 'text-white/70' : 'text-white/60'
              }`}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/20 backdrop-blur-sm text-white border border-white/20 px-4 py-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-xs text-white/60">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 sm:p-6 border-t border-white/20">
        <div className="flex space-x-3">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300 resize-none"
            rows="1"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
          >
            <span className="text-sm">Send</span>
            <span className="text-lg">💙</span>
          </button>
        </div>
        
        {/* Disclaimer */}
        <p className="text-xs text-white/50 mt-3 text-center">
          This AI companion provides support but isn't a replacement for professional therapy.
          {' '}
          <span className="text-white/70">In crisis? Call 988 (Suicide & Crisis Lifeline)</span>
        </p>
      </div>
    </div>
  )
}

export default AITherapist
