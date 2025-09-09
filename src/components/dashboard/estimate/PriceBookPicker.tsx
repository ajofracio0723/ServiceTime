import React, { useEffect, useMemo, useState } from 'react';
import { Search, Wrench, Package, Clock, Percent } from 'lucide-react';
import { PriceBookStorage, ServiceItem, PartItem, LaborRate, TaxItem, DiscountItem } from '../../../utils/pricebookStorage';

export type PickerTab = 'services' | 'parts' | 'labor' | 'taxes' | 'discounts';

interface PriceBookPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem?: (payload: { type: 'service' | 'part' | 'labor'; data: ServiceItem | PartItem | LaborRate }) => void;
  onSelectTax?: (tax: TaxItem) => void;
  onSelectDiscount?: (discount: DiscountItem) => void;
  initialTab?: PickerTab;
}

export const PriceBookPicker: React.FC<PriceBookPickerProps> = ({
  isOpen,
  onClose,
  onSelectItem,
  onSelectTax,
  onSelectDiscount,
  initialTab = 'services',
}) => {
  const [activeTab, setActiveTab] = useState<PickerTab>(initialTab);
  const [q, setQ] = useState('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [parts, setParts] = useState<PartItem[]>([]);
  const [laborRates, setLaborRates] = useState<LaborRate[]>([]);
  const [taxes, setTaxes] = useState<TaxItem[]>([]);
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      setServices(PriceBookStorage.getServices());
      setParts(PriceBookStorage.getParts());
      setLaborRates(PriceBookStorage.getLaborRates());
      setTaxes(PriceBookStorage.getTaxes());
      setDiscounts(PriceBookStorage.getDiscounts());
    } catch (e) {
      console.error('Failed to load pricebook data', e);
    }
  }, [isOpen]);

  const matchesQuery = (x: { name?: string; description?: string; category?: string }) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (
      (x.name || '').toLowerCase().includes(s) ||
      (x.description || '').toLowerCase().includes(s) ||
      (x.category || '').toLowerCase().includes(s)
    );
  };

  const tabs: { id: PickerTab; label: string; icon: any; count: number }[] = useMemo(() => ([
    { id: 'services', label: 'Services', icon: Wrench, count: services.length },
    { id: 'parts', label: 'Parts', icon: Package, count: parts.length },
    { id: 'labor', label: 'Labor', icon: Clock, count: laborRates.length },
    { id: 'taxes', label: 'Taxes', icon: Percent, count: taxes.length },
    { id: 'discounts', label: 'Discounts', icon: Percent, count: discounts.length },
  ]), [services.length, parts.length, laborRates.length, taxes.length, discounts.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Browse Price Book</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-4 flex items-center gap-3 border-b border-gray-100">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, description or category..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="px-4 border-b border-gray-100">
          <nav className="-mb-px flex gap-6 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 py-2 border-b-2 text-sm ${activeTab === t.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{t.count}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {activeTab === 'services' && (
            <div className="space-y-3">
              {services.filter(matchesQuery).map((item) => (
                <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      {item.category && (
                        <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full">{item.category}</span>
                      )}
                    </div>
                    {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                    <div className="text-sm text-gray-600 mt-1">Unit Price: ${item.basePrice ?? 0}</div>
                  </div>
                  <button
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => onSelectItem?.({ type: 'service', data: item })}
                  >
                    Use
                  </button>
                </div>
              ))}
              {services.filter(matchesQuery).length === 0 && (
                <div className="text-sm text-gray-500">No services found.</div>
              )}
            </div>
          )}

          {activeTab === 'parts' && (
            <div className="space-y-3">
              {parts.filter(matchesQuery).map((item) => {
                const price = (item.cost ?? 0) * (1 + (item.markup ?? 0) / 100);
                return (
                  <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        {item.category && (
                          <span className="text-xs bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full">{item.category}</span>
                        )}
                        {item.sku && (
                          <span className="text-xs bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full">SKU: {item.sku}</span>
                        )}
                      </div>
                      {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                      <div className="text-sm text-gray-600 mt-1">Unit Price: ${price.toFixed(2)}</div>
                    </div>
                    <button
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={() => onSelectItem?.({ type: 'part', data: item })}
                    >
                      Use
                    </button>
                  </div>
                );
              })}
              {parts.filter(matchesQuery).length === 0 && (
                <div className="text-sm text-gray-500">No parts found.</div>
              )}
            </div>
          )}

          {activeTab === 'labor' && (
            <div className="space-y-3">
              {laborRates.filter(matchesQuery).map((item) => (
                <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <span className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">{item.skillLevel}</span>
                    </div>
                    {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                    <div className="text-sm text-gray-600 mt-1">Hourly Rate: ${item.hourlyRate}</div>
                  </div>
                  <button
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => onSelectItem?.({ type: 'labor', data: item })}
                  >
                    Use
                  </button>
                </div>
              ))}
              {laborRates.filter(matchesQuery).length === 0 && (
                <div className="text-sm text-gray-500">No labor rates found.</div>
              )}
            </div>
          )}

          {activeTab === 'taxes' && (
            <div className="space-y-3">
              {taxes.filter(matchesQuery).map((tax) => (
                <div key={tax.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{tax.name}</span>
                      <span className="text-xs bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded-full">{tax.rate}% {tax.type}</span>
                    </div>
                  </div>
                  <button
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => onSelectTax?.(tax)}
                  >
                    Add Tax
                  </button>
                </div>
              ))}
              {taxes.filter(matchesQuery).length === 0 && (
                <div className="text-sm text-gray-500">No taxes found.</div>
              )}
            </div>
          )}

          {activeTab === 'discounts' && (
            <div className="space-y-3">
              {discounts.filter(matchesQuery).map((d) => (
                <div key={d.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{d.name}</span>
                      <span className="text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-full">{d.value}{d.type === 'percentage' ? '%' : ''} {d.type}</span>
                    </div>
                  </div>
                  <button
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => onSelectDiscount?.(d)}
                  >
                    Add Discount
                  </button>
                </div>
              ))}
              {discounts.filter(matchesQuery).length === 0 && (
                <div className="text-sm text-gray-500">No discounts found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
