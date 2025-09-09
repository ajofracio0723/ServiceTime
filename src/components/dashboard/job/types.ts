export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  notes?: string;
  completedBy?: string;
  completedAt?: string;
}

export interface ScheduledVisit {
  id: string;
  date: string;
  time: string;
  duration: string;
  purpose: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  completedAt?: string;
}

export interface AssignedTechnician {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
}

export interface JobPhoto {
  id: string;
  url: string;
  filename: string;
  description?: string;
  category: 'before' | 'during' | 'after' | 'issue' | 'completion' | 'other';
  uploadedBy: string;
  uploadedAt: string;
}

export interface JobSignature {
  id: string;
  type: 'client' | 'technician';
  signatureData: string; // Base64 encoded signature
  signerName: string;
  signerTitle?: string;
  signedAt: string;
  notes?: string;
}

export interface SLA {
  responseTime: number; // in hours
  completionTime: number; // in hours
  responseDeadline?: string;
  completionDeadline?: string;
  escalationContacts: string[];
}

export interface JobScope {
  description: string;
  objectives: string[];
  deliverables: string[];
  exclusions?: string[];
  requirements?: string[];
  safetyNotes?: string[];
}

export interface Job {
  id: string;
  jobNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  propertyId: string;
  propertyAddress: string;
  estimateId?: string;
  
  // Job Details
  scope: JobScope;
  description: string;
  category: 'hvac' | 'plumbing' | 'electrical' | 'landscaping' | 'cleaning' | 'maintenance' | 'repair' | 'installation' | 'inspection' | 'other';
  
  // Scheduling
  scheduledDate: string;
  scheduledTime?: string;
  estimatedDuration: string;
  scheduledVisits: ScheduledVisit[];
  
  // Status & Priority
  status: 'draft' | 'scheduled' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Financial
  estimatedCost: number;
  actualCost?: number;
  laborCost?: number;
  materialCost?: number;
  
  // Team
  assignedTechnicians: AssignedTechnician[];
  
  // Work Management
  checklist: ChecklistItem[];
  sla: SLA;
  
  // Documentation
  photos: JobPhoto[];
  signatures: JobSignature[];
  
  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  completedAt?: string;
  
  // Additional Notes
  internalNotes?: string;
  clientNotes?: string;
}

export interface JobFormData extends Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'> {}
