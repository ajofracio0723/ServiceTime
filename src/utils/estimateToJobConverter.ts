import { Estimate } from '../types/domains/Estimate';
import { Job } from '../types/domains/Job';

export interface JobConversionOptions {
  scheduledDate?: string;
  assignedTechnicians?: string[];
  priority?: 'low' | 'normal' | 'high' | 'emergency';
  notes?: string;
  responseTime?: number;
  completionTime?: number;
}

const calculateEstimatedDuration = (items: any[]): number => {
  return items.reduce((total, item) => {
    switch (item.type) {
      case 'service':
        return total + (item.quantity * 1);
      case 'labor':
        return total + item.quantity;
      case 'part':
      case 'material':
        return total + (item.quantity * 0.5);
      case 'equipment':
        return total + (item.quantity * 2);
      default:
        return total;
    }
  }, 0);
};

const determineComplexity = (items: any[]): 'low' | 'medium' | 'high' => {
  const totalValue = items.reduce((sum, item) => sum + item.total, 0);
  const itemCount = items.length;
  const categories = new Set(items.map(item => item.category).filter(Boolean));
  
  if (totalValue > 2000 || itemCount > 8 || categories.size > 2) return 'high';
  if (totalValue > 500 || itemCount > 4 || categories.size > 1) return 'medium';
  return 'low';
};

const getSpecialRequirements = (items: any[]): string[] => {
  const requirements: string[] = [];
  const categories = new Set(items.map(item => item.category).filter(Boolean));
  
  if (categories.has('electrical')) {
    requirements.push('Licensed electrician required');
  }
  if (categories.has('plumbing')) {
    requirements.push('Licensed plumber required');
  }
  if (categories.has('hvac')) {
    requirements.push('HVAC certification required');
  }
  if (categories.has('security')) {
    requirements.push('Security system expertise required');
  }
  
  return requirements;
};

const generateChecklistFromItems = (items: any[]) => {
  return items.map((item, index) => ({
    id: `checklist-${index + 1}`,
    task: `${item.name} - ${item.description || 'Complete task'}`,
    isCompleted: false
  }));
};

const getRequiredSkills = (items: any[]): string[] => {
  const skills = new Set<string>();
  
  items.forEach(item => {
    if (item.category) {
      skills.add(item.category);
    }
  });

  return Array.from(skills);
};

export const convertEstimateToJob = (
  estimate: Estimate, 
  options: JobConversionOptions = {}
): Job => {
  const estimatedDuration = calculateEstimatedDuration(estimate.items);
  
  const job: Job = {
    id: `job-${Date.now()}`,
    jobNumber: generateJobNumber(),
    clientId: estimate.clientId,
    propertyId: estimate.propertyId,
    estimateId: estimate.id,
    title: estimate.title,
    scope: {
      description: estimate.description,
      estimatedDuration,
      complexity: determineComplexity(estimate.items),
      specialRequirements: getSpecialRequirements(estimate.items)
    },
    checklist: generateChecklistFromItems(estimate.items),
    sla: {
      responseTime: options.responseTime || 24,
      completionTime: options.completionTime || estimatedDuration,
      priority: options.priority || 'normal'
    },
    scheduledVisits: [],
    assignedTechnicians: options.assignedTechnicians || [],
    status: 'scheduled',
    photos: [],
    signatures: [],
    notes: options.notes || estimate.notes || '',
    internalNotes: estimate.internalNotes || '',
    createdBy: estimate.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return job;
};

export const generateJobNumber = (): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `JOB-${year}-${timestamp}`;
};

export const validateEstimateForConversion = (estimate: Estimate): string[] => {
  const errors: string[] = [];

  if (estimate.status !== 'approved') {
    errors.push('Estimate must be approved before conversion to job');
  }

  if (!estimate.clientApproval.isApproved) {
    errors.push('Client approval is required before conversion');
  }

  if (estimate.items.length === 0) {
    errors.push('Estimate must have at least one item');
  }

  if (estimate.total <= 0) {
    errors.push('Estimate total must be greater than zero');
  }

  const validUntil = new Date(estimate.terms.validUntil);
  if (validUntil < new Date()) {
    errors.push('Estimate has expired and cannot be converted');
  }

  return errors;
};

export const getConversionSummary = (estimate: Estimate) => {
  return {
    itemCount: estimate.items.length,
    totalValue: estimate.total,
    depositRequired: estimate.depositRequirement.isRequired,
    depositAmount: estimate.depositRequirement.percentage 
      ? (estimate.total * estimate.depositRequirement.percentage / 100)
      : estimate.depositRequirement.amount || 0,
    estimatedDuration: calculateEstimatedDuration(estimate.items),
    requiredSkills: getRequiredSkills(estimate.items)
  };
};
