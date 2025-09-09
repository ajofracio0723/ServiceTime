import { Visit, VisitFormData } from '../components/dashboard/visit/types';

const STORAGE_KEY = 'servicetime_visits';

export const visitStorage = {
  // Get all visits from localStorage
  getAll: (): Visit[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading visits from storage:', error);
      return [];
    }
  },

  // Save all visits to localStorage
  saveAll: (visits: Visit[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
    } catch (error) {
      console.error('Error saving visits to storage:', error);
    }
  },

  // Get visit by ID
  getById: (id: string): Visit | null => {
    const visits = visitStorage.getAll();
    return visits.find(visit => visit.id === id) || null;
  },

  // Create new visit
  create: (visitData: VisitFormData): Visit => {
    const visits = visitStorage.getAll();
    const newVisit: Visit = {
      id: Date.now().toString(),
      ...visitData,
      endTime: addMinutesToTime(visitData.scheduledTime, visitData.estimatedDuration),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    visits.push(newVisit);
    visitStorage.saveAll(visits);
    return newVisit;
  },

  // Update existing visit
  update: (id: string, visitData: Partial<VisitFormData>): Visit | null => {
    const visits = visitStorage.getAll();
    const index = visits.findIndex(visit => visit.id === id);
    
    if (index === -1) return null;
    
    const updatedVisit: Visit = {
      ...visits[index],
      ...visitData,
      endTime: visitData.scheduledTime && visitData.estimatedDuration 
        ? addMinutesToTime(visitData.scheduledTime, visitData.estimatedDuration)
        : visits[index].endTime,
      updatedAt: new Date().toISOString()
    };
    
    visits[index] = updatedVisit;
    visitStorage.saveAll(visits);
    return updatedVisit;
  },

  // Delete visit
  delete: (id: string): boolean => {
    const visits = visitStorage.getAll();
    const filteredVisits = visits.filter(visit => visit.id !== id);
    
    if (filteredVisits.length === visits.length) return false;
    
    visitStorage.saveAll(filteredVisits);
    return true;
  },

  // Update visit status
  updateStatus: (id: string, status: Visit['status']): Visit | null => {
    const visits = visitStorage.getAll();
    const index = visits.findIndex(visit => visit.id === id);
    
    if (index === -1) return null;
    
    visits[index] = {
      ...visits[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    visitStorage.saveAll(visits);
    return visits[index];
  },

  // Search visits
  search: (query: string): Visit[] => {
    const visits = visitStorage.getAll();
    const lowercaseQuery = query.toLowerCase();
    
    return visits.filter(visit =>
      visit.clientName.toLowerCase().includes(lowercaseQuery) ||
      visit.propertyAddress.toLowerCase().includes(lowercaseQuery) ||
      visit.technician.toLowerCase().includes(lowercaseQuery) ||
      visit.notes.toLowerCase().includes(lowercaseQuery)
    );
  },

  // Get visits by date range
  getByDateRange: (startDate: string, endDate: string): Visit[] => {
    const visits = visitStorage.getAll();
    return visits.filter(visit => 
      visit.scheduledDate >= startDate && visit.scheduledDate <= endDate
    );
  },

  // Get visits by technician
  getByTechnician: (technicianId: string): Visit[] => {
    const visits = visitStorage.getAll();
    return visits.filter(visit => visit.technicianId === technicianId);
  },

  // Get visits by status
  getByStatus: (status: Visit['status']): Visit[] => {
    const visits = visitStorage.getAll();
    return visits.filter(visit => visit.status === status);
  },

  // Initialize with mock data if empty
  initializeWithMockData: (mockVisits: Visit[]): void => {
    const existingVisits = visitStorage.getAll();
    if (existingVisits.length === 0) {
      visitStorage.saveAll(mockVisits);
    }
  },

  // Clear all visits (for testing/reset)
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Helper function to add minutes to time string
function addMinutesToTime(timeString: string, minutes: number): string {
  const [hours, mins] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}
