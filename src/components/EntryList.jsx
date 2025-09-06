import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { MoodEmojis, MoodColors, IntensityLabels, TAG_CATEGORIES } from '../utils/constants'
import { getPromptById } from '../utils/prompts'
import { getPhoto } from '../utils/photoStorage'
import PhotoManager from './PhotoManager'

// Full-size photo modal component
const PhotoModal = ({ photo, onClose }) => {
  if (!photo) return null

  // Prevent body scrolling when modal is open and handle keyboard events
  React.useEffect(() => {
    document.body.style.overflow = 'hidden'
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm" 
      onClick={onClose}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div 
        className="relative p-4 flex items-center justify-center" 
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
      >
        <img
          src={photo.url || photo.dataUrl}
          alt={photo.fileName || 'Mood photo'}
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          style={{
            maxWidth: '85vw',
            maxHeight: '85vh',
            width: 'auto',
            height: 'auto'
          }}
          onError={(e) => {
            console.error('❌ Modal image failed to load:', photo.url || photo.dataUrl)
          }}
          onLoad={() => {
            console.log('✅ Modal image loaded successfully')
          }}
        />
        
        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-3 rounded-full bg-white text-gray-800 hover:bg-gray-100 shadow-lg transition-all duration-200 hover:scale-110"
          style={{ zIndex: 10000 }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Photo info - bottom center */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 text-gray-800 text-sm font-medium shadow-lg">
            {photo.fileName || 'Mood photo'}
          </div>
        </div>
      </div>
      
      {/* Click outside hint */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          Click anywhere to close
        </div>
      </div>
    </div>
  )

  // Render modal using portal to escape container constraints
  return createPortal(modalContent, document.body)
}

// Photo thumbnail component
const PhotoThumbnail = ({ photo, onClick, size = 'small' }) => {
  // Determine photo data and URL based on source
  let photoData = photo
  let imageUrl = null
  
  // Priority: S3 URL > localStorage dataUrl > fallback lookup
  if (photo.url) {
    // S3 photo - use directly
    imageUrl = photo.url
  } else if (photo.dataUrl) {
    // localStorage photo with dataUrl
    imageUrl = photo.dataUrl
  } else if (photo.id) {
    // Fallback: try to get from localStorage by ID
    const storedPhoto = getPhoto(photo.id)
    if (storedPhoto) {
      photoData = storedPhoto
      imageUrl = storedPhoto.dataUrl || storedPhoto.url
    }
  }
  
  // Enhanced debug logging
  console.log('🖼️ PhotoThumbnail rendering:', {
    originalPhoto: {
      id: photo.id,
      fileName: photo.fileName,
      hasUrl: !!photo.url,
      hasDataUrl: !!photo.dataUrl,
      url: photo.url ? photo.url.substring(0, 50) + '...' : null
    },
    finalImageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : null,
    hasValidImage: !!imageUrl,
    photoSource: photo.url ? 'S3' : photo.dataUrl ? 'localStorage-dataUrl' : 'fallback-lookup'
  })
  
  if (!imageUrl) {
    console.warn('⚠️ No valid image URL found for photo:', photo)
    return (
      <div className={`${size === 'large' ? 'w-32 h-32' : 'w-16 h-16'} bg-white/10 rounded-xl flex items-center justify-center text-white/50 border border-white/20`}>
        <div className="text-center">
          <div className="text-2xl mb-1">🖼️</div>
          <span className="text-xs">No Image</span>
          <span className="text-xs block">{photo.fileName || 'Unknown'}</span>
        </div>
      </div>
    )
  }

  const sizeClasses = size === 'large' ? 'w-32 h-32' : 'w-16 h-16'

  return (
    <div 
      className={`${sizeClasses} rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300 border-2 border-white/30 hover:border-white/60 shadow-lg hover:shadow-2xl relative group`}
      onClick={() => onClick(photoData)}
    >
      <img
        src={imageUrl}
        alt={photoData.fileName || 'Mood photo'}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('❌ Image failed to load:', imageUrl, e)
          e.target.style.display = 'none'
        }}
        onLoad={() => {
          console.log('✅ Image loaded successfully:', imageUrl ? imageUrl.substring(0, 50) + '...' : 'null')
        }}
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="bg-white/90 rounded-full p-2">
          <svg className="w-5 h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>
    </div>
  )
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

function EntryList({ entries, isLoading, onEntryUpdate }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ENTRIES_PER_PAGE = 5 // Show 5 entries per page
  
  // Debug logging to see what entries we have
  React.useEffect(() => {
    console.log('📝 EntryList received entries:', entries.length)
    entries.forEach((entry, index) => {
      console.log(`Entry ${index}:`, {
        id: entry.id,
        hasPhotos: entry.photos?.length > 0,
        photosCount: entry.photos?.length || 0,
        photos: entry.photos
      })
    })
  }, [entries])

  // Calculate pagination
  const totalPages = Math.ceil(entries.length / ENTRIES_PER_PAGE)
  const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE
  const endIndex = startIndex + ENTRIES_PER_PAGE
  const currentEntries = entries.slice(startIndex, endIndex)

  // Reset to first page when entries change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [entries.length])

  const renderPromptDisplay = (entry) => {
    if (!entry.promptId) return null
    
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
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold text-white">Recent Entries</h3>
        <div className="text-white/60 text-sm">
          {entries.length > 0 ? (
            <span>Showing {startIndex + 1}-{Math.min(endIndex, entries.length)} of {entries.length}</span>
          ) : null}
        </div>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <LoadingSkeleton />
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <div className="text-4xl mb-4">📝</div>
            <p>No entries yet. Add your first mood!</p>
          </div>
        ) : (
          currentEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70 text-sm font-medium">{entry.date}</span>
                <div className="flex items-center gap-2">
                  {/* Edit Photos Button */}
                  <button
                    onClick={() => setEditingEntry(entry)}
                    className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Edit photos"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{MoodEmojis[entry.mood]}</span>
                </div>
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
              {renderPromptDisplay(entry)}
              
              {/* Photos Display - Enhanced */}
              {entry.photos && entry.photos.length > 0 && (
                <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-white/90 text-base font-medium mb-3 flex items-center gap-2">
                    <span className="text-xl">📷</span>
                    <span>Photos ({entry.photos.length})</span>
                  </div>
                  <div className={`grid gap-3 ${
                    entry.photos.length === 1 ? 'grid-cols-1 max-w-xs' :
                    entry.photos.length === 2 ? 'grid-cols-2 max-w-sm' :
                    'grid-cols-3 max-w-md'
                  }`}>
                    {entry.photos.map((photo, photoIndex) => (
                      <PhotoThumbnail
                        key={photoIndex}
                        photo={photo}
                        onClick={setSelectedPhoto}
                        size="large"
                      />
                    ))}
                  </div>
                  <div className="text-white/60 text-xs mt-2 text-center">
                    👆 Click any photo to view full size
                  </div>
                </div>
              )}
              
              {entry.note && (
                <p className="text-white/90 mt-4 leading-relaxed">{entry.note}</p>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else {
                const start = Math.max(1, currentPage - 2)
                const end = Math.min(totalPages, start + 4)
                pageNum = start + i
                if (pageNum > end) return null
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                    currentPage === pageNum
                      ? 'bg-white text-purple-700 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}
      
      {/* Photo Manager Modal */}
      {editingEntry && (
        <PhotoManager
          entry={editingEntry}
          onUpdate={(updatedEntry) => {
            if (onEntryUpdate) {
              onEntryUpdate(updatedEntry)
            }
          }}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  )
}

export default EntryList
