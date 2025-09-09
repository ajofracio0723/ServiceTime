import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { ServiceItem } from '../../../../utils/pricebookStorage';

interface ServicesListProps {
  items: ServiceItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ServicesList: React.FC<ServicesListProps> = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-600">
        No services yet. Click "Add New" to create your first service.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((service) => (
        <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                {service.category && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                    {service.category}
                  </span>
                )}
                {service.isActive && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
                    Active
                  </span>
                )}
              </div>
              {service.description && (
                <p className="text-gray-600 mt-2">{service.description}</p>
              )}
              <div className="flex items-center flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <span>
                  <span className="text-gray-500">Base Price:</span> ${service.basePrice}/{service.unit}
                </span>
                {service.estimatedDuration && (
                  <span>
                    <span className="text-gray-500">Duration:</span> {service.estimatedDuration} min
                  </span>
                )}
                {service.skillsRequired?.length ? (
                  <span>
                    <span className="text-gray-500">Skills:</span> {service.skillsRequired.join(', ')}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => onEdit(service.id)} className="p-2 text-gray-400 hover:text-blue-600" aria-label="Edit service">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(service.id)} className="p-2 text-gray-400 hover:text-red-600" aria-label="Delete service">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
