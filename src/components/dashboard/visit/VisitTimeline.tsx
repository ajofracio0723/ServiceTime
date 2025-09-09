import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Camera, 
  MessageSquare,
  Filter
} from 'lucide-react';
import { Visit, TimelineEvent, StatusChange, TimelineFilters } from './types';

interface VisitTimelineProps {
  visit: Visit;
  onAddTimelineEvent?: (visitId: string, event: Omit<TimelineEvent, 'id'>) => void;
}

export const VisitTimeline: React.FC<VisitTimelineProps> = ({
  visit,
  onAddTimelineEvent
}) => {
  const [filters, setFilters] = useState<TimelineFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const addManualNote = () => {
    const note = prompt('Add a timeline note:');
    if (note && onAddTimelineEvent) {
      onAddTimelineEvent(visit.id, {
        timestamp: new Date().toISOString(),
        eventType: 'note_added',
        description: note,
        technicianId: visit.technicianId,
        details: { manual: true }
      });
    }
  };

  const timeline = visit.timeline || {
    visitId: visit.id,
    events: [],
    statusHistory: []
  };

  const getEventIcon = (eventType: TimelineEvent['eventType']) => {
    switch (eventType) {
      case 'status_change': return <CheckCircle className="w-4 h-4" />;
      case 'location_update': return <MapPin className="w-4 h-4" />;
      case 'note_added': return <MessageSquare className="w-4 h-4" />;
      case 'stage_completed': return <CheckCircle className="w-4 h-4" />;
      case 'issue_reported': return <AlertTriangle className="w-4 h-4" />;
      case 'photo_added': return <Camera className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getEventColor = (eventType: TimelineEvent['eventType']) => {
    switch (eventType) {
      case 'status_change': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'location_update': return 'bg-green-100 text-green-800 border-green-200';
      case 'note_added': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'stage_completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'issue_reported': return 'bg-red-100 text-red-800 border-red-200';
      case 'photo_added': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    };
  };

  const calculateDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const filteredEvents = timeline.events.filter(event => {
    if (filters.eventType && event.eventType !== filters.eventType) return false;
    if (filters.technicianId && event.technicianId !== filters.technicianId) return false;
    if (filters.dateRange) {
      const eventDate = new Date(event.timestamp);
      if (eventDate < filters.dateRange.start || eventDate > filters.dateRange.end) return false;
    }
    return true;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getStatusDuration = (statusChange: StatusChange, nextChange?: StatusChange) => {
    const endTime = nextChange?.timestamp || new Date().toISOString();
    return calculateDuration(statusChange.timestamp, endTime);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Visit Timeline</h3>
          <p className="text-sm text-gray-600">
            {visit.clientName} - {formatTimestamp(visit.createdAt).date}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onAddTimelineEvent && (
            <button
              onClick={addManualNote}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Add Note
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border ${showFilters ? 'bg-blue-50 border-blue-200' : 'border-gray-300'}`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <div className="text-sm text-gray-500">
            {sortedEvents.length} events
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={filters.eventType || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  eventType: e.target.value as TimelineEvent['eventType'] || undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="status_change">Status Changes</option>
                <option value="location_update">Location Updates</option>
                <option value="note_added">Notes</option>
                <option value="stage_completed">Stage Completed</option>
                <option value="issue_reported">Issues</option>
                <option value="photo_added">Photos</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technician
              </label>
              <select
                value={filters.technicianId || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  technicianId: e.target.value || undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Technicians</option>
                <option value={visit.technicianId}>{visit.technician}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status History Summary */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Status History</h4>
        <div className="space-y-2">
          {timeline.statusHistory.map((statusChange, index) => {
            const nextChange = timeline.statusHistory[index + 1];
            const duration = getStatusDuration(statusChange, nextChange);
            const { time, date } = formatTimestamp(statusChange.timestamp);
            
            return (
              <div key={statusChange.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    statusChange.toStatus === 'completed' ? 'bg-green-500' :
                    statusChange.toStatus === 'in-progress' ? 'bg-blue-500' :
                    statusChange.toStatus === 'cancelled' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                  <div>
                    <span className="font-medium text-gray-900 capitalize">
                      {statusChange.toStatus.replace('-', ' ')}
                    </span>
                    {statusChange.fromStatus && (
                      <span className="text-sm text-gray-500 ml-2">
                        (from {statusChange.fromStatus.replace('-', ' ')})
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{time}</div>
                  <div className="text-xs text-gray-500">{date} • {duration}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Events */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Detailed Timeline</h4>
        <div className="space-y-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No timeline events found</p>
              <p className="text-sm text-gray-400">Events will appear here as the visit progresses</p>
            </div>
          ) : (
            sortedEvents.map((event, index) => {
              const { time, date } = formatTimestamp(event.timestamp);
              const isFirst = index === 0;
              const isLast = index === sortedEvents.length - 1;
              
              return (
                <div key={event.id} className="relative">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
                  )}
                  
                  <div className="flex items-start space-x-4">
                    {/* Event icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getEventColor(event.eventType)}`}>
                      {getEventIcon(event.eventType)}
                    </div>
                    
                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-medium text-gray-900">
                          {event.description}
                        </h5>
                        <div className="text-xs text-gray-500">
                          {time} • {date}
                        </div>
                      </div>
                      
                      {/* Event details */}
                      {event.details && (
                        <div className="text-sm text-gray-600 mb-2">
                          {typeof event.details === 'string' ? event.details : JSON.stringify(event.details)}
                        </div>
                      )}
                      
                      {/* Location info */}
                      {event.location && (
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>
                            {event.location.latitude.toFixed(6)}, {event.location.longitude.toFixed(6)}
                          </span>
                          {event.location.accuracy && (
                            <span className="ml-2">±{event.location.accuracy}m</span>
                          )}
                        </div>
                      )}
                      
                      {/* Technician info */}
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="w-3 h-3 mr-1" />
                        <span>by {visit.technician}</span>
                        {isFirst && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                            Latest
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {timeline.events.length}
            </div>
            <div className="text-sm text-gray-500">Total Events</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {timeline.statusHistory.length}
            </div>
            <div className="text-sm text-gray-500">Status Changes</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {timeline.totalDuration ? calculateDuration(visit.createdAt, new Date().toISOString()) : '-'}
            </div>
            <div className="text-sm text-gray-500">Total Duration</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {visit.actualDuration ? `${visit.actualDuration}m` : '-'}
            </div>
            <div className="text-sm text-gray-500">Work Duration</div>
          </div>
        </div>
      </div>
    </div>
  );
};
