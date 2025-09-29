import { Estimate } from '../types/domains/Estimate';
import { Job } from '../components/dashboard/job/types';
import { Client } from '../types/domains/Client';
import { Property } from '../types/domains/Property';

export interface JobConversionOptions {
  scheduledDate?: string;
  assignedTechnicians?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
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
    completed: false
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

const mapEstimateCategoryToJobCategory = (category: string): 'hvac' | 'plumbing' | 'electrical' | 'landscaping' | 'cleaning' | 'maintenance' | 'repair' | 'installation' | 'inspection' | 'other' => {
  const categoryMap: Record<string, 'hvac' | 'plumbing' | 'electrical' | 'landscaping' | 'cleaning' | 'maintenance' | 'repair' | 'installation' | 'inspection' | 'other'> = {
    'hvac': 'hvac',
    'plumbing': 'plumbing',
    'electrical': 'electrical',
    'landscaping': 'landscaping',
    'cleaning': 'cleaning',
    'maintenance': 'maintenance',
    'repair': 'repair',
    'installation': 'installation',
    'inspection': 'inspection'
  };
  
  return categoryMap[category?.toLowerCase()] || 'other';
};

const getSafetyNotes = (items: any[]): string[] => {
  const safetyNotes: string[] = [];
  const categories = new Set(items.map(item => item.category).filter(Boolean));
  
  if (categories.has('electrical')) {
    safetyNotes.push('Turn off power at breaker before starting work');
    safetyNotes.push('Use proper electrical safety equipment');
    safetyNotes.push('Test circuits before and after work');
  }
  if (categories.has('plumbing')) {
    safetyNotes.push('Turn off water supply before starting work');
    safetyNotes.push('Have towels and buckets ready for water cleanup');
  }
  if (categories.has('hvac')) {
    safetyNotes.push('Turn off HVAC system before maintenance');
    safetyNotes.push('Check for proper ventilation');
  }
  
  return safetyNotes;
};

const calculateLaborCost = (items: any[]): number => {
  return items
    .filter(item => item.type === 'labor' || item.type === 'service')
    .reduce((sum, item) => sum + (item.total || 0), 0);
};

const calculateMaterialCost = (items: any[]): number => {
  return items
    .filter(item => item.type === 'part' || item.type === 'material' || item.type === 'equipment')
    .reduce((sum, item) => sum + (item.total || 0), 0);
};

export const convertEstimateToJob = (
  estimate: Estimate,
  client: Client,
  property: Property,
  options: JobConversionOptions = {}
): Job => {
  const estimatedDuration = calculateEstimatedDuration(estimate.items);
  const clientName = client.type === 'company' ? (client.companyName || '') : `${client.firstName || ''} ${client.lastName || ''}`.trim();
  const propertyAddress = property.address ? `${property.address.street || ''}, ${property.address.city || ''}`.trim() : '';
  
  // Determine job category based on estimate items
  const categories = estimate.items.map(item => item.category).filter(Boolean);
  const primaryCategory = categories.length > 0 ? categories[0] : 'maintenance';
  const jobCategory = mapEstimateCategoryToJobCategory(primaryCategory || 'maintenance');
  
  const job: Job = {
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    jobNumber: generateJobNumber(), // Will be overridden by jobStorage.generateJobNumber()
    clientId: estimate.clientId,
    clientName,
    propertyId: estimate.propertyId,
    propertyAddress,
    estimateId: estimate.id,
    title: `${estimate.title} (From Estimate ${estimate.estimateNumber})`,
    scope: {
      description: estimate.description,
      objectives: [
        `Complete work as outlined in estimate ${estimate.estimateNumber}`,
        `Deliver all services and materials as specified`,
        `Ensure client satisfaction and quality standards`
      ],
      deliverables: estimate.items.map(item => 
        `${item.name} - ${item.description || 'Complete as specified'} (Qty: ${item.quantity})`
      ),
      requirements: getSpecialRequirements(estimate.items),
      safetyNotes: getSafetyNotes(estimate.items)
    },
    description: `Job created from approved estimate ${estimate.estimateNumber}. ${estimate.description}`,
    category: jobCategory,
    scheduledDate: options.scheduledDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedDuration: `${Math.ceil(estimatedDuration)}h`,
    scheduledVisits: [{
      id: `visit-${Date.now()}`,
      date: options.scheduledDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '09:00',
      duration: `${Math.ceil(estimatedDuration)}h`,
      purpose: 'Complete work as per estimate',
      status: 'scheduled'
    }],
    status: 'draft',
    priority: options.priority || 'medium',
    estimatedCost: estimate.total,
    laborCost: calculateLaborCost(estimate.items),
    materialCost: calculateMaterialCost(estimate.items),
    assignedTechnicians: [],
    checklist: generateChecklistFromItems(estimate.items),
    sla: {
      responseTime: options.responseTime || 24,
      completionTime: options.completionTime || Math.ceil(estimatedDuration),
      escalationContacts: []
    },
    signatures: [],
    photos: [],
    createdAt: new Date().toISOString(),
    createdBy: estimate.createdBy,
    updatedAt: new Date().toISOString(),
    updatedBy: estimate.createdBy,
    internalNotes: `Created from estimate ${estimate.estimateNumber}. ${estimate.internalNotes || ''}`,
    clientNotes: options.notes || estimate.notes || `Work to be completed as per estimate ${estimate.estimateNumber}`
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
