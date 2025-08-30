export type UserRole = 'owner' | 'admin' | 'technician' | 'dispatcher' | 'accountant';

export interface SkillTag {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  isActive: boolean;
}

export interface Availability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profilePicture?: string;
  role: UserRole;
  isActive: boolean;
  skillTags: SkillTag[];
  assignedVehicles: Vehicle[];
  availability: Availability[];
  hourlyRate?: number;
  hireDate: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  userId: string;
  accountId: string;
  role: UserRole;
  permissions: string[];
  joinedAt: string;
  isActive: boolean;
}