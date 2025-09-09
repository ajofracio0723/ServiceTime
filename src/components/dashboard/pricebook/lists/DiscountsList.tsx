import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { DiscountItem } from '../../../../utils/pricebookStorage';

interface DiscountsListProps {
  items: DiscountItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DiscountsList: React.FC<DiscountsListProps> = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-600">
        No discounts yet. Click "Add New" to create promotions or offers.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((discount) => (
        <div key={discount.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{discount.name}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
                  {discount.value}% {discount.type}
                </span>
                {discount.isActive && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-4 mt-4 text-sm text-gray-600">
                {discount.conditions?.minimumAmount && (
                  <span>
                    <span className="text-gray-500">Min Amount:</span> ${discount.conditions.minimumAmount}
                  </span>
                )}
                {discount.conditions?.firstTimeCustomer && (
                  <span>First Time Customers Only</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => onEdit(discount.id)} className="p-2 text-gray-400 hover:text-blue-600" aria-label="Edit discount">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(discount.id)} className="p-2 text-gray-400 hover:text-red-600" aria-label="Delete discount">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
