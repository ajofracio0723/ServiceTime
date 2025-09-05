import { useState } from 'react';
import { MapPin, ExternalLink, Search } from 'lucide-react';
import { MapPin as MapPinType } from './types';

interface LocationMapViewProps {
  latitude: number;
  longitude: number;
  mapPins?: MapPinType[];
  height?: string;
  propertyName?: string;
}

export const LocationMapView = ({
  latitude,
  longitude,
  mapPins = [],
  height = '300px',
  propertyName = 'Property'
}: LocationMapViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/@${latitude},${longitude},15z`;
    window.open(url, '_blank');
  };

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
  };
  
  const searchInGoogleMaps = () => {
    if (searchQuery.trim()) {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      window.open(url, '_blank');
    }
  };

  if (!latitude || !longitude) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No location coordinates available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Search nearby locations */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchInGoogleMaps()}
              placeholder="Search nearby (e.g., 'restaurants near here', 'gas stations')"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            type="button"
            onClick={searchInGoogleMaps}
            disabled={!searchQuery.trim()}
            className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-md ${
              !searchQuery.trim()
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </div>
      
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {propertyName} Location
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={openDirections}
            className="flex items-center space-x-1 text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded"
          >
            <MapPin className="w-3 h-3" />
            <span>Get Directions</span>
          </button>
          <button
            type="button"
            onClick={openInGoogleMaps}
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open in Maps</span>
          </button>
        </div>
      </div>
      
      <div 
        style={{ height }} 
        className="rounded-lg overflow-hidden border border-gray-300 bg-gray-100 relative"
      >
        {/* Embedded map using iframe */}
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.002},${latitude-0.002},${longitude+0.002},${latitude+0.002}&layer=mapnik&marker=${latitude},${longitude}`}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={`${propertyName} Location Map`}
        />
        
        {/* Main location marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <MapPin className="w-6 h-6 text-red-600 drop-shadow-lg" />
        </div>
        
        {/* Custom pins */}
        {mapPins.map((pin) => {
          // Calculate approximate position based on coordinate difference
          const latDiff = (pin.latitude - latitude) / 0.004; // 0.004 is our bbox range
          const lngDiff = (pin.longitude - longitude) / 0.004;
          const topPercent = 50 - (latDiff * 50); // Convert to percentage from center
          const leftPercent = 50 + (lngDiff * 50);
          
          return (
            <div
              key={pin.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                top: `${Math.max(5, Math.min(95, topPercent))}%`,
                left: `${Math.max(5, Math.min(95, leftPercent))}%`
              }}
            >
              <div className="relative group">
                <MapPin className={`w-4 h-4 drop-shadow-lg ${
                  pin.type === 'equipment' ? 'text-blue-600' :
                  pin.type === 'access' ? 'text-green-600' :
                  pin.type === 'parking' ? 'text-purple-600' :
                  pin.type === 'utility' ? 'text-orange-600' :
                  'text-gray-600'
                }`} />
                
                {/* Pin tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {pin.label}
                  {pin.description && <div className="text-gray-300">{pin.description}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
        <span>Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
        <span className="text-gray-400">Read-only view</span>
      </div>
    </div>
  );
};
