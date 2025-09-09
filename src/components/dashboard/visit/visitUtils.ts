import { Visit, VisitFilters } from './types';

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'en-route': return 'bg-purple-100 text-purple-800';
    case 'arrived': return 'bg-orange-100 text-orange-800';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'no-show': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getTypeColor = (type: string): string => {
  switch (type) {
    case 'maintenance': return 'bg-blue-100 text-blue-800';
    case 'repair': return 'bg-orange-100 text-orange-800';
    case 'inspection': return 'bg-green-100 text-green-800';
    case 'emergency': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const filterVisits = (visits: Visit[], filters: VisitFilters): Visit[] => {
  return visits.filter(visit => {
    const matchesSearch = visit.clientName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         visit.propertyAddress.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         visit.technician.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || visit.status === filters.status;
    const matchesType = filters.type === 'all' || visit.visitType === filters.type;
    return matchesSearch && matchesStatus && matchesType;
  });
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const mockVisits: Visit[] = [
  {
    id: '1',
    clientId: 'client-1',
    clientName: 'John Smith',
    propertyId: 'prop-1',
    propertyAddress: '123 Main St, Anytown, ST 12345',
    scheduledDate: '2024-01-15',
    scheduledTime: '09:00',
    endTime: '10:30',
    status: 'scheduled',
    visitType: 'maintenance',
    priority: 'medium',
    technician: 'Mike Johnson',
    technicianId: 'tech-1',
    estimatedDuration: 90,
    notes: 'Annual HVAC maintenance check',
    contactPhone: '(555) 123-4567',
    contactEmail: 'john@email.com',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
    route: {
      id: 'route-1-1',
      technicianId: 'tech-1',
      date: '2024-01-15',
      routeOrder: 1,
      totalVisits: 3,
      estimatedTravelTime: 0,
      optimized: true,
      routeNotes: 'First stop of the day'
    },
    timeline: {
      visitId: '1',
      events: [
        {
          id: 'event-1-1',
          timestamp: '2024-01-10T08:00:00Z',
          eventType: 'status_change',
          description: 'Visit scheduled',
          technicianId: 'tech-1',
          details: { fromStatus: null, toStatus: 'scheduled' }
        }
      ],
      statusHistory: [
        {
          id: 'status-1-1',
          fromStatus: null,
          toStatus: 'scheduled',
          timestamp: '2024-01-10T08:00:00Z',
          technicianId: 'tech-1',
          automatic: false
        }
      ]
    },
    location: {
      destinationLocation: {
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: '2024-01-10T08:00:00Z'
      }
    }
  },
  {
    id: '2',
    clientId: 'client-2',
    clientName: 'Sarah Davis',
    propertyId: 'prop-2',
    propertyAddress: '456 Oak Ave, Somewhere, ST 67890',
    scheduledDate: '2024-01-15',
    scheduledTime: '14:00',
    endTime: '15:00',
    status: 'in-progress',
    visitType: 'repair',
    priority: 'high',
    technician: 'Mike Johnson',
    technicianId: 'tech-1',
    estimatedDuration: 60,
    actualDuration: 45,
    notes: 'Repair leaking faucet in kitchen',
    contactPhone: '(555) 987-6543',
    contactEmail: 'sarah@email.com',
    createdAt: '2024-01-12T10:30:00Z',
    updatedAt: '2024-01-15T14:15:00Z',
    route: {
      id: 'route-1-2',
      technicianId: 'tech-1',
      date: '2024-01-15',
      routeOrder: 2,
      totalVisits: 3,
      estimatedTravelTime: 25,
      actualTravelTime: 30,
      distanceFromPrevious: 12.5,
      optimized: true,
      routeNotes: 'Second stop - high priority repair'
    },
    timeline: {
      visitId: '2',
      events: [
        {
          id: 'event-2-1',
          timestamp: '2024-01-12T10:30:00Z',
          eventType: 'status_change',
          description: 'Visit scheduled',
          technicianId: 'tech-1',
          details: { fromStatus: null, toStatus: 'scheduled' }
        },
        {
          id: 'event-2-2',
          timestamp: '2024-01-15T13:45:00Z',
          eventType: 'status_change',
          description: 'Technician en route',
          technicianId: 'tech-1',
          details: { fromStatus: 'scheduled', toStatus: 'en-route' }
        },
        {
          id: 'event-2-3',
          timestamp: '2024-01-15T14:10:00Z',
          eventType: 'status_change',
          description: 'Arrived at property',
          technicianId: 'tech-1',
          details: { fromStatus: 'en-route', toStatus: 'arrived' }
        },
        {
          id: 'event-2-4',
          timestamp: '2024-01-15T14:15:00Z',
          eventType: 'status_change',
          description: 'Work started',
          technicianId: 'tech-1',
          details: { fromStatus: 'arrived', toStatus: 'in-progress' }
        }
      ],
      statusHistory: [
        {
          id: 'status-2-1',
          fromStatus: null,
          toStatus: 'scheduled',
          timestamp: '2024-01-12T10:30:00Z',
          technicianId: 'tech-1',
          automatic: false
        },
        {
          id: 'status-2-2',
          fromStatus: 'scheduled',
          toStatus: 'en-route',
          timestamp: '2024-01-15T13:45:00Z',
          technicianId: 'tech-1',
          automatic: true
        },
        {
          id: 'status-2-3',
          fromStatus: 'en-route',
          toStatus: 'arrived',
          timestamp: '2024-01-15T14:10:00Z',
          technicianId: 'tech-1',
          automatic: true
        },
        {
          id: 'status-2-4',
          fromStatus: 'arrived',
          toStatus: 'in-progress',
          timestamp: '2024-01-15T14:15:00Z',
          technicianId: 'tech-1',
          automatic: false
        }
      ],
      totalDuration: 30
    },
    location: {
      destinationLocation: {
        latitude: 40.7589,
        longitude: -73.9851,
        timestamp: '2024-01-12T10:30:00Z'
      },
      currentLocation: {
        latitude: 40.7580,
        longitude: -73.9855,
        accuracy: 15,
        timestamp: '2024-01-15T14:15:00Z'
      },
      lastLocationUpdate: '2024-01-15T14:15:00Z',
      travelDistance: 12.5,
      actualArrival: '2024-01-15T14:10:00Z'
    }
  },
  {
    id: '3',
    clientId: 'client-3',
    clientName: 'Robert Wilson',
    propertyId: 'prop-3',
    propertyAddress: '789 Pine St, Elsewhere, ST 54321',
    scheduledDate: '2024-01-15',
    scheduledTime: '16:30',
    endTime: '17:30',
    status: 'scheduled',
    visitType: 'inspection',
    priority: 'low',
    technician: 'Mike Johnson',
    technicianId: 'tech-1',
    estimatedDuration: 60,
    notes: 'Quarterly safety inspection',
    contactPhone: '(555) 456-7890',
    contactEmail: 'robert@email.com',
    createdAt: '2024-01-13T15:20:00Z',
    updatedAt: '2024-01-13T15:20:00Z',
    route: {
      id: 'route-1-3',
      technicianId: 'tech-1',
      date: '2024-01-15',
      routeOrder: 3,
      totalVisits: 3,
      estimatedTravelTime: 20,
      distanceFromPrevious: 8.2,
      optimized: true,
      routeNotes: 'Final stop of the day'
    },
    timeline: {
      visitId: '3',
      events: [
        {
          id: 'event-3-1',
          timestamp: '2024-01-13T15:20:00Z',
          eventType: 'status_change',
          description: 'Visit scheduled',
          technicianId: 'tech-1',
          details: { fromStatus: null, toStatus: 'scheduled' }
        }
      ],
      statusHistory: [
        {
          id: 'status-3-1',
          fromStatus: null,
          toStatus: 'scheduled',
          timestamp: '2024-01-13T15:20:00Z',
          technicianId: 'tech-1',
          automatic: false
        }
      ]
    },
    location: {
      destinationLocation: {
        latitude: 40.7505,
        longitude: -73.9934,
        timestamp: '2024-01-13T15:20:00Z'
      }
    }
  },
  {
    id: '4',
    clientId: 'client-4',
    clientName: 'Emily Brown',
    propertyId: 'prop-4',
    propertyAddress: '321 Elm Dr, Newtown, ST 98765',
    scheduledDate: '2024-01-16',
    scheduledTime: '10:00',
    endTime: '12:00',
    status: 'completed',
    visitType: 'emergency',
    priority: 'urgent',
    technician: 'Sarah Connor',
    technicianId: 'tech-2',
    estimatedDuration: 120,
    actualDuration: 135,
    notes: 'Emergency heating system repair - completed successfully',
    contactPhone: '(555) 234-5678',
    contactEmail: 'emily@email.com',
    createdAt: '2024-01-15T22:30:00Z',
    updatedAt: '2024-01-16T12:15:00Z',
    route: {
      id: 'route-2-1',
      technicianId: 'tech-2',
      date: '2024-01-16',
      routeOrder: 1,
      totalVisits: 1,
      estimatedTravelTime: 35,
      actualTravelTime: 40,
      distanceFromPrevious: 18.7,
      optimized: false,
      routeNotes: 'Emergency call - priority response'
    },
    timeline: {
      visitId: '4',
      events: [
        {
          id: 'event-4-1',
          timestamp: '2024-01-15T22:30:00Z',
          eventType: 'status_change',
          description: 'Emergency visit scheduled',
          technicianId: 'tech-2',
          details: { fromStatus: null, toStatus: 'scheduled' }
        },
        {
          id: 'event-4-2',
          timestamp: '2024-01-16T09:20:00Z',
          eventType: 'status_change',
          description: 'Technician dispatched',
          technicianId: 'tech-2',
          details: { fromStatus: 'scheduled', toStatus: 'en-route' }
        },
        {
          id: 'event-4-3',
          timestamp: '2024-01-16T10:00:00Z',
          eventType: 'status_change',
          description: 'Arrived at emergency site',
          technicianId: 'tech-2',
          details: { fromStatus: 'en-route', toStatus: 'arrived' }
        },
        {
          id: 'event-4-4',
          timestamp: '2024-01-16T10:05:00Z',
          eventType: 'status_change',
          description: 'Emergency repair started',
          technicianId: 'tech-2',
          details: { fromStatus: 'arrived', toStatus: 'in-progress' }
        },
        {
          id: 'event-4-5',
          timestamp: '2024-01-16T12:15:00Z',
          eventType: 'status_change',
          description: 'Emergency repair completed',
          technicianId: 'tech-2',
          details: { fromStatus: 'in-progress', toStatus: 'completed' }
        },
        {
          id: 'event-4-6',
          timestamp: '2024-01-16T11:30:00Z',
          eventType: 'issue_reported',
          description: 'Found additional damaged components',
          technicianId: 'tech-2',
          details: { severity: 'medium', resolved: true }
        }
      ],
      statusHistory: [
        {
          id: 'status-4-1',
          fromStatus: null,
          toStatus: 'scheduled',
          timestamp: '2024-01-15T22:30:00Z',
          technicianId: 'tech-2',
          automatic: false
        },
        {
          id: 'status-4-2',
          fromStatus: 'scheduled',
          toStatus: 'en-route',
          timestamp: '2024-01-16T09:20:00Z',
          technicianId: 'tech-2',
          automatic: false
        },
        {
          id: 'status-4-3',
          fromStatus: 'en-route',
          toStatus: 'arrived',
          timestamp: '2024-01-16T10:00:00Z',
          technicianId: 'tech-2',
          automatic: true
        },
        {
          id: 'status-4-4',
          fromStatus: 'arrived',
          toStatus: 'in-progress',
          timestamp: '2024-01-16T10:05:00Z',
          technicianId: 'tech-2',
          automatic: false
        },
        {
          id: 'status-4-5',
          fromStatus: 'in-progress',
          toStatus: 'completed',
          timestamp: '2024-01-16T12:15:00Z',
          technicianId: 'tech-2',
          automatic: false
        }
      ],
      totalDuration: 130
    },
    location: {
      destinationLocation: {
        latitude: 40.6892,
        longitude: -74.0445,
        timestamp: '2024-01-15T22:30:00Z'
      },
      actualArrival: '2024-01-16T10:00:00Z',
      travelDistance: 18.7
    }
  },
  {
    id: '5',
    clientId: '2',
    clientName: 'Sarah Johnson',
    propertyId: '2',
    propertyAddress: '456 Oak Ave, Somewhere, ST 67890',
    scheduledDate: '2024-01-22',
    scheduledTime: '11:00',
    endTime: '12:00',
    status: 'scheduled',
    visitType: 'maintenance',
    priority: 'medium',
    technician: 'Lisa Brown',
    technicianId: '3',
    estimatedDuration: 60,
    notes: 'Quarterly electrical system check.',
    contactPhone: '(555) 234-5678',
    contactEmail: 'sarah.j@email.com',
    createdAt: '2024-01-17T16:00:00Z',
    updatedAt: '2024-01-17T16:00:00Z'
  }
];
