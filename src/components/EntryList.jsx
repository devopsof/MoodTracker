import React from 'react';

const MoodEmojis = {
  1: '😔',
  2: '😕', 
  3: '😐',
  4: '😊',
  5: '😄'
}

const MoodColors = {
  1: 'mood-gradient-1',
  2: 'mood-gradient-2', 
  3: 'mood-gradient-3',
  4: 'mood-gradient-4',
  5: 'mood-gradient-5'
}

function EntryList({ entries }) {
  return (
    <div className="glass-morphism rounded-2xl p-6 animate-slideIn">
      <h3 className="text-xl font-semibold text-white mb-6">Recent Entries</h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="p-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-white/80 text-sm">{entry.date}</span>
              <span className="text-2xl">{MoodEmojis[entry.mood]}</span>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-white text-xs ${MoodColors[entry.mood]}`}>
              Mood Level {entry.mood}
            </div>
            {entry.note && (
              <p className="text-white/90 mt-2">{entry.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default EntryList