import { useState } from 'react';
import { MapPin, ExternalLink, Search, X, Plus } from 'lucide-react';
import { MapPin as MapPinType } from './types';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  mapPins?: MapPinType[];
  onPinsChange?: (pins: MapPinType[]) => void;
  height?: string;
}

export const LocationMap = ({
  latitude,
  longitude,
  onLocationChange,
  mapPins = [],
  onPinsChange,
  height = '300px'
}: LocationMapProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showPinForm, setShowPinForm] = useState(false);
  const [newPin, setNewPin] = useState<{ label: string; description: string; type: MapPinType['type'] }>({ label: '', description: '', type: 'custom' });
  const [pendingPinLocation, setPendingPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isPinMode, setIsPinMode] = useState(false);
  
  // Default to a central location if no coordinates provided
  const defaultLat = latitude || 40.7128;
  const defaultLng = longitude || -74.0060;
  
  // Create map URL with better zoom controls
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${defaultLng-0.01},${defaultLat-0.01},${defaultLng+0.01},${defaultLat+0.01}&layer=mapnik&marker=${defaultLat},${defaultLng}`;

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newLat = defaultLat + (0.01 * (rect.height / 2 - y) / (rect.height / 2));
    const newLng = defaultLng + (0.01 * (x - rect.width / 2) / (rect.width / 2));
    
    if (isPinMode && onPinsChange) {
      // Pin mode - add a pin
      setPendingPinLocation({ lat: newLat, lng: newLng });
      setShowPinForm(true);
      setIsPinMode(false); // Exit pin mode after placing
    } else {
      // Regular click to set main location
      onLocationChange(newLat, newLng);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a location to search');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Search service unavailable');
      }
      
      const data = await response.json();
      
      if (data.length > 0) {
        const location = data[0];
        onLocationChange(parseFloat(location.lat), parseFloat(location.lon));
        setSearchError(null);
      } else {
        setSearchError('Location not found. Try a different search term.');
      }
    } catch (error) {
      setSearchError('Unable to search location. Please try again.');
      console.error('Location search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addPinAtCenter = () => {
    if (!onPinsChange) return;
    setPendingPinLocation({ lat: defaultLat, lng: defaultLng });
    setShowPinForm(true);
  };
  
  const addPin = () => {
    if (!pendingPinLocation || !newPin.label.trim() || !onPinsChange) return;
    
    const pin: MapPinType = {
      id: Date.now().toString(),
      latitude: pendingPinLocation.lat,
      longitude: pendingPinLocation.lng,
      label: newPin.label,
      description: newPin.description,
      type: newPin.type
    };
    
    onPinsChange([...mapPins, pin]);
    setShowPinForm(false);
    setPendingPinLocation(null);
    setNewPin({ label: '', description: '', type: 'custom' });
  };
  
  const removePin = (pinId: string) => {
    if (!onPinsChange) return;
    onPinsChange(mapPins.filter(pin => pin.id !== pinId));
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/@${latitude || defaultLat},${longitude || defaultLng},15z`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative">
      {/* Search Location */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
              placeholder="Search for a location (e.g., 'Central Park, New York' or '123 Main St, Boston')"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            type="button"
            onClick={searchLocation}
            disabled={isSearching}
            className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-md ${
              isSearching 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Search className={`w-4 h-4 ${isSearching ? 'animate-pulse' : ''}`} />
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>
        </div>
        
        {searchError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-2">
            <p className="text-sm text-red-700">{searchError}</p>
          </div>
        )}
      </div>
      
      <div className="mb-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {isPinMode ? 'Click on the map to place a pin' : 'Click on the map to set the property location'}
          </div>
          <button
            type="button"
            onClick={openInGoogleMaps}
            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open in Google Maps</span>
          </button>
        </div>
        
        {/* Pin Controls */}
        {onPinsChange && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsPinMode(!isPinMode)}
              className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-md ${
                isPinMode 
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{isPinMode ? 'Pin Mode ON' : 'Enable Pin Mode'}</span>
            </button>
            <button
              type="button"
              onClick={addPinAtCenter}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Pin Here</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="relative" onClick={handleMapClick}>
        <iframe
          src={mapUrl}
          width="100%"
          height={height}
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-lg cursor-crosshair"
          allow="geolocation"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
        
        {/* Main location marker */}
        {(latitude || longitude) && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <MapPin className="w-6 h-6 text-red-600 drop-shadow-lg" />
          </div>
        )}
        
        {/* Custom pins */}
        {mapPins.map((pin) => {
          // Calculate approximate position based on coordinate difference
          const latDiff = (pin.latitude - defaultLat) / 0.02; // 0.02 is our bbox range
          const lngDiff = (pin.longitude - defaultLng) / 0.02;
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
                <MapPin className={`w-5 h-5 drop-shadow-lg ${
                  pin.type === 'equipment' ? 'text-blue-600' :
                  pin.type === 'access' ? 'text-green-600' :
                  pin.type === 'parking' ? 'text-purple-600' :
                  pin.type === 'utility' ? 'text-orange-600' :
                  'text-gray-600'
                }`} />
                
                {/* Pin tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  <div className="font-medium">{pin.label}</div>
                  {pin.description && <div className="text-gray-300">{pin.description}</div>}
                  <div className="text-gray-300 font-mono text-xs mt-1">
                    📍 {pin.latitude.toFixed(6)}, {pin.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {(latitude || longitude) && (
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
          <span>Selected location: {(latitude || defaultLat).toFixed(6)}, {(longitude || defaultLng).toFixed(6)}</span>
          <button
            type="button"
            onClick={() => onLocationChange(0, 0)}
            className="text-red-600 hover:text-red-800 text-xs"
          >
            Clear location
          </button>
        </div>
      )}
      
      {/* Pin Management */}
      {onPinsChange && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Map Pins ({mapPins.length})</span>
            <span className="text-xs text-gray-500">Shift+click map to add pin</span>
          </div>
          
          {mapPins.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {mapPins.map((pin) => (
                <div key={pin.id} className="bg-gray-50 px-2 py-2 rounded text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className={`w-3 h-3 ${
                        pin.type === 'equipment' ? 'text-blue-600' :
                        pin.type === 'access' ? 'text-green-600' :
                        pin.type === 'parking' ? 'text-purple-600' :
                        pin.type === 'utility' ? 'text-orange-600' :
                        'text-gray-600'
                      }`} />
                      <span className="font-medium">{pin.label}</span>
                      {pin.description && <span className="text-gray-500">- {pin.description}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removePin(pin.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="mt-1 text-gray-400 font-mono text-xs">
                    📍 {pin.latitude.toFixed(6)}, {pin.longitude.toFixed(6)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Pin Form Modal */}
      {showPinForm && pendingPinLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-80 max-w-sm">
            <h3 className="text-lg font-medium mb-3">Add Map Pin</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
                <input
                  type="text"
                  value={newPin.label}
                  onChange={(e) => setNewPin(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="e.g., Main Entrance, Utility Room"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newPin.type}
                  onChange={(e) => setNewPin(prev => ({ ...prev, type: e.target.value as MapPinType['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="custom">Custom</option>
                  <option value="equipment">Equipment</option>
                  <option value="access">Access Point</option>
                  <option value="parking">Parking</option>
                  <option value="utility">Utility</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newPin.description}
                  onChange={(e) => setNewPin(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional details"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div className="bg-blue-50 p-2 rounded text-xs">
                <span className="text-blue-700 font-medium">📍 Pin Location:</span>
                <div className="font-mono text-blue-800">
                  Lat: {pendingPinLocation.lat.toFixed(6)}<br/>
                  Lng: {pendingPinLocation.lng.toFixed(6)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPinForm(false);
                  setPendingPinLocation(null);
                  setNewPin({ label: '', description: '', type: 'custom' });
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addPin}
                disabled={!newPin.label.trim()}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Pin
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-400">
        Tip: Click map to set main location • Enable Pin Mode then click to add pins • Use "Add Pin Here" for center location
      </div>
    </div>
  );
};
