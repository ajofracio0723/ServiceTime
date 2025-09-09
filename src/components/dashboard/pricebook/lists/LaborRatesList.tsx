import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { LaborRate } from '../../../../utils/pricebookStorage';

interface LaborRatesListProps {
  items: LaborRate[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const LaborRatesList: React.FC<LaborRatesListProps> = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-600">
        No labor rates yet. Click "Add New" to set up your rates.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((rate) => (
        <div key={rate.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{rate.name}</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full border ${
                    rate.skillLevel === 'master'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : rate.skillLevel === 'journeyman'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-green-50 text-green-700 border-green-200'
                  }`}
                >
                  {rate.skillLevel}
                </span>
                {rate.isDefault && (
                  <span className="px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 rounded-full">
                    Default
                  </span>
                )}
              </div>
              {rate.description && (
                <p className="text-gray-600 mt-2">{rate.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                <span className="text-lg font-semibold text-gray-900">${rate.hourlyRate}/hour</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => onEdit(rate.id)} className="p-2 text-gray-400 hover:text-blue-600" aria-label="Edit labor rate">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(rate.id)} className="p-2 text-gray-400 hover:text-red-600" aria-label="Delete labor rate">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
