import React from 'react'

const MoodEmojis = {
  1: '😔',
  2: '😕', 
  3: '😐',
  4: '😊',
  5: '😄'
}

const MoodColors = {
  1: 'from-slate-500 to-slate-600',
  2: 'from-orange-400 to-red-500', 
  3: 'from-blue-400 to-cyan-500',
  4: 'from-green-400 to-emerald-500',
  5: 'from-pink-400 to-yellow-400'
}

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
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
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
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-white text-sm font-medium bg-gradient-to-r ${MoodColors[entry.mood]}`}>
                Mood Level {entry.mood}
              </div>
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