import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calculator, 
  User, 
  MapPin,
  DollarSign,
  Save,
  Send
} from 'lucide-react';
import { Estimate, EstimateItem } from '../../../types/domains/Estimate';
import { Client } from '../../../types/domains/Client';
import { Property } from '../../../types/domains/Property';
import { PriceBookPicker } from './PriceBookPicker';
import type { PickerTab } from './PriceBookPicker';

interface EstimateFormProps {
  isOpen: boolean;
  onClose: () => void;
  estimate?: Estimate;
  onSave: (estimate: Partial<Estimate>) => void;
  clients: Client[];
  properties: Property[];
}

export const EstimateForm: React.FC<EstimateFormProps> = ({
  isOpen,
  onClose,
  estimate,
  onSave,
  clients,
  properties
}) => {
  const [formData, setFormData] = useState<Partial<Estimate>>({
    title: '',
    description: '',
    clientId: '',
    propertyId: '',
    items: [],
    subtotal: 0,
    taxes: [{ name: 'Sales Tax', rate: 8.25, amount: 0 }],
    totalTaxAmount: 0,
    discounts: [],
    totalDiscountAmount: 0,
    total: 0,
    terms: {
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: 'Net 30',
      warrantyPeriod: '1 year',
      additionalTerms: ''
    },
    depositRequirement: {
      isRequired: false,
      percentage: 25
    },
    status: 'draft',
    notes: '',
    internalNotes: '',
    attachments: []
  });

  const [newItem, setNewItem] = useState<Partial<EstimateItem>>({
    type: 'service',
    name: '',
    description: '',
    category: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    discountType: 'percentage',
    taxable: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerInitialTab, setPickerInitialTab] = useState<PickerTab>('services');

  const mapTypeToTab = (t: EstimateItem['type']): PickerTab => {
    if (t === 'service') return 'services';
    if (t === 'part') return 'parts';
    if (t === 'labor') return 'labor';
    return 'services';
  };

  useEffect(() => {
    if (estimate) {
      setFormData(estimate);
    } else {
      const estimateNumber = `EST-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      setFormData(prev => ({ ...prev, estimateNumber }));
    }
  }, [estimate]);

  const calculateTotals = useCallback(() => {
    const items = formData.items || [];
    const discounts = formData.discounts || [];
    const currentTaxes = formData.taxes || [];

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    
    const totalDiscountAmount = discounts.reduce((sum, discount) => {
      return sum + (discount.type === 'percentage' 
        ? (subtotal * discount.value / 100)
        : discount.value);
    }, 0);

    const discountedSubtotal = subtotal - totalDiscountAmount;
    const updatedTaxes = currentTaxes.map(tax => ({
      ...tax,
      amount: discountedSubtotal * (tax.rate / 100)
    }));

    const totalTaxAmount = updatedTaxes.reduce((sum, tax) => sum + tax.amount, 0);
    const total = discountedSubtotal + totalTaxAmount;

    setFormData(prev => {
      // Only update if values have actually changed
      if (prev.subtotal === subtotal && 
          prev.totalDiscountAmount === totalDiscountAmount &&
          prev.totalTaxAmount === totalTaxAmount &&
          prev.total === total) {
        return prev;
      }
      
      return {
        ...prev,
        subtotal,
        taxes: updatedTaxes,
        totalTaxAmount,
        totalDiscountAmount,
        total
      };
    });
  }, [formData.items, formData.discounts, formData.taxes]);

  const handleSelectFromPriceBook = (payload: { type: 'service' | 'part' | 'labor'; data: any }) => {
    if (!payload) return;
    const { type, data } = payload;
    const next: Partial<EstimateItem> = {
      type,
      name: data.name,
      description: data.description,
      category: data.category,
      quantity: 1,
      taxable: true,
      itemId: data.id,
    };
    if (type === 'service') {
      next.unitPrice = data.basePrice ?? 0;
    } else if (type === 'part') {
      const price = (data.cost ?? 0) * (1 + (data.markup ?? 0) / 100);
      next.unitPrice = Number(price.toFixed(2));
    } else if (type === 'labor') {
      next.unitPrice = data.hourlyRate ?? 0;
    }
    setNewItem(prev => ({ ...prev, ...next }));
    setIsPickerOpen(false);
  };

  const handleSelectTax = (tax: { name: string; rate: number }) => {
    setFormData(prev => {
      const existing = (prev.taxes || []).some(t => t.name === tax.name && t.rate === tax.rate);
      if (existing) {
        return prev; // Don't add duplicate taxes
      }
      const taxes = [...(prev.taxes || []), { name: tax.name, rate: tax.rate, amount: 0 }];
      return { ...prev, taxes };
    });
    setIsPickerOpen(false);
  };

  const handleSelectDiscount = (discount: { type: 'percentage' | 'fixed'; value: number }) => {
    setFormData(prev => {
      const exists = (prev.discounts || []).some(d => d.type === discount.type && d.value === discount.value);
      if (exists) {
        return prev; // Don't add duplicate discounts
      }
      const discounts = [...(prev.discounts || []), { type: discount.type, value: discount.value }];
      return { ...prev, discounts };
    });
    setIsPickerOpen(false);
  };

  // Recalculate totals when items, taxes, or discounts change
  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const addItem = () => {
    // Debug: ensure this handler is firing when clicking the button
    try { console.debug('[EstimateForm] addItem clicked', newItem); } catch {}
    if (!newItem.name || !newItem.unitPrice || !newItem.quantity) {
      setErrors({ newItem: 'Please fill in all required fields' });
      return;
    }

    const itemTotal = (newItem.quantity || 0) * (newItem.unitPrice || 0);
    const discountAmount = newItem.discount && newItem.discount > 0 
      ? (newItem.discountType === 'percentage' 
          ? itemTotal * (newItem.discount / 100)
          : newItem.discount)
      : 0;

    const item: EstimateItem = {
      id: `item-${Date.now()}`,
      type: newItem.type || 'service',
      name: newItem.name || '',
      description: newItem.description,
      category: newItem.category,
      quantity: newItem.quantity || 1,
      unitPrice: newItem.unitPrice || 0,
      discount: newItem.discount,
      discountType: newItem.discountType,
      taxable: newItem.taxable ?? true,
      total: itemTotal - discountAmount
    };

    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), item]
    }));

    setNewItem({
      type: 'service',
      name: '',
      description: '',
      category: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      discountType: 'percentage',
      taxable: true
    });
    setErrors({});
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId) || []
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.clientId) newErrors.clientId = 'Client is required';
    if (!formData.propertyId) newErrors.propertyId = 'Property is required';
    if (!formData.items || formData.items.length === 0) newErrors.items = 'At least one item is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (status: 'draft' | 'sent' = 'draft') => {
    if (!validateForm()) return;
    const estimateData = {
      ...formData,
      status,
      sentAt: status === 'sent' ? new Date().toISOString() : formData.sentAt,
      updatedAt: new Date().toISOString(),
      createdAt: formData.createdAt || new Date().toISOString()
    };
    onSave(estimateData);
    onClose();
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);
  const selectedProperty = properties.find(p => p.id === formData.propertyId);
  const clientProperties = properties.filter(p => p.clientId === formData.clientId);

  // Auto-select the first property of the selected client if none is selected yet
  useEffect(() => {
    if (formData.clientId && !formData.propertyId) {
      const firstForClient = properties.find(p => p.clientId === formData.clientId);
      if (firstForClient) {
        setFormData(prev => ({ ...prev, propertyId: firstForClient.id }));
      }
    }
  }, [formData.clientId, formData.propertyId, properties]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {estimate ? 'Edit Estimate' : 'Create New Estimate'}
            </h2>
            <p className="text-sm text-gray-600">
              {formData.estimateNumber || 'New estimate will be assigned a number'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimate Title *
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter estimate title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until
              </label>
              <input
                type="date"
                value={formData.terms?.validUntil || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  terms: { ...prev.terms!, validUntil: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Client and Property Selection */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                value={formData.clientId || ''}
                onChange={(e) => {
                  const newClientId = e.target.value;
                  const firstProperty = properties.find(p => p.clientId === newClientId);
                  setFormData(prev => ({
                    ...prev,
                    clientId: newClientId,
                    propertyId: firstProperty?.id || ''
                  }));
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.clientId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.type === 'company' ? client.companyName : `${client.firstName} ${client.lastName}`}
                  </option>
                ))}
              </select>
              {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId}</p>}
              {selectedClient && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-1" />
                    {selectedClient.email} • {selectedClient.phone}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property *
              </label>
              <select
                value={formData.propertyId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.propertyId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!formData.clientId}
              >
                <option value="">Select a property</option>
                {clientProperties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {errors.propertyId && <p className="text-red-500 text-xs mt-1">{errors.propertyId}</p>}
              {selectedProperty && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedProperty.address?.street || ''}, {selectedProperty.address?.city || ''}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the work to be performed..."
            />
          </div>

          {/* Add New Item Section */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add Estimate Item
            </h3>
            
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newItem.type || 'service'}
                  onChange={(e) => setNewItem(prev => ({ ...prev, type: e.target.value as EstimateItem['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="service">Service</option>
                  <option value="part">Part</option>
                  <option value="labor">Labor</option>
                  <option value="material">Material</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newItem.quantity || 1}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.unitPrice || 0}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newItem.taxable ?? true}
                  onChange={(e) => setNewItem(prev => ({ ...prev, taxable: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Taxable</span>
              </label>

              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setPickerInitialTab(mapTypeToTab(newItem.type || 'service')); setIsPickerOpen(true); }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Browse Price Book
              </button>
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => { setPickerInitialTab('taxes'); setIsPickerOpen(true); }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title="Add tax from Price Book"
                >
                  Add Tax
                </button>
                <button
                  type="button"
                  onClick={() => { setPickerInitialTab('discounts'); setIsPickerOpen(true); }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title="Add discount from Price Book"
                >
                  Add Discount
                </button>
              </div>
            </div>

            {errors.newItem && <p className="text-red-500 text-sm mt-2">{errors.newItem}</p>}
          </div>

          {/* Estimate Items List */}
          {formData.items && formData.items.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Estimate Items</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {formData.items.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {item.type}
                          </span>
                          {item.category && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>Unit Price: ${item.unitPrice.toFixed(2)}</span>
                          <span className="font-medium">Total: ${item.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}

          {/* Totals Summary */}
          {formData.items && formData.items.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Estimate Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${formData.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {formData.totalDiscountAmount && formData.totalDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Total Discounts:</span>
                    <span>-${formData.totalDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                {formData.taxes?.map((tax, index) => (
                  <div key={index} className="flex justify-between text-sm text-gray-600">
                    <span>{tax.name} ({tax.rate}%):</span>
                    <span>${tax.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>${formData.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSave('draft')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => handleSave('sent')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Save & Send</span>
            </button>
          </div>
        </div>
      </div>
      {/* PriceBook Picker Modal */}
      <PriceBookPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        initialTab={pickerInitialTab}
        onSelectItem={handleSelectFromPriceBook}
        onSelectTax={handleSelectTax}
        onSelectDiscount={handleSelectDiscount}
      />
    </div>
  );
};
