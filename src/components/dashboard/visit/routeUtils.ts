import { Visit, DailyRoute, RouteOptimization, LocationCoordinates } from './types';

// Route optimization utilities
export const optimizeRoute = async (visits: Visit[], startLocation?: LocationCoordinates): Promise<RouteOptimization> => {
  // Simple greedy nearest neighbor algorithm for demo
  // In production, this would use a proper routing service like Google Maps API
  
  const unvisited = [...visits];
  const optimizedOrder: string[] = [];
  let currentLocation = startLocation;
  let totalDistance = 0;
  let totalTravelTime = 0;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    // Find nearest unvisited location
    unvisited.forEach((visit, index) => {
      const distance = currentLocation 
        ? calculateDistance(currentLocation, getVisitLocation(visit))
        : 0;
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    const nearestVisit = unvisited[nearestIndex];
    optimizedOrder.push(nearestVisit.id);
    
    totalDistance += nearestDistance;
    totalTravelTime += Math.round(nearestDistance * 1.5); // Rough estimate: 1.5 min per km
    
    currentLocation = getVisitLocation(nearestVisit);
    unvisited.splice(nearestIndex, 1);
  }

  return {
    technicianId: visits[0]?.technicianId || '',
    date: visits[0]?.scheduledDate || '',
    visits,
    optimizedOrder,
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalTravelTime,
    startLocation,
    optimizedAt: new Date().toISOString()
  };
};

export const calculateDistance = (loc1: LocationCoordinates, loc2: LocationCoordinates): number => {
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

export const getVisitLocation = (visit: Visit): LocationCoordinates => {
  // In a real app, this would geocode the address or use stored coordinates
  // For demo, we'll generate mock coordinates based on address hash
  const hash = hashString(visit.propertyAddress);
  
  return {
    latitude: 40.7128 + (hash % 1000) / 10000, // NYC area with variation
    longitude: -74.0060 + (hash % 1000) / 10000,
    timestamp: new Date().toISOString()
  };
};

export const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

export const calculateRouteEfficiency = (route: DailyRoute): number => {
  if (route.visits.length <= 1) return 100;
  
  // Calculate efficiency based on distance vs optimal
  const totalDistance = route.visits.reduce((sum, visit) => 
    sum + (visit.route?.distanceFromPrevious || 0), 0
  );
  
  // Estimate optimal distance (rough approximation)
  const optimalDistance = Math.sqrt(route.visits.length) * 5; // 5km per visit area
  
  return Math.min(100, Math.round((optimalDistance / Math.max(totalDistance, 1)) * 100));
};

export const estimateTravelTime = (distance: number, trafficFactor: number = 1.2): number => {
  // Base speed: 40 km/h in city, adjusted for traffic
  const baseSpeed = 40;
  const adjustedSpeed = baseSpeed / trafficFactor;
  return Math.round((distance / adjustedSpeed) * 60); // Convert to minutes
};

export const generateRouteColors = (routeCount: number): string[] => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];
  
  return Array.from({ length: routeCount }, (_, i) => colors[i % colors.length]);
};

export const getRouteStatusColor = (status: DailyRoute['status']): string => {
  switch (status) {
    case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed': return 'bg-green-100 text-green-800 border-green-200';
    case 'modified': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
};

export const formatDistance = (kilometers: number): string => {
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m`;
  } else {
    return `${kilometers.toFixed(1)}km`;
  }
};

export const isWithinWorkingHours = (time: string): boolean => {
  const hour = parseInt(time.split(':')[0]);
  return hour >= 8 && hour <= 18; // 8 AM to 6 PM
};

export const suggestOptimalStartTime = (visits: Visit[]): string => {
  if (visits.length === 0) return '08:00';
  
  const totalDuration = visits.reduce((sum, visit) => sum + visit.estimatedDuration, 0);
  const totalTravel = visits.reduce((sum, visit) => sum + (visit.route?.estimatedTravelTime || 15), 0);
  const totalTime = totalDuration + totalTravel;
  
  // Work backwards from 6 PM
  const endTime = 18 * 60; // 6 PM in minutes
  const startTime = endTime - totalTime;
  
  const startHour = Math.max(8, Math.floor(startTime / 60));
  const startMinute = startTime % 60;
  
  return `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
};

export const detectRouteConflicts = (routes: DailyRoute[]): Array<{
  type: 'overlap' | 'overload' | 'distance';
  message: string;
  routeIds: string[];
}> => {
  const conflicts: Array<{
    type: 'overlap' | 'overload' | 'distance';
    message: string;
    routeIds: string[];
  }> = [];

  routes.forEach(route => {
    // Check for overloaded routes (>8 hours)
    if (route.totalEstimatedTime > 480) {
      conflicts.push({
        type: 'overload',
        message: `Route exceeds 8 hours (${formatDuration(route.totalEstimatedTime)})`,
        routeIds: [route.id]
      });
    }

    // Check for excessive travel distance
    if ((route.totalDistance || 0) > 200) {
      conflicts.push({
        type: 'distance',
        message: `Route exceeds 200km (${formatDistance(route.totalDistance || 0)})`,
        routeIds: [route.id]
      });
    }
  });

  return conflicts;
};
