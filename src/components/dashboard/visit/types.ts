export interface Visit {
  id: string;
  clientId: string;
  clientName: string;
  propertyId: string;
  propertyAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  endTime: string;
  status: 'scheduled' | 'en-route' | 'arrived' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  visitType: 'maintenance' | 'repair' | 'inspection' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  technician: string;
  technicianId: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  notes: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
  progress?: VisitProgress;
  route?: RouteInfo;
  timeline?: StatusTimeline;
  location?: LocationInfo;
}

export type VisitStatus = 'all' | 'scheduled' | 'en-route' | 'arrived' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
export type VisitType = 'all' | 'maintenance' | 'repair' | 'inspection' | 'emergency';

export interface VisitFilters {
  searchTerm: string;
  status: VisitStatus;
  type: VisitType;
  technician?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  visit: Visit;
  color: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  visit?: Visit;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  visits: Visit[];
  timeSlots: TimeSlot[];
}

export interface CalendarView {
  type: 'month' | 'week' | 'day' | 'route';
  currentDate: Date;
}

export interface RouteView {
  technicianId?: string;
  date: Date;
  showOptimization: boolean;
}

export interface VisitProgress {
  id: string;
  visitId: string;
  currentStage: VisitStage;
  stages: VisitStageProgress[];
  checkInTime?: string;
  checkOutTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  progressNotes: ProgressNote[];
  photos: ProgressPhoto[];
  timeTracking: TimeEntry[];
  completionPercentage: number;
  estimatedCompletionTime?: string;
}

export interface VisitStage {
  id: string;
  name: string;
  description: string;
  order: number;
  required: boolean;
  estimatedDuration: number; // in minutes
}

export interface VisitStageProgress {
  stage: VisitStage;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  startTime?: string;
  endTime?: string;
  notes?: string;
  actualDuration?: number;
}

export interface ProgressNote {
  id: string;
  timestamp: string;
  note: string;
  type: 'info' | 'warning' | 'issue' | 'completion';
  technicianId: string;
  technicianName: string;
}

export interface ProgressPhoto {
  id: string;
  timestamp: string;
  url: string;
  caption: string;
  category: 'before' | 'during' | 'after' | 'issue' | 'completion';
  technicianId: string;
}

export interface TimeEntry {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  activity: string;
  description?: string;
}

export interface RouteInfo {
  id: string;
  technicianId: string;
  date: string;
  routeOrder: number;
  totalVisits: number;
  estimatedTravelTime: number; // in minutes
  actualTravelTime?: number; // in minutes
  distanceFromPrevious?: number; // in kilometers
  optimized: boolean;
  routeNotes?: string;
}

export interface StatusTimeline {
  visitId: string;
  events: TimelineEvent[];
  totalDuration?: number;
  statusHistory: StatusChange[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  eventType: 'status_change' | 'location_update' | 'note_added' | 'stage_completed' | 'issue_reported' | 'photo_added';
  description: string;
  details?: any;
  location?: LocationCoordinates;
  technicianId: string;
}

export interface StatusChange {
  id: string;
  fromStatus: Visit['status'] | null;
  toStatus: Visit['status'];
  timestamp: string;
  reason?: string;
  location?: LocationCoordinates;
  technicianId: string;
  automatic: boolean; // true if system-generated, false if manual
}

export interface LocationInfo {
  currentLocation?: LocationCoordinates;
  destinationLocation: LocationCoordinates;
  lastLocationUpdate?: string;
  travelDistance?: number; // in kilometers
  estimatedArrival?: string;
  actualArrival?: string;
  gpsAccuracy?: number; // in meters
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface RouteOptimization {
  technicianId: string;
  date: string;
  visits: Visit[];
  optimizedOrder: string[]; // visit IDs in optimal order
  totalDistance: number;
  totalTravelTime: number;
  startLocation?: LocationCoordinates;
  endLocation?: LocationCoordinates;
  optimizedAt: string;
}

export interface DailyRoute {
  id: string;
  technicianId: string;
  technicianName: string;
  date: string;
  visits: Visit[];
  status: 'planned' | 'in-progress' | 'completed' | 'modified';
  totalEstimatedTime: number;
  totalActualTime?: number;
  totalDistance?: number;
  startTime?: string;
  endTime?: string;
  optimization?: RouteOptimization;
}

export interface VisitFormData {
  clientId: string;
  clientName: string;
  propertyId: string;
  propertyAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  visitType: 'maintenance' | 'repair' | 'inspection' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  technicianId: string;
  technician: string;
  notes: string;
  contactPhone: string;
  contactEmail: string;
  routeOrder?: number;
  estimatedTravelTime?: number;
}

export interface RouteFilters {
  technicianId?: string;
  date?: string;
  status?: DailyRoute['status'];
}

export interface TimelineFilters {
  eventType?: TimelineEvent['eventType'];
  dateRange?: {
    start: Date;
    end: Date;
  };
  technicianId?: string;
}
