export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  description?: string;
  type: 'equipment' | 'access' | 'parking' | 'utility' | 'custom';
}

export interface AccessNotes {
  gateCode?: string;
  specialInstructions: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  bestTimeToAccess?: string;
  parkingInstructions?: string;
}

export interface ServiceRecord {
  id: string;
  jobId?: string;
  date: string;
  type: 'maintenance' | 'repair' | 'inspection' | 'installation' | 'replacement';
  description: string;
  technicianId?: string;
  technicianName?: string;
  cost?: number;
  partsUsed?: string[];
  notes?: string;
  nextServiceRecommended?: string;
}

export interface Equipment {
  id: string;
  name: string; // e.g., "Daikin Split-Type AC", "Generator", "Router"
  type?: string; // Additional type classification
  category: 'hvac' | 'plumbing' | 'electrical' | 'security' | 'appliance' | 'landscaping' | 'other';
  brand?: string;
  model?: string;
  serialNumber?: string;
  installDate?: string;
  warrantyExpiry?: string;
  locationAtProperty?: string; // e.g., "Roof", "Server Room", "Basement"
  status: 'active' | 'inactive' | 'under_repair' | 'replaced';
  lastServiceDate?: string;
  nextServiceDue?: string;
  serviceInterval?: number; // days between services
  serviceHistory: ServiceRecord[];
  notes?: string;
}

export interface Property {
  id: string;
  clientId: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  geoLocation?: GeoLocation;
  propertyType: 'residential' | 'commercial' | 'industrial';
  accessNotes: AccessNotes;
  linkedEquipment: Equipment[];
  photos: string[];
  mapPins: MapPin[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
