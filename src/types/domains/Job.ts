export interface JobScope {
  description: string;
  estimatedDuration: number;
  complexity: 'low' | 'medium' | 'high';
  specialRequirements?: string[];
}

export interface ChecklistItem {
  id: string;
  task: string;
  isCompleted: boolean;
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}

export interface SLA {
  responseTime: number; // in hours
  completionTime: number; // in hours
  priority: 'low' | 'normal' | 'high' | 'emergency';
}

export interface ScheduledVisit {
  id: string;
  visitDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  assignedTechnicians: string[];
  isCompleted: boolean;
}

export interface JobPhoto {
  id: string;
  url: string;
  caption?: string;
  category: 'before' | 'during' | 'after' | 'damage' | 'completion';
  uploadedBy: string;
  uploadedAt: string;
}

export interface JobSignature {
  id: string;
  type: 'start' | 'completion' | 'approval';
  signatureUrl: string;
  signerName: string;
  signedAt: string;
  notes?: string;
}

export type JobStatus = 'scheduled' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  jobNumber: string;
  clientId: string;
  propertyId: string;
  estimateId?: string;
  title: string;
  scope: JobScope;
  checklist: ChecklistItem[];
  sla: SLA;
  scheduledVisits: ScheduledVisit[];
  assignedTechnicians: string[];
  status: JobStatus;
  photos: JobPhoto[];
  signatures: JobSignature[];
  notes: string;
  internalNotes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}