export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface AccessNotes {
  gateCode?: string;
  keyLocation?: string;
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
  brand?: string;
  model?: string;
  serialNumber?: string;
  installDate?: string;
  warrantyExpiry?: string;
  lastServiceDate?: string;
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}