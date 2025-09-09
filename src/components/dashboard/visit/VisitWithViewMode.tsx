import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter
} from 'lucide-react';
import { 
  Visit as VisitType, 
  CalendarView, 
  VisitStatus, 
  VisitType as VisitTypeEnum, 
  VisitFormData, 
  VisitProgress as VisitProgressType,
  RouteOptimization, 
  DailyRoute, 
  TimelineEvent, 
  LocationCoordinates 
} from './types';
import { mockVisits, getStatusColor, getTypeColor, getPriorityColor, filterVisits } from './visitUtils';
import { addMinutesToTime, formatTime } from './calendarUtils';
import { VisitForm } from './VisitForm';
import { CalendarView as CalendarViewComponent } from './CalendarView';
import { VisitProgressModal } from './VisitProgressModal';
import { RouteManagement } from './RouteManagement';
import { GPSTracking } from './GPSTracking';
import { optimizeRoute } from './routeUtils';

interface VisitWithViewModeProps {
  activeSection: string;
}

export const VisitWithViewMode: React.FC<VisitWithViewModeProps> = ({ activeSection }) => {
  const [visits, setVisits] = useState<VisitType[]>(mockVisits);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<VisitStatus>('all');
  const [filterType, setFilterType] = useState<VisitTypeEnum>('all');
  
  // Determine view mode based on activeSection
  const getViewMode = (section: string): 'calendar' | 'list' | 'routes' | 'timeline' | 'gps' => {
    switch (section) {
      case 'visits-calendar':
        return 'calendar';
      case 'visits-list':
        return 'list';
      case 'visits-routes':
        return 'routes';
      case 'visits-gps':
        return 'gps';
      default:
        return 'calendar'; // Default fallback
    }
  };

  const viewMode = getViewMode(activeSection);
  
  const [calendarView, setCalendarView] = useState<CalendarView>({
    type: 'month',
    currentDate: new Date()
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<VisitType | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Route management handlers
  const handleOptimizeRoute = async (technicianId: string, date: string): Promise<RouteOptimization> => {
    const technicianVisits = visits.filter(v => v.technicianId === technicianId && v.scheduledDate === date);
    return await optimizeRoute(technicianVisits);
  };

  const handleUpdateVisitOrder = (visitId: string, newOrder: number) => {
    setVisits(prev => prev.map(visit => 
      visit.id === visitId 
        ? { ...visit, route: { ...visit.route!, routeOrder: newOrder } }
        : visit
    ));
  };

  const handleUpdateRoute = (route: DailyRoute) => {
    setVisits(prev => prev.map(visit => {
      const routeVisit = route.visits.find(rv => rv.id === visit.id);
      return routeVisit ? { ...visit, route: routeVisit.route } : visit;
    }));
  };

  // Timeline handlers
  const handleAddTimelineEvent = (visitId: string, event: Omit<TimelineEvent, 'id'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    setVisits(prev => prev.map(visit => 
      visit.id === visitId 
        ? {
            ...visit,
            timeline: {
              ...visit.timeline!,
              events: [...(visit.timeline?.events || []), newEvent]
            }
          }
        : visit
    ));
  };

  // GPS tracking handlers
  const handleLocationUpdate = (visitId: string, location: LocationCoordinates) => {
    setVisits(prev => prev.map(visit => 
      visit.id === visitId 
        ? {
            ...visit,
            location: {
              ...visit.location!,
              currentLocation: location,
              lastLocationUpdate: location.timestamp
            }
          }
        : visit
    ));

    // Add timeline event for location update
    handleAddTimelineEvent(visitId, {
      timestamp: location.timestamp,
      eventType: 'location_update',
      description: 'Location updated',
      location,
      technicianId: visits.find(v => v.id === visitId)?.technicianId || '',
      details: { accuracy: location.accuracy }
    });
  };

  const filteredVisits = filterVisits(visits, {
    searchTerm,
    status: filterStatus,
    type: filterType
  });

  const handleCreateVisit = (visitData: VisitFormData) => {
    const newVisit: VisitType = {
      id: Date.now().toString(),
      ...visitData,
      endTime: addMinutesToTime(visitData.scheduledTime, visitData.estimatedDuration),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setVisits(prev => [...prev, newVisit]);
  };

  const handleUpdateVisit = (visitData: VisitFormData) => {
    if (!selectedVisit) return;
    
    const updatedVisit: VisitType = {
      ...selectedVisit,
      ...visitData,
      endTime: addMinutesToTime(visitData.scheduledTime, visitData.estimatedDuration),
      updatedAt: new Date().toISOString()
    };
    
    setVisits(prev => prev.map(visit => 
      visit.id === selectedVisit.id ? updatedVisit : visit
    ));
  };

  const handleDeleteVisit = (visitId: string) => {
    if (confirm('Are you sure you want to delete this visit?')) {
      setVisits(prev => prev.filter(visit => visit.id !== visitId));
    }
  };

  const handleDateSelect = (date: Date, time?: string) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setSelectedTime(time || '09:00');
    setSelectedVisit(undefined);
    setIsFormOpen(true);
  };

  const handleVisitClick = (visit: VisitType) => {
    setSelectedVisit(visit);
    setSelectedDate('');
    setSelectedTime('');
    setIsFormOpen(true);
  };

  const handleProgressClick = (visit: VisitType) => {
    setSelectedVisit(visit);
    setIsProgressOpen(true);
  };

  const handleUpdateProgress = (visitId: string, progress: Partial<VisitProgressType>) => {
    setVisits(prev => prev.map(visit => 
      visit.id === visitId 
        ? { ...visit, progress: { ...visit.progress, ...progress } as VisitProgressType }
        : visit
    ));
  };

  const handleUpdateVisitStatus = (visitId: string, status: VisitType['status']) => {
    setVisits(prev => prev.map(visit => 
      visit.id === visitId ? { ...visit, status } : visit
    ));
  };

  const handleFormSubmit = (visitData: VisitFormData) => {
    if (selectedVisit) {
      handleUpdateVisit(visitData);
    } else {
      handleCreateVisit(visitData);
    }
    setIsFormOpen(false);
    setSelectedVisit(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Visits</h2>
          <p className="text-gray-600">Schedule and manage your service visits</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => {
              setSelectedVisit(undefined);
              setSelectedDate('');
              setSelectedTime('');
              setIsFormOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Visit</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {viewMode === 'list' && (
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search visits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as VisitStatus)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="en-route">En Route</option>
              <option value="arrived">Arrived</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as VisitTypeEnum)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {viewMode === 'calendar' && (
        <CalendarViewComponent
          visits={filteredVisits}
          view={calendarView}
          onViewChange={setCalendarView}
          onDateSelect={handleDateSelect}
          onVisitClick={handleVisitClick}
        />
      )}

      {viewMode === 'list' && (
        <VisitListView 
          visits={filteredVisits}
          onVisitClick={handleVisitClick}
          onProgressClick={handleProgressClick}
          onDeleteVisit={handleDeleteVisit}
        />
      )}

      {viewMode === 'routes' && (
        <RouteManagement
          visits={filteredVisits}
          onUpdateVisitOrder={handleUpdateVisitOrder}
          onOptimizeRoute={handleOptimizeRoute}
          onUpdateRoute={handleUpdateRoute}
        />
      )}

      {viewMode === 'gps' && selectedVisit && (
        <GPSTracking
          visit={selectedVisit}
          onLocationUpdate={handleLocationUpdate}
          onAddTimelineEvent={handleAddTimelineEvent}
          realTimeTracking={true}
        />
      )}

      {viewMode === 'gps' && !selectedVisit && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Visit</h3>
          <p className="text-gray-600 mb-4">Choose an active visit to track its GPS location and route progress</p>
          <p className="text-sm text-gray-500">You can select a visit from other views or create a new one</p>
        </div>
      )}

      {/* Visit Form Modal */}
      <VisitForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedVisit(undefined);
        }}
        onSubmit={handleFormSubmit}
        visit={selectedVisit}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        visits={visits}
      />

      {/* Visit Progress Modal */}
      {selectedVisit && (
        <VisitProgressModal
          isOpen={isProgressOpen}
          onClose={() => {
            setIsProgressOpen(false);
            setSelectedVisit(undefined);
          }}
          visit={selectedVisit}
          onUpdateProgress={handleUpdateProgress}
          onUpdateVisitStatus={handleUpdateVisitStatus}
        />
      )}
    </div>
  );
};

// List View Component
interface VisitListViewProps {
  visits: VisitType[];
  onVisitClick: (visit: VisitType) => void;
  onProgressClick: (visit: VisitType) => void;
  onDeleteVisit: (visitId: string) => void;
}

const VisitListView: React.FC<VisitListViewProps> = ({ visits, onVisitClick, onProgressClick, onDeleteVisit }) => {
  
  return (
    <div className="space-y-4">
      {visits.map((visit) => (
        <div key={visit.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(visit.status)}`}>
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{visit.clientName}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(visit.visitType)}`}>
                    {visit.visitType}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(visit.priority)}`}>
                    {visit.priority}
                  </span>
                  <span>{visit.scheduledDate}</span>
                  <span>{formatTime(visit.scheduledTime)} - {formatTime(visit.endTime)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {(visit.status === 'scheduled' || visit.status === 'en-route' || visit.status === 'arrived' || visit.status === 'in-progress') && (
                <button 
                  onClick={() => onProgressClick(visit)}
                  className="bg-blue-600 text-white px-3 py-1 text-sm font-medium rounded hover:bg-blue-700"
                >
                  Progress
                </button>
              )}
              <button 
                onClick={() => onVisitClick(visit)}
                className="text-blue-600 hover:text-blue-900 px-3 py-1 text-sm font-medium"
              >
                Edit
              </button>
              <button 
                onClick={() => onDeleteVisit(visit.id)}
                className="text-red-600 hover:text-red-900 px-3 py-1 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Property:</span> {visit.propertyAddress}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Technician:</span> {visit.technician}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Duration:</span> {visit.estimatedDuration} minutes
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Phone:</span> {visit.contactPhone}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {visit.contactEmail}
              </div>
            </div>
          </div>

          {visit.notes && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">{visit.notes}</p>
            </div>
          )}
        </div>
      ))}
      
      {visits.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No visits found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};
