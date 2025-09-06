// Mood Emojis mapping (1-5 scale)
export const MoodEmojis = {
    1: '😔',
    2: '😕',
    3: '😐',
    4: '😊',
    5: '😄'
}

// Quick emoji selection for one-tap mood entry
export const QuickMoodEmojis = [
    { emoji: '😭', mood: 1, intensity: 8, label: 'Very Sad' },
    { emoji: '😔', mood: 1, intensity: 5, label: 'Sad' },
    { emoji: '😕', mood: 2, intensity: 5, label: 'Down' },
    { emoji: '😐', mood: 3, intensity: 4, label: 'Neutral' },
    { emoji: '🙂', mood: 4, intensity: 4, label: 'Okay' },
    { emoji: '😊', mood: 4, intensity: 6, label: 'Good' },
    { emoji: '😄', mood: 5, intensity: 7, label: 'Happy' },
    { emoji: '🤩', mood: 5, intensity: 9, label: 'Amazing' },
]

// Intensity labels for the 1-10 scale
export const IntensityLabels = {
    1: 'Very\nWeak',
    2: 'Weak', 
    3: 'Light',
    4: 'Mild',
    5: 'Moderate',
    6: 'Strong',
    7: 'Very\nStrong',
    8: 'Intense',
    9: 'Extreme',
    10: 'Over-\nwhelming'
}

export const MoodColors = {
    1: 'from-slate-500 to-slate-600',
    2: 'from-orange-400 to-red-500',
    3: 'from-blue-400 to-cyan-500',
    4: 'from-green-400 to-emerald-500',
    5: 'from-pink-400 to-yellow-400'
}

// Tag categories with emojis and colors
export const TAG_CATEGORIES = {
    'work': { emoji: '💼', color: 'bg-blue-500/80' },
    'family': { emoji: '👨‍👩‍👧‍👦', color: 'bg-green-500/80' },
    'health': { emoji: '🏥', color: 'bg-red-500/80' },
    'social': { emoji: '👥', color: 'bg-purple-500/80' },
    'sleep': { emoji: '😴', color: 'bg-indigo-500/80' },
    'exercise': { emoji: '💪', color: 'bg-orange-500/80' },
    'food': { emoji: '🍽️', color: 'bg-yellow-500/80' },
    'weather': { emoji: '🌤️', color: 'bg-cyan-500/80' },
    'stress': { emoji: '😰', color: 'bg-red-600/80' },
    'joy': { emoji: '😊', color: 'bg-pink-500/80' },
    'quick-checkin': { emoji: '⚡', color: 'bg-violet-500/80' }
}
