import React, { useState } from 'react'
import PhotoUpload from './PhotoUpload'
import { storeMultiplePhotos, deletePhoto } from '../utils/photoStorage'

function PhotoManager({ entry, onUpdate, onClose }) {
  const [photos, setPhotos] = useState(entry.photos || [])
  const [isUpdating, setIsUpdating] = useState(false)

  const handlePhotoAdd = (photoData) => {
    setPhotos(prev => [...prev, photoData])
  }

  const handlePhotoRemove = (photoId) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId))
  }

  const handleSave = async () => {
    setIsUpdating(true)
    try {
      // Find new photos that need to be stored
      const newPhotos = photos.filter(photo => photo.file && !photo.id.startsWith('photo_'))
      const existingPhotos = photos.filter(photo => !photo.file || photo.id.startsWith('photo_'))

      // Store new photos
      let storedNewPhotos = []
      if (newPhotos.length > 0) {
        storedNewPhotos = await storeMultiplePhotos(newPhotos)
      }

      // Combine existing and new photos
      const updatedPhotos = [...existingPhotos, ...storedNewPhotos]

      // Delete removed photos from storage
      const removedPhotoIds = (entry.photos || [])
        .filter(oldPhoto => !updatedPhotos.find(newPhoto => newPhoto.id === oldPhoto.id))
        .map(photo => photo.id)

      removedPhotoIds.forEach(photoId => {
        if (photoId.startsWith('photo_')) {
          deletePhoto(photoId)
        }
      })

      // Update the entry
      const updatedEntry = {
        ...entry,
        photos: updatedPhotos
      }

      onUpdate(updatedEntry)
      onClose()
    } catch (error) {
      console.error('Error updating photos:', error)
      alert('Failed to update photos. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-3xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20 mx-4 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-3">
            <span className="text-2xl">📷</span>
            Manage Photos
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{entry.mood ? `😊😐😢🥺😭`[entry.mood - 1] : '😐'}</span>
            <div>
              <div className="text-white font-medium">Entry from {entry.date}</div>
              <div className="text-white/60 text-sm">Mood: {entry.mood}/5 • Intensity: {entry.intensity}/10</div>
            </div>
          </div>
          {entry.note && (
            <p className="text-white/80 text-sm mt-2 line-clamp-2">{entry.note}</p>
          )}
        </div>

        <PhotoUpload
          photos={photos}
          onPhotoAdd={handlePhotoAdd}
          onPhotoRemove={handlePhotoRemove}
          maxPhotos={5}
        />

        <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="animate-spin text-lg">🔄</div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PhotoManager
