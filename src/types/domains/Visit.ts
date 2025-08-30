export interface RouteOptimization {
  order: number;
  estimatedTravelTime: number;
  distanceFromPrevious: number;
}

export interface StatusTimeline {
  status: VisitStatus;
  timestamp: string;
  updatedBy: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface VisitTimestamps {
  scheduledStart: string;
  actualStart?: string;
  actualEnd?: string;
  travelStart?: string;
  arrivedAt?: string;
  departedAt?: string;
}

export type VisitStatus = 'scheduled' | 'en-route' | 'arrived' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';

export interface Visit {
  id: string;
  jobId: string;
  technicianId: string;
  propertyId: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  estimatedDuration: number;
  purpose: string;
  routeOptimization: RouteOptimization;
  status: VisitStatus;
  statusTimeline: StatusTimeline[];
  timestamps: VisitTimestamps;
  workPerformed?: string;
  partsUsed?: Array<{
    partId: string;
    quantity: number;
    cost: number;
  }>;
  laborHours?: number;
  photos: string[];
  customerSignature?: string;
  technicianNotes?: string;
  customerFeedback?: {
    rating: number;
    comments: string;
  };
  createdAt: string;
  updatedAt: string;
}