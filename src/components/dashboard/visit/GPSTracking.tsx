import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Crosshair, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Satellite,
  Target
} from 'lucide-react';
import { Visit, LocationCoordinates, TimelineEvent } from './types';

interface GPSTrackingProps {
  visit: Visit;
  onLocationUpdate?: (visitId: string, location: LocationCoordinates) => void;
  onAddTimelineEvent?: (visitId: string, event: Omit<TimelineEvent, 'id'>) => void;
  realTimeTracking?: boolean;
}

export const GPSTracking: React.FC<GPSTrackingProps> = ({
  visit,
  onLocationUpdate,
  onAddTimelineEvent,
  realTimeTracking = false
}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationCoordinates[]>([]);

  const locationInfo = visit.location;

  useEffect(() => {
    if (realTimeTracking && isTracking) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [realTimeTracking, isTracking]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setTrackingError('Geolocation is not supported by this browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    };

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        setCurrentLocation(newLocation);
        setLocationHistory(prev => [...prev.slice(-49), newLocation]); // Keep last 50 locations
        setTrackingError(null);

        // Update visit location
        onLocationUpdate?.(visit.id, newLocation);

        // Add timeline event for significant location changes
        if (locationHistory.length > 0) {
          const lastLocation = locationHistory[locationHistory.length - 1];
          const distance = calculateDistance(lastLocation, newLocation);
          
          if (distance > 0.1) { // 100 meters threshold
            onAddTimelineEvent?.(visit.id, {
              timestamp: newLocation.timestamp,
              eventType: 'location_update',
              description: `Location updated - moved ${distance.toFixed(1)}km`,
              location: newLocation,
              technicianId: visit.technicianId,
              details: {
                accuracy: newLocation.accuracy,
                distance: distance
              }
            });
          }
        }
      },
      (error) => {
        setTrackingError(getGeolocationError(error));
        setIsTracking(false);
      },
      options
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setTrackingError('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        setCurrentLocation(newLocation);
        setTrackingError(null);

        onLocationUpdate?.(visit.id, newLocation);

        onAddTimelineEvent?.(visit.id, {
          timestamp: newLocation.timestamp,
          eventType: 'location_update',
          description: 'Manual location check',
          location: newLocation,
          technicianId: visit.technicianId,
          details: {
            accuracy: newLocation.accuracy,
            manual: true
          }
        });
      },
      (error) => {
        setTrackingError(getGeolocationError(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const getGeolocationError = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied by user';
      case error.POSITION_UNAVAILABLE:
        return 'Location information unavailable';
      case error.TIMEOUT:
        return 'Location request timed out';
      default:
        return 'An unknown error occurred while retrieving location';
    }
  };

  const calculateDistance = (loc1: LocationCoordinates, loc2: LocationCoordinates): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
    const dLon = (loc2.longitude - loc1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.latitude * Math.PI / 180) * Math.cos(loc2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateETA = (): string | null => {
    if (!currentLocation || !locationInfo?.destinationLocation) return null;
    
    const distance = calculateDistance(currentLocation, locationInfo.destinationLocation);
    const averageSpeed = 40; // km/h average speed in city
    const etaMinutes = Math.round((distance / averageSpeed) * 60);
    
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + etaMinutes);
    
    return eta.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getAccuracyColor = (accuracy?: number): string => {
    if (!accuracy) return 'text-gray-500';
    if (accuracy <= 10) return 'text-green-600';
    if (accuracy <= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyText = (accuracy?: number): string => {
    if (!accuracy) return 'Unknown';
    if (accuracy <= 10) return 'High';
    if (accuracy <= 50) return 'Medium';
    return 'Low';
  };

  const formatCoordinates = (location: LocationCoordinates): string => {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const openInMaps = (location: LocationCoordinates) => {
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">GPS Tracking</h3>
          <p className="text-sm text-gray-600">{visit.clientName} - {visit.propertyAddress}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Satellite className="w-5 h-5 text-gray-600" />
          <span className={`text-sm ${isTracking ? 'text-green-600' : 'text-gray-600'}`}>
            {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
          </span>
        </div>
      </div>

      {/* Tracking Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                isTracking 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isTracking ? <RefreshCw className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
              <span>{isTracking ? 'Stop Tracking' : 'Start Tracking'}</span>
            </button>
            
            <button
              onClick={getCurrentLocation}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Crosshair className="w-4 h-4" />
              <span>Get Location</span>
            </button>
          </div>
          
          {currentLocation && (
            <button
              onClick={() => openInMaps(currentLocation)}
              className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800"
            >
              <MapPin className="w-4 h-4" />
              <span>Open in Maps</span>
            </button>
          )}
        </div>

        {trackingError && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-800">{trackingError}</span>
          </div>
        )}
      </div>

      {/* Location Information */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Current Location */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Current Location</h4>
          
          {currentLocation ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Location Available</span>
                </div>
                <div className="text-xs text-green-700 space-y-1">
                  <div>Coordinates: {formatCoordinates(currentLocation)}</div>
                  <div>Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}</div>
                  <div className={`flex items-center space-x-1 ${getAccuracyColor(currentLocation.accuracy)}`}>
                    <Target className="w-3 h-3" />
                    <span>Accuracy: {getAccuracyText(currentLocation.accuracy)} ({currentLocation.accuracy?.toFixed(0)}m)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">No Location Data</span>
              </div>
              <div className="text-xs text-gray-600">
                Click "Get Location" or "Start Tracking" to obtain current position
              </div>
            </div>
          )}
        </div>

        {/* Destination */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Destination</h4>
          
          {locationInfo?.destinationLocation ? (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Property Location</span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>Coordinates: {formatCoordinates(locationInfo.destinationLocation)}</div>
                  <div>Address: {visit.propertyAddress}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-600">
                No destination coordinates available
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Travel Information */}
      {currentLocation && locationInfo?.destinationLocation && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Travel Information</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {calculateDistance(currentLocation, locationInfo.destinationLocation).toFixed(1)}km
              </div>
              <div className="text-xs text-gray-500">Distance</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {calculateETA() || '--'}
              </div>
              <div className="text-xs text-gray-500">ETA</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {locationInfo.estimatedArrival ? 
                  new Date(locationInfo.estimatedArrival).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  }) : '--'
                }
              </div>
              <div className="text-xs text-gray-500">Scheduled</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">
                {locationHistory.length}
              </div>
              <div className="text-xs text-gray-500">Updates</div>
            </div>
          </div>
        </div>
      )}

      {/* Location History */}
      {locationHistory.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Recent Location Updates</h4>
          
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {locationHistory.slice(-5).reverse().map((location, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3 text-gray-600" />
                  <span className="text-gray-900">{formatCoordinates(location)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(location.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
