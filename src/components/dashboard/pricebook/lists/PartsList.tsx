import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { PartItem } from '../../../../utils/pricebookStorage';

interface PartsListProps {
  items: PartItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const PartsList: React.FC<PartsListProps> = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-600">
        No parts yet. Click "Add New" to add items to your catalog.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((part) => (
        <div key={part.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{part.name}</h3>
                {part.category && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                    {part.category}
                  </span>
                )}
                {part.sku && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 rounded-full">
                    SKU: {part.sku}
                  </span>
                )}
              </div>
              {part.description && (
                <p className="text-gray-600 mt-2">{part.description}</p>
              )}
              <div className="flex items-center flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <span>
                  <span className="text-gray-500">Cost:</span> ${part.cost}/{part.unit}
                </span>
                <span>
                  <span className="text-gray-500">Markup:</span> {part.markup}%
                </span>
                {typeof part.stockLevel === 'number' && (
                  <span>
                    <span className="text-gray-500">Stock:</span> {part.stockLevel} {part.unit}s
                  </span>
                )}
                {part.supplier && (
                  <span>
                    <span className="text-gray-500">Supplier:</span> {part.supplier}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => onEdit(part.id)} className="p-2 text-gray-400 hover:text-blue-600" aria-label="Edit part">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(part.id)} className="p-2 text-gray-400 hover:text-red-600" aria-label="Delete part">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
