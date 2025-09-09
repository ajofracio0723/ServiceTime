import { JobFormData } from '../components/dashboard/job/types';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateJob = (job: Partial<JobFormData>): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required fields validation
  if (!job.title?.trim()) {
    errors.push({ field: 'title', message: 'Job title is required' });
  }

  if (!job.clientId?.trim()) {
    errors.push({ field: 'clientId', message: 'Client selection is required' });
  }

  if (!job.propertyId?.trim()) {
    errors.push({ field: 'propertyId', message: 'Property selection is required' });
  }

  // Job-level schedule: required only if no per-visit schedules are provided
  const hasPerVisitSchedules = !!(job.scheduledVisits && job.scheduledVisits.length > 0);
  if (!hasPerVisitSchedules) {
    if (!job.scheduledDate) {
      errors.push({ field: 'scheduledDate', message: 'Scheduled date is required' });
    } else {
      // Validate date is not in the past (unless it's today)
      const scheduledDate = new Date(job.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      scheduledDate.setHours(0, 0, 0, 0);
      
      if (scheduledDate < today) {
        errors.push({ field: 'scheduledDate', message: 'Scheduled date cannot be in the past' });
      }
    }
  }

  if (!job.category) {
    errors.push({ field: 'category', message: 'Job category is required' });
  }

  if (!job.priority) {
    errors.push({ field: 'priority', message: 'Priority level is required' });
  }

  if (!hasPerVisitSchedules) {
    if (!job.estimatedDuration?.trim()) {
      errors.push({ field: 'estimatedDuration', message: 'Estimated duration is required' });
    }
  }

  // Scope validation
  if (!job.scope?.description?.trim()) {
    errors.push({ field: 'scope.description', message: 'Scope description is required' });
  }

  if (!job.scope?.objectives || job.scope.objectives.length === 0) {
    errors.push({ field: 'scope.objectives', message: 'At least one objective is required' });
  }

  // Cost validation
  if (job.estimatedCost !== undefined && job.estimatedCost < 0) {
    errors.push({ field: 'estimatedCost', message: 'Estimated cost cannot be negative' });
  }

  // Assigned technicians validation
  if (!job.assignedTechnicians || job.assignedTechnicians.length === 0) {
    errors.push({ field: 'assignedTechnicians', message: 'At least one technician must be assigned' });
  } else {
    // Check if there's exactly one primary technician
    const primaryTechs = job.assignedTechnicians.filter(tech => tech.isPrimary);
    if (primaryTechs.length === 0) {
      errors.push({ field: 'assignedTechnicians', message: 'One technician must be marked as primary' });
    } else if (primaryTechs.length > 1) {
      errors.push({ field: 'assignedTechnicians', message: 'Only one technician can be marked as primary' });
    }
  }

  // SLA validation
  if (job.sla) {
    if (job.sla.responseTime < 0) {
      errors.push({ field: 'sla.responseTime', message: 'Response time cannot be negative' });
    }
    if (job.sla.completionTime < 0) {
      errors.push({ field: 'sla.completionTime', message: 'Completion time cannot be negative' });
    }
    if (job.sla.responseTime >= job.sla.completionTime) {
      errors.push({ field: 'sla.completionTime', message: 'Completion time must be greater than response time' });
    }
  }

  // Scheduled visits validation
  if (job.scheduledVisits && job.scheduledVisits.length > 0) {
    job.scheduledVisits.forEach((visit, index) => {
      if (!visit.date) {
        errors.push({ field: `scheduledVisits.${index}.date`, message: 'Visit date is required' });
      }
      if (!visit.time) {
        errors.push({ field: `scheduledVisits.${index}.time`, message: 'Visit time is required' });
      }
      if (!visit.purpose?.trim()) {
        errors.push({ field: `scheduledVisits.${index}.purpose`, message: 'Visit purpose is required' });
      }
    });
  }

  return errors;
};

export const validateChecklistItem = (item: { task: string }): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!item.task?.trim()) {
    errors.push({ field: 'task', message: 'Task description is required' });
  }
  
  return errors;
};

export const validateScheduledVisit = (visit: { date: string; time: string; purpose: string }): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!visit.date) {
    errors.push({ field: 'date', message: 'Visit date is required' });
  }
  
  if (!visit.time) {
    errors.push({ field: 'time', message: 'Visit time is required' });
  }
  
  if (!visit.purpose?.trim()) {
    errors.push({ field: 'purpose', message: 'Visit purpose is required' });
  }
  
  return errors;
};

export const validateTechnician = (tech: { name: string; role: string }): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!tech.name?.trim()) {
    errors.push({ field: 'name', message: 'Technician name is required' });
  }
  
  if (!tech.role?.trim()) {
    errors.push({ field: 'role', message: 'Technician role is required' });
  }
  
  return errors;
};

export const getFieldError = (errors: ValidationError[], fieldName: string): string | undefined => {
  const error = errors.find(err => err.field === fieldName);
  return error?.message;
};
