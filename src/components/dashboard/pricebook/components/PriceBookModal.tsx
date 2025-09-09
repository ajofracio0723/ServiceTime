import React, { useEffect, useState } from 'react';
import type { PriceBookKind } from '../../../../utils/pricebookStorage';
import {
  serviceCategories,
  partCategories,
  discountCategories,
  serviceTemplates,
  partTemplates,
  discountTemplates,
  type TemplateItem,
} from '../templates';

export type ModalMode = 'add' | 'edit';

interface PriceBookModalProps {
  isOpen: boolean;
  mode: ModalMode;
  kind: PriceBookKind;
  initialForm: Record<string, any>;
  onCancel: () => void;
  onSubmit: (form: Record<string, any>) => void;
}

export const PriceBookModal: React.FC<PriceBookModalProps> = ({
  isOpen,
  mode,
  kind,
  initialForm,
  onCancel,
  onSubmit,
}) => {
  const [form, setForm] = useState<Record<string, any>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    setForm(initialForm || {});
    setSelectedTemplate('');
  }, [initialForm, isOpen]);

  if (!isOpen) return null;

  const title = `${mode === 'add' ? 'Add' : 'Edit'} ${kind
    .charAt(0)
    .toUpperCase()}${kind.slice(1).replace('labor', 'Labor Rate')}`;

  const getCategories = () => {
    if (kind === 'services') return serviceCategories;
    if (kind === 'parts') return partCategories;
    if (kind === 'discounts') return discountCategories;
    return [] as string[];
  };

  const getTemplates = (): TemplateItem[] => {
    if (kind === 'services') return serviceTemplates;
    if (kind === 'parts') return partTemplates;
    if (kind === 'discounts') return discountTemplates;
    return [];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button className="text-gray-400 hover:text-gray-600" onClick={onCancel} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Templates (only for applicable kinds) */}
          {['services', 'parts', 'discounts'].includes(kind) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Templates</label>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedTemplate(val);
                  const tmpl = getTemplates().find((t) => t.label === val);
                  if (tmpl) {
                    setForm({ ...form, ...tmpl.values });
                  }
                }}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">-- Choose a template (optional) --</option>
                {getTemplates().map((t) => (
                  <option key={t.label} value={t.label}>{t.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Common fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              value={form.name || ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          {kind !== 'labor' && kind !== 'taxes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              {['services', 'parts', 'discounts'].includes(kind) ? (
                <select
                  value={form.category || ''}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">-- Select category --</option>
                  {getCategories().map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.category || ''}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              )}
            </div>
          )}
          {kind !== 'taxes' && kind !== 'labor' && kind !== 'discounts' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          )}

          {/* Kind-specific fields */}
          {kind === 'services' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Base Price</label>
                <input
                  type="number"
                  value={form.basePrice ?? ''}
                  onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <input
                  value={form.unit || ''}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}

          {kind === 'parts' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input
                  value={form.sku || ''}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost</label>
                <input
                  type="number"
                  value={form.cost ?? ''}
                  onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Markup %</label>
                <input
                  type="number"
                  value={form.markup ?? ''}
                  onChange={(e) => setForm({ ...form, markup: Number(e.target.value) })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <input
                  value={form.unit || ''}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}

          {kind === 'labor' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                <input
                  type="number"
                  value={form.hourlyRate ?? ''}
                  onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Skill Level</label>
                <select
                  value={form.skillLevel || 'journeyman'}
                  onChange={(e) => setForm({ ...form, skillLevel: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="apprentice">Apprentice</option>
                  <option value="journeyman">Journeyman</option>
                  <option value="master">Master</option>
                </select>
              </div>
            </div>
          )}

          {kind === 'taxes' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rate</label>
                <input
                  type="number"
                  value={form.rate ?? ''}
                  onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={form.type || 'percentage'}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>
          )}

          {kind === 'discounts' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={form.type || 'percentage'}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Value</label>
                <input
                  type="number"
                  value={form.value ?? ''}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onSubmit(form)}
          >
            {mode === 'add' ? 'Create' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
