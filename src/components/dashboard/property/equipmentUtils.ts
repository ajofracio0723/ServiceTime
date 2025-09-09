import { Equipment } from './types';

export interface EquipmentCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const equipmentCategories: EquipmentCategory[] = [
  { id: 'hvac', name: 'HVAC', icon: '🌡️', color: 'bg-blue-100 text-blue-800' },
  { id: 'plumbing', name: 'Plumbing', icon: '🔧', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'electrical', name: 'Electrical', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'security', name: 'Security', icon: '🔒', color: 'bg-red-100 text-red-800' },
  { id: 'appliance', name: 'Appliance', icon: '🏠', color: 'bg-green-100 text-green-800' },
  { id: 'landscaping', name: 'Landscaping', icon: '🌿', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'other', name: 'Other', icon: '⚙️', color: 'bg-gray-100 text-gray-800' },
];

export const equipmentStatusFilters = [
  { id: 'all', name: 'All Equipment', color: 'bg-gray-100 text-gray-800' },
  { id: 'critical', name: 'Critical', color: 'bg-red-100 text-red-800' },
  { id: 'under_repair', name: 'Under Repair', color: 'bg-red-100 text-red-800' },
  { id: 'overdue', name: 'Overdue', color: 'bg-red-100 text-red-800' },
  { id: 'due_soon', name: 'Due Soon', color: 'bg-orange-100 text-orange-800' },
  { id: 'under_warranty', name: 'Under Warranty', color: 'bg-purple-100 text-purple-800' },
  { id: 'warranty_expiring', name: 'Warranty Expiring', color: 'bg-amber-100 text-amber-800' },
  { id: 'needs_inspection', name: 'Needs Inspection', color: 'bg-blue-100 text-blue-800' },
  { id: 'up_to_date', name: 'Up to Date', color: 'bg-green-100 text-green-800' },
  { id: 'inactive', name: 'Inactive', color: 'bg-gray-200 text-gray-700' },
  { id: 'replaced', name: 'Replaced', color: 'bg-gray-100 text-gray-600' },
  { id: 'no_data', name: 'No Data', color: 'bg-gray-100 text-gray-600' }
];

export interface EquipmentStatus {
  status: 'overdue' | 'due_soon' | 'under_warranty' | 'warranty_expiring' | 'needs_inspection' | 'up_to_date' | 'no_data' | 'under_repair' | 'replaced' | 'inactive';
  label: string;
  color: string;
  bgColor: string;
  daysUntilDue?: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  actionRequired?: string;
}

export const getEquipmentStatus = (equipment: Equipment): EquipmentStatus => {
  const today = new Date();
  
  // Check equipment operational status first
  if (equipment.status === 'under_repair') {
    return {
      status: 'under_repair',
      label: 'Under Repair',
      color: 'text-red-800',
      bgColor: 'bg-red-100',
      priority: 'critical',
      actionRequired: 'Complete repairs and restore to service'
    };
  }
  
  if (equipment.status === 'replaced') {
    return {
      status: 'replaced',
      label: 'Replaced',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      priority: 'low',
      actionRequired: 'Archive or remove from active equipment list'
    };
  }
  
  if (equipment.status === 'inactive') {
    return {
      status: 'inactive',
      label: 'Inactive',
      color: 'text-gray-700',
      bgColor: 'bg-gray-200',
      priority: 'low',
      actionRequired: 'Determine if equipment should be reactivated or replaced'
    };
  }
  
  // Check warranty status for active equipment
  if (equipment.warrantyExpiry) {
    const warrantyDate = new Date(equipment.warrantyExpiry);
    const diffTime = warrantyDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (warrantyDate > today) {
      if (diffDays <= 30) {
        return {
          status: 'warranty_expiring',
          label: `Warranty Expiring (${diffDays} days)`,
          color: 'text-amber-800',
          bgColor: 'bg-amber-100',
          priority: 'medium',
          actionRequired: 'Review warranty renewal options',
          daysUntilDue: diffDays
        };
      }
      return {
        status: 'under_warranty',
        label: 'Under Warranty',
        color: 'text-purple-800',
        bgColor: 'bg-purple-100',
        priority: 'low'
      };
    }
  }
  
  // Check service status
  if (equipment.nextServiceDue) {
    const serviceDue = new Date(equipment.nextServiceDue);
    const diffTime = serviceDue.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return {
        status: 'overdue',
        label: `Overdue (${overdueDays} days)`,
        color: 'text-red-800',
        bgColor: 'bg-red-100',
        daysUntilDue: diffDays,
        priority: overdueDays > 90 ? 'critical' : 'high',
        actionRequired: 'Schedule maintenance immediately'
      };
    } else if (diffDays <= 7) {
      return {
        status: 'due_soon',
        label: `Due This Week (${diffDays} days)`,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        daysUntilDue: diffDays,
        priority: 'high',
        actionRequired: 'Schedule maintenance this week'
      };
    } else if (diffDays <= 30) {
      return {
        status: 'due_soon',
        label: `Due Soon (${diffDays} days)`,
        color: 'text-orange-800',
        bgColor: 'bg-orange-100',
        daysUntilDue: diffDays,
        priority: 'medium',
        actionRequired: 'Schedule maintenance soon'
      };
    } else {
      return {
        status: 'up_to_date',
        label: `Up to Date (${diffDays} days)`,
        color: 'text-green-800',
        bgColor: 'bg-green-100',
        daysUntilDue: diffDays,
        priority: 'low'
      };
    }
  }
  
  // Check if equipment needs initial inspection
  if (!equipment.lastServiceDate && equipment.installDate) {
    const installDate = new Date(equipment.installDate);
    const daysSinceInstall = Math.floor((today.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceInstall > 30) {
      return {
        status: 'needs_inspection',
        label: 'Needs Initial Inspection',
        color: 'text-blue-800',
        bgColor: 'bg-blue-100',
        priority: 'medium',
        actionRequired: 'Schedule initial inspection'
      };
    }
  }
  
  // No service data available
  return {
    status: 'no_data',
    label: 'No Service Data',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    priority: 'low',
    actionRequired: 'Add service schedule'
  };
};

export const getCategoryInfo = (categoryId: string): EquipmentCategory => {
  return equipmentCategories.find(cat => cat.id === categoryId) || equipmentCategories.find(cat => cat.id === 'other') || {
    id: 'other',
    name: 'Other',
    icon: '⚙️',
    color: 'bg-gray-100 text-gray-800'
  };
};

export const getStatusFilterInfo = (statusId: string) => {
  return equipmentStatusFilters.find(filter => filter.id === statusId) || equipmentStatusFilters[0];
};

export const calculateNextServiceDue = (lastServiceDate: string, serviceInterval: number): string => {
  if (!lastServiceDate) return '';
  
  const lastService = new Date(lastServiceDate);
  const nextDue = new Date(lastService);
  nextDue.setDate(nextDue.getDate() + serviceInterval);
  
  return nextDue.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

export const filterEquipmentByCategory = (equipment: Equipment[], categoryFilter: string): Equipment[] => {
  if (categoryFilter === 'all') return equipment;
  return equipment.filter(eq => eq.category === categoryFilter);
};

export const filterEquipmentByStatus = (equipment: Equipment[], statusFilter: string): Equipment[] => {
  if (statusFilter === 'all') return equipment;
  return equipment.filter(eq => getEquipmentStatus(eq).status === statusFilter);
};

export const sortEquipmentByPriority = (equipment: Equipment[]): Equipment[] => {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...equipment].sort((a, b) => {
    const statusA = getEquipmentStatus(a);
    const statusB = getEquipmentStatus(b);
    return priorityOrder[statusA.priority] - priorityOrder[statusB.priority];
  });
};

export const getEquipmentStatusSummary = (equipment: Equipment[]) => {
  const summary = {
    total: equipment.length,
    critical: 0,
    overdue: 0,
    dueSoon: 0,
    underWarranty: 0,
    upToDate: 0,
    noData: 0,
    needsInspection: 0,
    warrantyExpiring: 0
  };

  equipment.forEach(eq => {
    const status = getEquipmentStatus(eq);
    
    if (status.priority === 'critical') summary.critical++;
    
    switch (status.status) {
      case 'overdue':
        summary.overdue++;
        break;
      case 'due_soon':
        summary.dueSoon++;
        break;
      case 'under_warranty':
        summary.underWarranty++;
        break;
      case 'warranty_expiring':
        summary.warrantyExpiring++;
        break;
      case 'up_to_date':
        summary.upToDate++;
        break;
      case 'needs_inspection':
        summary.needsInspection++;
        break;
      case 'no_data':
        summary.noData++;
        break;
    }
  });

  return summary;
};

export interface MaintenanceAlert {
  equipmentId: string;
  equipmentName: string;
  category: string;
  status: string;
  message: string;
  actionRequired?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  daysUntilDue?: number;
}

export const getMaintenanceAlerts = (equipment: Equipment[]): MaintenanceAlert[] => {
  const alerts: MaintenanceAlert[] = [];
  
  equipment.forEach(eq => {
    const status = getEquipmentStatus(eq);
    
    if (status.priority === 'critical' || status.priority === 'high') {
      alerts.push({
        equipmentId: eq.id,
        equipmentName: eq.name,
        category: eq.category,
        status: status.status,
        message: status.label,
        actionRequired: status.actionRequired,
        priority: status.priority,
        daysUntilDue: status.daysUntilDue
      });
    }
  });
  
  return alerts.sort((a, b) => {
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
};
