import React, { useState } from 'react'

function PhotoUpload({ photos = [], onPhotoAdd, onPhotoRemove, maxPhotos = 3 }) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    processFiles(files)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragOver(false)
    const files = Array.from(event.dataTransfer.files)
    processFiles(files)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const processFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert('Please select image files only.')
      return
    }

    // Check if adding these files would exceed max photos
    if (photos.length + imageFiles.length > maxPhotos) {
      alert(`You can only add up to ${maxPhotos} photos per entry.`)
      return
    }

    imageFiles.forEach(file => {
      // Check file size (limit to 500KB per photo for localStorage efficiency)
      if (file.size > 500 * 1024) {
        alert(`${file.name} is too large. Please select images under 500KB for better performance.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const photoData = {
          id: Date.now() + Math.random(), // Temporary ID
          file: file,
          dataUrl: e.target.result,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }
        onPhotoAdd(photoData)
      }
      reader.readAsDataURL(file)
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer ${
          isDragOver 
            ? 'border-purple-400 bg-purple-500/10' 
            : 'border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('photo-upload').click()}
      >
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={photos.length >= maxPhotos}
        />
        
        {photos.length >= maxPhotos ? (
          <div className="text-white/60">
            <div className="text-4xl mb-2">📸</div>
            <div className="text-sm">Maximum {maxPhotos} photos reached</div>
          </div>
        ) : (
          <div className="text-white/80">
            <div className="text-4xl mb-2">📷</div>
            <div className="text-lg font-medium mb-1">Add Photos</div>
            <div className="text-sm text-white/60">
              Drag & drop or click to select images<br/>
              ({photos.length}/{maxPhotos} photos • Max 500KB each)
            </div>
          </div>
        )}
      </div>

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/90 text-sm font-medium">
              Selected Photos ({photos.length}/{maxPhotos})
            </span>
            <button
              type="button"
              onClick={() => photos.forEach(photo => onPhotoRemove(photo.id))}
              className="text-white/60 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              Remove All
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div 
                key={photo.id} 
                className="relative group rounded-2xl overflow-hidden bg-white/5 border border-white/10"
              >
                {/* Photo Preview */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={photo.dataUrl || photo.url}
                    alt={photo.fileName || 'Mood photo'}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay with controls */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPhotoRemove(photo.id)
                      }}
                      className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 transform hover:scale-110"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Photo Details */}
                <div className="p-3">
                  <div className="text-white/90 text-xs font-medium mb-1 truncate">
                    {photo.fileName || 'Mood photo'}
                  </div>
                  <div className="text-white/60 text-xs">
                    {photo.fileSize ? formatFileSize(photo.fileSize) : 'Unknown size'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoUpload
