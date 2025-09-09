import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Route, 
  ArrowUp, 
  ArrowDown, 
  Shuffle,
  CheckCircle,
  AlertTriangle,
  User,
  Truck,
  Target
} from 'lucide-react';
import { Visit, DailyRoute, RouteOptimization } from './types';

interface RouteManagementProps {
  visits: Visit[];
  onUpdateVisitOrder?: (visitId: string, newOrder: number) => void;
  onOptimizeRoute?: (technicianId: string, date: string) => Promise<RouteOptimization>;
  onUpdateRoute?: (route: DailyRoute) => void;
}

export const RouteManagement: React.FC<RouteManagementProps> = ({
  visits,
  onUpdateVisitOrder,
  onOptimizeRoute,
  onUpdateRoute
}) => {
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Get unique technicians
  const technicians = Array.from(new Set(visits.map(v => v.technicianId)))
    .map(id => ({
      id,
      name: visits.find(v => v.technicianId === id)?.technician || 'Unknown'
    }));

  // Filter visits for selected technician and date
  const filteredVisits = visits.filter(visit => {
    if (selectedTechnician && visit.technicianId !== selectedTechnician) return false;
    if (selectedDate && visit.scheduledDate !== selectedDate) return false;
    return true;
  });

  // Group visits by technician and date
  const groupedRoutes = filteredVisits.reduce((acc, visit) => {
    const key = `${visit.technicianId}-${visit.scheduledDate}`;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        technicianId: visit.technicianId,
        technicianName: visit.technician,
        date: visit.scheduledDate,
        visits: [],
        status: 'planned' as const,
        totalEstimatedTime: 0,
        totalDistance: 0
      };
    }
    acc[key].visits.push(visit);
    acc[key].totalEstimatedTime += visit.estimatedDuration;
    return acc;
  }, {} as Record<string, DailyRoute>);

  const dailyRoutes = Object.values(groupedRoutes);

  const handleOptimizeRoute = async (route: DailyRoute) => {
    if (!onOptimizeRoute) return;
    
    setIsOptimizing(true);
    try {
      const optimization = await onOptimizeRoute(route.technicianId, route.date);
      
      // Update route with optimization
      if (onUpdateRoute) {
        const updatedRoute: DailyRoute = {
          ...route,
          optimization,
          status: 'modified'
        };
        onUpdateRoute(updatedRoute);
      }
    } catch (error) {
      console.error('Route optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const moveVisit = (route: DailyRoute, visitIndex: number, direction: 'up' | 'down') => {
    const newVisits = [...route.visits];
    const targetIndex = direction === 'up' ? visitIndex - 1 : visitIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newVisits.length) return;
    
    // Swap visits
    [newVisits[visitIndex], newVisits[targetIndex]] = [newVisits[targetIndex], newVisits[visitIndex]];
    
    // Update route orders
    newVisits.forEach((visit, index) => {
      if (visit.route) {
        visit.route.routeOrder = index + 1;
      }
      onUpdateVisitOrder?.(visit.id, index + 1);
    });
    
    const updatedRoute = {
      ...route,
      visits: newVisits,
      status: 'modified' as const
    };
    
    onUpdateRoute?.(updatedRoute);
  };

  const getRouteStatusColor = (status: DailyRoute['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'modified': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVisitStatusIcon = (status: Visit['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <MapPin className="w-4 h-4 text-gray-600" />;
    }
  };

  const calculateRouteMetrics = (route: DailyRoute) => {
    const totalEstimated = route.visits.reduce((sum, visit) => sum + visit.estimatedDuration, 0);
    const totalTravel = route.visits.reduce((sum, visit) => sum + (visit.route?.estimatedTravelTime || 0), 0);
    const totalDistance = route.visits.reduce((sum, visit) => sum + (visit.route?.distanceFromPrevious || 0), 0);
    
    return {
      totalEstimated: Math.round(totalEstimated),
      totalTravel: Math.round(totalTravel),
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalTime: Math.round(totalEstimated + totalTravel)
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Route Management</h3>
          <p className="text-sm text-gray-600">Optimize and manage technician routes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-gray-600" />
          <span className="text-sm text-gray-600">{dailyRoutes.length} routes</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technician
            </label>
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Technicians</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>{tech.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedTechnician('');
                setSelectedDate(new Date().toISOString().split('T')[0]);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Routes */}
      <div className="space-y-6">
        {dailyRoutes.length === 0 ? (
          <div className="text-center py-8">
            <Route className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No routes found</p>
            <p className="text-sm text-gray-400">Select a technician and date to view routes</p>
          </div>
        ) : (
          dailyRoutes.map((route) => {
            const metrics = calculateRouteMetrics(route);
            const sortedVisits = [...route.visits].sort((a, b) => 
              (a.route?.routeOrder || 0) - (b.route?.routeOrder || 0)
            );

            return (
              <div key={route.id} className="border border-gray-200 rounded-lg p-4">
                {/* Route Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{route.technicianName}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(route.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRouteStatusColor(route.status)}`}>
                      {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOptimizeRoute(route)}
                      disabled={isOptimizing}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <Shuffle className="w-4 h-4" />
                      <span>{isOptimizing ? 'Optimizing...' : 'Optimize'}</span>
                    </button>
                  </div>
                </div>

                {/* Route Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{sortedVisits.length}</div>
                    <div className="text-xs text-gray-500">Visits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{metrics.totalTime}m</div>
                    <div className="text-xs text-gray-500">Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{metrics.totalDistance}km</div>
                    <div className="text-xs text-gray-500">Distance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{metrics.totalTravel}m</div>
                    <div className="text-xs text-gray-500">Travel Time</div>
                  </div>
                </div>

                {/* Visit List */}
                <div className="space-y-2">
                  {sortedVisits.map((visit, index) => (
                    <div key={visit.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-xs font-medium text-gray-500">#{visit.route?.routeOrder || index + 1}</span>
                          {getVisitStatusIcon(visit.status)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900">{visit.clientName}</h5>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              visit.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              visit.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              visit.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {visit.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{visit.propertyAddress}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {visit.scheduledTime} ({visit.estimatedDuration}m)
                            </span>
                            {visit.route?.estimatedTravelTime && (
                              <span className="flex items-center">
                                <Navigation className="w-3 h-3 mr-1" />
                                {visit.route.estimatedTravelTime}m travel
                              </span>
                            )}
                            {visit.route?.distanceFromPrevious && (
                              <span className="flex items-center">
                                <Target className="w-3 h-3 mr-1" />
                                {visit.route.distanceFromPrevious.toFixed(1)}km
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => moveVisit(route, index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveVisit(route, index, 'down')}
                          disabled={index === sortedVisits.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Optimization Info */}
                {route.optimization && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Route Optimized</span>
                    </div>
                    <div className="text-xs text-green-700">
                      Optimized at {new Date(route.optimization.optimizedAt).toLocaleTimeString()} • 
                      Total distance: {route.optimization.totalDistance.toFixed(1)}km • 
                      Travel time: {route.optimization.totalTravelTime}m
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
