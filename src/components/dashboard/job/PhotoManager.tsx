import React, { useState, useRef } from 'react';
import { Camera, X, Eye, Download, Trash2 } from 'lucide-react';
import { JobPhoto } from './types';

interface PhotoManagerProps {
  photos: JobPhoto[];
  onPhotosChange: (photos: JobPhoto[]) => void;
  maxPhotos?: number;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 20 
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<JobPhoto | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newPhotos: JobPhoto[] = [];
    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto: JobPhoto = {
            id: `photo_${Date.now()}_${i}`,
            url: e.target?.result as string,
            filename: file.name,
            category: 'other',
            uploadedBy: 'current_user',
            uploadedAt: new Date().toISOString()
          };
          newPhotos.push(newPhoto);
          
          if (newPhotos.length === filesToProcess) {
            onPhotosChange([...photos, ...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removePhoto = (photoId: string) => {
    onPhotosChange(photos.filter(photo => photo.id !== photoId));
  };

  const updatePhotoCategory = (photoId: string, category: JobPhoto['category']) => {
    onPhotosChange(photos.map(photo => 
      photo.id === photoId ? { ...photo, category } : photo
    ));
  };

  const updatePhotoDescription = (photoId: string, description: string) => {
    onPhotosChange(photos.map(photo => 
      photo.id === photoId ? { ...photo, description } : photo
    ));
  };

  const getCategoryColor = (category: JobPhoto['category']) => {
    switch (category) {
      case 'before': return 'bg-blue-100 text-blue-800';
      case 'during': return 'bg-yellow-100 text-yellow-800';
      case 'after': return 'bg-green-100 text-green-800';
      case 'issue': return 'bg-red-100 text-red-800';
      case 'completion': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Drop photos here or{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            browse to upload
          </button>
        </p>
        <p className="text-sm text-gray-500">
          {photos.length}/{maxPhotos} photos • PNG, JPG, GIF up to 10MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.description || photo.filename}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setPreviewPhoto(photo)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title="View Photo"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 text-red-600"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Photo Info */}
              <div className="mt-2 space-y-2">
                <select
                  value={photo.category}
                  onChange={(e) => updatePhotoCategory(photo.id, e.target.value as JobPhoto['category'])}
                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="before">Before</option>
                  <option value="during">During</option>
                  <option value="after">After</option>
                  <option value="issue">Issue</option>
                  <option value="completion">Completion</option>
                  <option value="other">Other</option>
                </select>

                <input
                  type="text"
                  value={photo.description || ''}
                  onChange={(e) => updatePhotoDescription(photo.id, e.target.value)}
                  placeholder="Add description..."
                  className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(photo.category)}`}>
                  {photo.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <img
              src={previewPhoto.url}
              alt={previewPhoto.description || previewPhoto.filename}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            <div className="absolute bottom-4 left-4 right-4 bg-white bg-opacity-90 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{previewPhoto.filename}</h3>
                  {previewPhoto.description && (
                    <p className="text-sm text-gray-600">{previewPhoto.description}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCategoryColor(previewPhoto.category)}`}>
                      {previewPhoto.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(previewPhoto.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = previewPhoto.url;
                    link.download = previewPhoto.filename;
                    link.click();
                  }}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  title="Download Photo"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
