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
  { id: 'other', name: 'Other', icon: '⚙️', color: 'bg-gray-100 text-gray-800' }
];

export interface EquipmentStatus {
  status: 'under_warranty' | 'overdue' | 'due_soon' | 'up_to_date' | 'no_data';
  label: string;
  color: string;
  bgColor: string;
  daysUntilDue?: number;
}

export const getEquipmentStatus = (equipment: Equipment): EquipmentStatus => {
  const today = new Date();
  
  // Check warranty status first
  if (equipment.warrantyExpiry) {
    const warrantyDate = new Date(equipment.warrantyExpiry);
    if (warrantyDate > today) {
      return {
        status: 'under_warranty',
        label: 'Under Warranty',
        color: 'text-purple-800',
        bgColor: 'bg-purple-100'
      };
    }
  }
  
  // Check service status
  if (equipment.nextServiceDue) {
    const serviceDue = new Date(equipment.nextServiceDue);
    const diffTime = serviceDue.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        status: 'overdue',
        label: `Overdue (${Math.abs(diffDays)} days)`,
        color: 'text-red-800',
        bgColor: 'bg-red-100',
        daysUntilDue: diffDays
      };
    } else if (diffDays <= 30) {
      return {
        status: 'due_soon',
        label: `Due Soon (${diffDays} days)`,
        color: 'text-orange-800',
        bgColor: 'bg-orange-100',
        daysUntilDue: diffDays
      };
    } else {
      return {
        status: 'up_to_date',
        label: `Up to Date (${diffDays} days)`,
        color: 'text-green-800',
        bgColor: 'bg-green-100',
        daysUntilDue: diffDays
      };
    }
  }
  
  // No service data available
  return {
    status: 'no_data',
    label: 'No Service Data',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100'
  };
};

export const getCategoryInfo = (categoryId: string): EquipmentCategory => {
  return equipmentCategories.find(cat => cat.id === categoryId) || equipmentCategories[6]; // Default to 'other'
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
