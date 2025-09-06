import React, { useState, useEffect } from 'react'
import EntryForm from '../components/EntryForm'
import EntryList from '../components/EntryList'
import CalendarHeatmap from '../components/CalendarHeatmap'
import Analytics from '../components/Analytics'
import AITherapist from '../components/AITherapist'
import Greeting from '../components/Greeting'
import { loadEntries, addEntry } from '../utils/api'
import { processAndUploadPhotos, deletePhotoFromS3 } from '../utils/s3PhotoApi'
import { storeMultiplePhotos } from '../utils/photoStorage'
import { loadEntriesFromLocal, addEntryToLocal, updateEntryInLocal, mergeEntries, cleanupDuplicateEntries } from '../utils/localStorageApi'
import { useAuth } from '../context/AuthContext'

function DashboardPage({ user }) {
  const { signOut } = useAuth()
  const [entries, setEntries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('entries')
  const [showSuccess, setShowSuccess] = useState(false)
  // Load entries from both API and localStorage when component mounts or user changes
  useEffect(() => {
    const loadUserEntries = async () => {
      // Clear entries immediately when user changes
      setEntries([])
      setIsLoading(true)
      
      if (user && user.email) {
        try {
          // Clean up duplicates first
          const duplicatesRemoved = cleanupDuplicateEntries(user.email)
          if (duplicatesRemoved > 0) {
            console.log('🧽 Cleaned up', duplicatesRemoved, 'duplicate entries')
          }
          
          // TEMPORARY: Load from localStorage only to prevent duplicates
          // TODO: Re-enable API sync once duplicate issue is resolved
          const localEntries = loadEntriesFromLocal(user.email)
          console.log('📊 Loading from localStorage only:', localEntries.length, 'entries')
          console.log('🚫 API sync temporarily disabled to prevent duplicates')
          
          setEntries(localEntries)
        } catch (error) {
          console.error('❌ Failed to load entries:', error)
          setEntries([])
        }
      }
      setIsLoading(false)
    }
    
    loadUserEntries()
    
    // Expose cleanup function globally for manual testing
    if (user?.email && typeof window !== 'undefined') {
      window.cleanupDuplicates = () => {
        const removed = cleanupDuplicateEntries(user.email)
        console.log('🧽 Manual cleanup completed. Removed', removed, 'duplicates')
        loadUserEntries() // Reload entries
        return removed
      }
      
      // Add manual refresh function for debugging
      window.refreshEntries = loadUserEntries
    }
  }, [user?.email])

  const handleEntryUpdate = async (updatedEntry) => {
    try {
      // Update the entry in the local state
      setEntries(prevEntries => 
        prevEntries.map(entry => 
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      )
      
      // Save updated entry to localStorage
      if (user && user.email) {
        updateEntryInLocal(user.email, updatedEntry)
        console.log('📝 Entry updated in localStorage:', updatedEntry.id)
      }
    } catch (error) {
      console.error('Failed to update entry:', error)
      alert('Failed to update entry. Please try again.')
    }
  }

  const handleAddEntry = async (newEntry) => {
    const now = new Date()
    
    // Handle photo storage if photos are included
    let storedPhotos = []
    if (newEntry.photos && newEntry.photos.length > 0) {
      console.log('📷 Processing photos for entry:', newEntry.photos.length, 'photos')
      console.log('📅 Photo data structure:', newEntry.photos.map(p => ({
        id: p.id,
        fileName: p.fileName,
        fileSize: p.fileSize,
        hasFile: !!p.file,
        hasDataUrl: !!p.dataUrl,
        fileType: p.fileType
      })))
      
      try {
        console.log('🚀 Starting S3 upload process...')
        // Upload photos to S3 with compression
        storedPhotos = await processAndUploadPhotos(newEntry.photos, user.email)
        console.log('🏢 Uploaded photos to S3:', storedPhotos.length)
        console.log('🖼️ S3 photo URLs:', storedPhotos.map(p => p.url))
        
        // If S3 upload succeeded but returned no photos, try localStorage fallback
        if (storedPhotos.length === 0) {
          console.warn('⚠️ S3 upload returned 0 photos, trying localStorage fallback')
          storedPhotos = await storeMultiplePhotos(newEntry.photos)
          console.log('💾 Fallback: stored photos locally:', storedPhotos.length)
        }
      } catch (error) {
        console.error('❌ Error uploading photos to S3:', error)
        console.error('🗏 Stack trace:', error.stack)
        
        // Fallback to localStorage if S3 fails
        try {
          console.log('💾 Attempting localStorage fallback...')
          storedPhotos = await storeMultiplePhotos(newEntry.photos)
          console.log('💾 Fallback: stored photos locally after S3 error:', storedPhotos.length)
        } catch (fallbackError) {
          console.error('❌ Fallback storage also failed:', fallbackError)
          alert('Failed to store photos. Entry will be saved without photos. You can edit the entry later to add photos.')
        }
      }
    }
    
    const entry = {
      id: Date.now(), // Use timestamp as unique ID
      date: now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      createdAt: now.toISOString(),
      timestamp: now.toISOString(),
      ...newEntry,
      photos: storedPhotos
    }
    
    console.log('💾 Creating entry with ID:', entry.id)
    
    try {
      if (user && user.email) {
        // Save to localStorage (primary storage for photos and offline support)
        addEntryToLocal(user.email, entry)
        console.log('💾 Entry saved to localStorage with photos')
        
        // DISABLED API sync temporarily to prevent duplicates
        // TODO: Re-enable once duplicate issue is fully resolved
        console.log('🚫 API sync disabled to prevent duplicates - data is safe in localStorage')
        
        // Update UI state directly instead of reloading
        // This prevents the double entry issue by avoiding the merge process
        const updatedEntries = [entry, ...entries]
        setEntries(updatedEntries)
        
        console.log('✅ Entry added to UI state, total entries:', updatedEntries.length)
      }
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('❌ Failed to save entry:', error)
      alert('Failed to save entry. Please try again.')
    }
  }

  return (
    <div className="min-h-screen relative w-full" style={{ margin: 0, padding: 0 }}>
      {/* Floating animated orbs */}
      <div 
        className="fixed top-20 right-20 w-32 h-32 theme-orb-1 rounded-full blur-2xl" 
        style={{
          animation: 'floatOrb1 22s ease-in-out infinite'
        }}
      ></div>
      <div 
        className="fixed bottom-20 left-20 w-40 h-40 theme-orb-2 rounded-full blur-2xl" 
        style={{
          animation: 'floatOrb2 28s ease-in-out infinite reverse'
        }}
      ></div>
      <nav className="bg-theme-glass border-b border-theme-glass sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-300"
              onClick={() => {
                setActiveTab('entries')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              title="Go to Mood Entries"
            >
              <span className="text-2xl">🌈</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">MoodFlow</h1>
            </div>
            <button 
              onClick={() => signOut()} 
              className="px-4 py-2 rounded-2xl bg-theme-glass text-theme-primary hover:bg-theme-glass border border-theme-glass hover:border-theme-glass transition-all duration-300 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-6 sm:py-12">
        <div className="mb-12 text-center sm:text-left">
          <Greeting 
            username={user.displayUsername || user.username || user.email.split('@')[0]} 
            recentMoods={entries.slice(0, 5)} 
            rotationInterval={30} 
          />
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8 mx-2 sm:mx-0">
          <div className="flex space-x-1 bg-theme-glass rounded-2xl p-1">
            <button
              onClick={() => setActiveTab('entries')}
              className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 text-xs sm:text-base ${
                activeTab === 'entries'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'text-theme-primary hover:bg-theme-glass'
              }`}
            >
              📝 Mood Entries
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 text-xs sm:text-base ${
                activeTab === 'calendar'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'text-theme-primary hover:bg-theme-glass'
              }`}
            >
              📅 Calendar
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 text-xs sm:text-base ${
                activeTab === 'analytics'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'text-theme-primary hover:bg-theme-glass'
              }`}
            >
              📆 Analytics
            </button>
            <button
              onClick={() => setActiveTab('therapy')}
              className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 text-xs sm:text-base ${
                activeTab === 'therapy'
                  ? 'bg-white text-purple-700 shadow-lg'
                  : 'text-theme-primary hover:bg-theme-glass'
              }`}
            >
              🤖 AI Chat
            </button>
          </div>
        </div>
        
        {showSuccess && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-white backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✨</span>
              <span className="font-medium">Mood entry saved successfully!</span>
            </div>
          </div>
        )}
        
        {/* Tab Content */}
        <div style={{ minHeight: '600px' }} className="overflow-hidden px-2 sm:px-0">
          {activeTab === 'entries' && (
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
              <EntryForm onAddEntry={handleAddEntry} />
              <EntryList entries={entries} isLoading={isLoading} onEntryUpdate={handleEntryUpdate} />
            </div>
          )}
          {activeTab === 'calendar' && (
            <CalendarHeatmap userEmail={user.email} />
          )}
          {activeTab === 'analytics' && (
            <Analytics userEmail={user.email} />
          )}
          {activeTab === 'therapy' && (
            <div style={{ height: '70vh', minHeight: '500px' }}>
              <AITherapist />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage