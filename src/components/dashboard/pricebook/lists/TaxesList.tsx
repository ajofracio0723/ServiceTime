import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { TaxItem } from '../../../../utils/pricebookStorage';

interface TaxesListProps {
  items: TaxItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaxesList: React.FC<TaxesListProps> = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-600">
        No taxes yet. Click "Add New" to configure tax rules.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((tax) => (
        <div key={tax.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{tax.name}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-full">
                  {tax.rate}% {tax.type}
                </span>
                {tax.isDefault && (
                  <span className="px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <span>
                  <span className="text-gray-500">Applies to:</span> {tax.applicableServices?.join(', ') || '—'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => onEdit(tax.id)} className="p-2 text-gray-400 hover:text-blue-600" aria-label="Edit tax">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(tax.id)} className="p-2 text-gray-400 hover:text-red-600" aria-label="Delete tax">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
