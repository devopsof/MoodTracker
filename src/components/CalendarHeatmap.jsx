import React, { useState, useEffect } from 'react'
import { loadEntries } from '../utils/api'
import { MoodEmojis } from '../utils/constants'

// Color intensity mapping for moods
const MOOD_COLORS = {
  1: 'bg-red-200 border-red-300',      // Very sad - light red
  2: 'bg-orange-200 border-orange-300', // Sad - light orange  
  3: 'bg-gray-200 border-gray-300',     // Neutral - light gray
  4: 'bg-green-200 border-green-300',   // Happy - light green
  5: 'bg-emerald-300 border-emerald-400' // Very happy - bright green
}

const MOOD_COLORS_HOVER = {
  1: 'hover:bg-red-300',
  2: 'hover:bg-orange-300', 
  3: 'hover:bg-gray-300',
  4: 'hover:bg-green-300',
  5: 'hover:bg-emerald-400'
}

function CalendarHeatmap({ userEmail }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoveredDay, setHoveredDay] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [isInboxHovered, setIsInboxHovered] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMood, setFilterMood] = useState('all')

  useEffect(() => {
    if (userEmail) {
      fetchEntries()
    }
  }, [userEmail])

  // Add click outside handler to close chat box
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If clicking outside both calendar and chat box, close chat
      if (selectedDay && !event.target.closest('.calendar-container') && !event.target.closest('.chat-container')) {
        setSelectedDay(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedDay])

  const fetchEntries = async () => {
    try {
      setLoading(true)
      const data = await loadEntries(userEmail)
      setEntries(data)
    } catch (error) {
      console.error('Error fetching entries for calendar:', error)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  // Get the first day of the current month
  const getFirstDayOfMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  }

  // Get the last day of the current month
  const getLastDayOfMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  }

  // Get the starting date for the calendar (may be from previous month)
  const getCalendarStartDate = () => {
    const firstDay = getFirstDayOfMonth()
    const dayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - dayOfWeek)
    return startDate
  }

  // Generate 42 days (6 weeks) for the calendar grid
  const generateCalendarDays = () => {
    const days = []
    const startDate = getCalendarStartDate()
    
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate)
      currentDay.setDate(startDate.getDate() + i)
      days.push(currentDay)
    }
    
    return days
  }

  // Get mood data for a specific date
  const getMoodForDate = (date) => {
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
    
    const dayEntries = entries.filter(entry => entry.date === dateStr)
    
    if (dayEntries.length === 0) return null
    
    // If multiple entries for the same day, calculate average
    const avgMood = dayEntries.reduce((sum, entry) => sum + entry.mood, 0) / dayEntries.length
    const roundedMood = Math.round(avgMood)
    
    return {
      mood: roundedMood,
      entries: dayEntries,
      count: dayEntries.length
    }
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // Check if a date is in the current month
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl">
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-spin">📅</div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Calendar</h2>
          <p className="text-white/70">Fetching your mood history...</p>
        </div>
      </div>
    )
  }

  const calendarDays = generateCalendarDays()

  // Filter entries based on search term and mood filter
  const getFilteredEntries = (dayEntries) => {
    let filtered = [...dayEntries]
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(entry => 
        (entry.note && entry.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    }
    
    // Apply mood filter
    if (filterMood !== 'all') {
      filtered = filtered.filter(entry => entry.mood === parseInt(filterMood))
    }
    
    return filtered
  }

  // Generate daily summary stats
  const getDailySummary = (dayEntries) => {
    if (!dayEntries.length) return null
    
    const moods = dayEntries.map(entry => entry.mood)
    const avgMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length
    const minMood = Math.min(...moods)
    const maxMood = Math.max(...moods)
    const moodRange = maxMood - minMood
    
    // Get all unique tags
    const allTags = dayEntries.flatMap(entry => entry.tags || [])
    const uniqueTags = [...new Set(allTags)]
    
    // Mood trend (simplified)
    let trend = 'stable'
    if (dayEntries.length > 1) {
      const firstMood = dayEntries[dayEntries.length - 1].mood
      const lastMood = dayEntries[0].mood
      if (lastMood > firstMood + 0.5) trend = 'improving'
      else if (lastMood < firstMood - 0.5) trend = 'declining'
    }
    
    return {
      avgMood: Math.round(avgMood * 10) / 10,
      minMood,
      maxMood,
      moodRange,
      uniqueTags,
      trend,
      totalEntries: dayEntries.length
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-xl">
      <div className="flex gap-6 h-[580px]">
        {/* Left Side - Calendar */}
        <div className="flex-shrink-0 w-[420px] calendar-container">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
            >
              ←
            </button>
            
            <h2 className="text-xl font-bold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
            >
              →
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1.5 mb-3">
            {weekDays.map(day => (
              <div key={day} className="text-center text-white/70 text-sm font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((date, index) => {
              const moodData = getMoodForDate(date)
              const isCurrentMonthDay = isCurrentMonth(date)
              const isTodayDate = isToday(date)
              
              return (
                <div
                  key={index}
                  className={`
                    relative w-12 h-12 rounded-lg border transition-all duration-300 cursor-pointer
                    ${isCurrentMonthDay ? 'opacity-100' : 'opacity-40'}
                    ${isTodayDate ? 'ring-2 ring-white/50' : ''}
                    ${moodData 
                      ? `${MOOD_COLORS[moodData.mood]} ${MOOD_COLORS_HOVER[moodData.mood]}` 
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                    }
                  `}
                  onClick={() => {
                    if (moodData) {
                      setSelectedDay({ date, moodData })
                    }
                  }}
                >
                  {/* Day Number */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-sm font-medium ${
                      moodData ? 'text-gray-700' : 'text-white/90'
                    }`}>
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Mood Emoji (if there's mood data) */}
                  {moodData && (
                    <div className="absolute top-0.5 right-0.5 text-xs">
                      {MoodEmojis[moodData.mood]}
                    </div>
                  )}

                  {/* Multiple entries indicator */}
                  {moodData && moodData.count > 1 && (
                    <div className="absolute bottom-0.5 right-0.5 bg-white/80 text-gray-700 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {moodData.count}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Mood Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="text-white/70 text-sm mr-1">Mood Scale:</span>
            {[1, 2, 3, 4, 5].map(mood => (
              <div key={mood} className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded border ${MOOD_COLORS[mood]}`}></div>
                <span className="text-white/70 text-sm">{mood}</span>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {entries.length === 0 && (
            <div className="text-center py-6 text-white/60">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-sm">No mood entries yet. Start tracking to see your mood calendar!</p>
            </div>
          )}
        </div>

        {/* Right Side - Chat Box (Full Width) */}
        <div className="flex-1">
          {selectedDay && selectedDay.moodData ? (
            <div className="h-full bg-white rounded-2xl shadow-xl border border-gray-200 chat-container flex flex-col">
              {/* Header - like messenger chat header */}
              <div className="bg-gray-50 px-6 py-4 rounded-t-2xl border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {selectedDay.date.getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 text-lg">
                        {selectedDay.date.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {selectedDay.moodData.count} {selectedDay.moodData.count === 1 ? 'entry' : 'entries'} • {selectedDay.date.getFullYear()}
                      </div>
                    </div>
                  </div>
                  {/* Close button */}
                  <button 
                    onClick={() => setSelectedDay(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {/* Daily Summary Card */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                {(() => {
                  const summary = getDailySummary(selectedDay.moodData.entries)
                  return (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{summary.avgMood}</div>
                        <div className="text-xs text-gray-600">Avg Mood</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{summary.maxMood}</div>
                        <div className="text-xs text-gray-600">Peak Mood</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-medium text-gray-700">
                          {summary.trend === 'improving' ? '📈' : summary.trend === 'declining' ? '📉' : '➡️'}
                        </div>
                        <div className="text-xs text-gray-600 capitalize">{summary.trend}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-medium text-purple-600">{summary.uniqueTags.length}</div>
                        <div className="text-xs text-gray-600">Tags Used</div>
                      </div>
                    </div>
                  )
                })()}
              </div>

              {/* Search & Filter Controls */}
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <div className="flex gap-3 mb-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search notes and tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filterMood}
                    onChange={(e) => setFilterMood(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Moods</option>
                    <option value="5">😄 Very Happy (5)</option>
                    <option value="4">😊 Happy (4)</option>
                    <option value="3">😐 Neutral (3)</option>
                    <option value="2">😔 Sad (2)</option>
                    <option value="1">😢 Very Sad (1)</option>
                  </select>
                </div>
                
                {/* Tags Filter */}
                {(() => {
                  const summary = getDailySummary(selectedDay.moodData.entries)
                  return summary.uniqueTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500 self-center mr-2">Tags:</span>
                      {summary.uniqueTags.map((tag, index) => (
                        <button
                          key={index}
                          onClick={() => setSearchTerm(tag)}
                          className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )
                })()}
              </div>

              {/* Messages Container - scrollable like messenger */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {(() => {
                  const filteredEntries = getFilteredEntries(selectedDay.moodData.entries)
                  
                  if (filteredEntries.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-2">🔍</div>
                        <p className="text-sm">No entries match your search criteria</p>
                        <button 
                          onClick={() => { setSearchTerm(''); setFilterMood('all') }}
                          className="text-blue-500 text-sm mt-2 hover:underline"
                        >
                          Clear filters
                        </button>
                      </div>
                    )
                  }
                  
                  return filteredEntries.map((entry, index) => {
                    // Create a time stamp for each entry (since we don't store time, we'll simulate it)
                    const timeStamp = `${8 + index}:${String((index * 15) % 60).padStart(2, '0')} AM`
                    
                    return (
                      <div key={index} className="flex flex-col">
                        {/* Message bubble */}
                        <div className="max-w-lg ml-auto">
                          <div className="bg-blue-500 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{MoodEmojis[entry.mood]}</span>
                              <span className="text-sm font-medium">Mood: {entry.mood}/5</span>
                            </div>
                            
                            {/* Tags if available */}
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {entry.tags.map((tag, tagIndex) => (
                                  <span 
                                    key={tagIndex}
                                    className="bg-white/20 text-xs px-2 py-1 rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* Note if available */}
                            {entry.note && (
                              <p className="text-sm leading-relaxed">{entry.note}</p>
                            )}
                          </div>
                          
                          {/* Timestamp */}
                          <div className="text-xs text-gray-500 mt-1 text-right">
                            {timeStamp}
                          </div>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
              
              {/* Footer - summary like messenger info */}
              <div className="bg-gray-50 px-6 py-3 rounded-b-2xl border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="font-medium">Average: {selectedDay.moodData.mood}/5</span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                    Active day
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white/5 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
              <div className="text-center text-white/60">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-xl font-medium mb-3">Select a date to view entries</p>
                <p className="text-base">Click on any colored date in the calendar to see your mood entries for that day</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarHeatmap
