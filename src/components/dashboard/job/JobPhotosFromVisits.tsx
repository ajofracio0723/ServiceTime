import React, { useState, useEffect } from 'react';
import { Camera, Calendar, User } from 'lucide-react';
import { getJobPhotosFromVisits, getJobPhotosGroupedByVisit, VisitPhoto } from '../../../utils/jobPhotoUtils';

interface JobPhotosFromVisitsProps {
  jobId: string;
}

export const JobPhotosFromVisits: React.FC<JobPhotosFromVisitsProps> = ({ jobId }) => {
  const [photos, setPhotos] = useState<VisitPhoto[]>([]);
  const [groupedPhotos, setGroupedPhotos] = useState<Record<string, VisitPhoto[]>>({});
  const [viewMode, setViewMode] = useState<'all' | 'by-visit'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchPhotos = () => {
      const allPhotos = getJobPhotosFromVisits(jobId);
      const grouped = getJobPhotosGroupedByVisit(jobId);
      setPhotos(allPhotos);
      setGroupedPhotos(grouped);
    };

    fetchPhotos();
    // Refresh photos every 30 seconds to catch new uploads from visits
    const interval = setInterval(fetchPhotos, 30000);
    return () => clearInterval(interval);
  }, [jobId]);

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'All Photos', count: photos.length },
    { value: 'before', label: 'Before', count: photos.filter(p => p.category === 'before').length },
    { value: 'during', label: 'During', count: photos.filter(p => p.category === 'during').length },
    { value: 'after', label: 'After', count: photos.filter(p => p.category === 'after').length },
    { value: 'issue', label: 'Issues', count: photos.filter(p => p.category === 'issue').length },
    { value: 'completion', label: 'Completion', count: photos.filter(p => p.category === 'completion').length },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      before: 'bg-blue-100 text-blue-800',
      during: 'bg-yellow-100 text-yellow-800',
      after: 'bg-green-100 text-green-800',
      issue: 'bg-red-100 text-red-800',
      completion: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Photos Yet</h3>
        <p className="text-gray-500">
          Photos will appear here automatically when technicians upload them during visits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with view controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Job Photos</h3>
          <p className="text-sm text-gray-500">{photos.length} photos from visits</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'all' | 'by-visit')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Photos</option>
            <option value="by-visit">Group by Visit</option>
          </select>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.value
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* Photos display */}
      {viewMode === 'all' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotos.map(photo => (
            <div key={photo.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(photo.category)}`}>
                    {photo.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(photo.timestamp).toLocaleDateString()}
                  </span>
                </div>
                {photo.caption && (
                  <p className="text-sm text-gray-600 mb-2">{photo.caption}</p>
                )}
                <div className="flex items-center text-xs text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {photo.technicianId}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {photo.visitDate}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPhotos).map(([visitId, visitPhotos]) => {
            const filteredVisitPhotos = selectedCategory === 'all' 
              ? visitPhotos 
              : visitPhotos.filter(photo => photo.category === selectedCategory);
            
            if (filteredVisitPhotos.length === 0) return null;

            return (
              <div key={visitId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                  <h4 className="font-medium text-gray-900">
                    Visit on {filteredVisitPhotos[0]?.visitDate}
                  </h4>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {filteredVisitPhotos.length} photos
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVisitPhotos.map(photo => (
                    <div key={photo.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                        <img
                          src={photo.url}
                          alt={photo.caption}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(photo.category)}`}>
                            {photo.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(photo.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        {photo.caption && (
                          <p className="text-sm text-gray-600">{photo.caption}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
