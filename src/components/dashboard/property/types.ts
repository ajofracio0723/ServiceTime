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

export interface Equipment {
  id: string;
  name: string;
  category: 'hvac' | 'plumbing' | 'electrical' | 'security' | 'appliance' | 'landscaping' | 'other';
  brand?: string;
  model?: string;
  serialNumber?: string;
  installDate?: string;
  warrantyExpiry?: string;
  lastServiceDate?: string;
  nextServiceDue?: string;
  serviceInterval?: number; // days between services
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
