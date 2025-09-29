import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, Trash2, Calendar, DollarSign, Save } from 'lucide-react';
import type { Invoice, InvoiceItem, InvoiceStatus } from '../../../utils/invoiceStorage';

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: Invoice) => void;
  editingInvoice?: Invoice | null;
}

interface FormState {
  clientName: string;
  propertyAddress: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  description: string;
  items: InvoiceItem[];
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ isOpen, onClose, onSubmit, editingInvoice }) => {
  const [form, setForm] = useState<FormState>({
    clientName: '',
    propertyAddress: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0,10); })(),
    status: 'draft',
    description: '',
    items: [ { description: '', quantity: 1, unitPrice: 0, total: 0 } ],
  });
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (editingInvoice) {
      setForm({
        clientName: editingInvoice.clientName,
        propertyAddress: editingInvoice.propertyAddress,
        issueDate: editingInvoice.issueDate,
        dueDate: editingInvoice.dueDate,
        status: editingInvoice.status,
        description: editingInvoice.description,
        items: editingInvoice.items.map(i => ({...i})),
      });
    } else if (isOpen) {
      setForm({
        clientName: '',
        propertyAddress: '',
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().slice(0,10); })(),
        status: 'draft',
        description: '',
        items: [ { description: '', quantity: 1, unitPrice: 0, total: 0 } ],
      });
    }
    setShowErrors(false);
  }, [editingInvoice, isOpen]);

  const totalAmount = useMemo(() => form.items.reduce((s, i) => s + (i.total || (i.quantity * i.unitPrice)), 0), [form.items]);

  const validate = () => {
    const errors: string[] = [];
    if (!form.clientName.trim()) errors.push('clientName');
    if (!form.propertyAddress.trim()) errors.push('propertyAddress');
    if (!form.issueDate) errors.push('issueDate');
    if (!form.dueDate) errors.push('dueDate');
    if (!form.items.length || !form.items.every(i => i.description.trim() && i.quantity > 0)) errors.push('items');
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setShowErrors(true);
    if (errors.length) return;

    const now = new Date().toISOString();
    const id = editingInvoice?.id || `inv_${Date.now()}`;
    const invoiceNumber = editingInvoice?.invoiceNumber || `INV-${new Date().getFullYear()}-${Date.now()}`;
    const items = form.items.map(i => ({
      ...i,
      total: i.total || (i.quantity * i.unitPrice),
    }));
    const total = items.reduce((s, i) => s + i.total, 0);

    const invoice: Invoice = {
      id,
      invoiceNumber,
      clientName: form.clientName,
      propertyAddress: form.propertyAddress,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      status: form.status,
      totalAmount: total,
      paidAmount: editingInvoice?.paidAmount || 0,
      balance: total - (editingInvoice?.paidAmount || 0),
      description: form.description,
      items,
      jobId: editingInvoice?.jobId,
      jobNumber: editingInvoice?.jobNumber,
      estimateId: editingInvoice?.estimateId,
      createdAt: editingInvoice?.createdAt || now,
      updatedAt: now,
    };

    onSubmit(invoice);
    onClose();
  };

  if (!isOpen) return null;

  const updateItem = (index: number, patch: Partial<InvoiceItem>) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === index ? { ...it, ...patch } : it)
    }));
  };

  const addItem = () => setForm(prev => ({...prev, items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]}));
  const removeItem = (index: number) => setForm(prev => ({...prev, items: prev.items.filter((_, i) => i !== index)}));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Client Name *</label>
              <input value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} className={`w-full px-3 py-2 border rounded ${showErrors && !form.clientName.trim() ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Property Address *</label>
              <input value={form.propertyAddress} onChange={e => setForm({...form, propertyAddress: e.target.value})} className={`w-full px-3 py-2 border rounded ${showErrors && !form.propertyAddress.trim() ? 'border-red-500' : 'border-gray-300'}`} />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Issue Date *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="date" value={form.issueDate} onChange={e => setForm({...form, issueDate: e.target.value})} className={`w-full pl-9 pr-3 py-2 border rounded ${showErrors && !form.issueDate ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className={`w-full pl-9 pr-3 py-2 border rounded ${showErrors && !form.dueDate ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status *</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as InvoiceStatus})} className="w-full px-3 py-2 border rounded border-gray-300">
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded border-gray-300" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Items *</label>
              <button type="button" onClick={addItem} className="text-blue-600 hover:text-blue-800 flex items-center text-sm"><Plus className="w-4 h-4 mr-1" /> Add Item</button>
            </div>
            <div className="space-y-2">
              {form.items.map((it, idx) => (
                <div key={idx} className="grid md:grid-cols-12 gap-2 items-end border rounded p-3">
                  <div className="md:col-span-6">
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <input value={it.description} onChange={e => updateItem(idx, { description: e.target.value })} className={`w-full px-3 py-2 border rounded ${showErrors && !it.description.trim() ? 'border-red-500' : 'border-gray-300'}`} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1">Qty</label>
                    <input type="number" min={0} value={it.quantity} onChange={e => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded border-gray-300" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1">Unit Price</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="number" min={0} step={0.01} value={it.unitPrice} onChange={e => updateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })} className="w-full pl-9 pr-3 py-2 border rounded border-gray-300" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1">Total</label>
                    <input type="number" min={0} step={0.01} value={it.total || (it.quantity * it.unitPrice)} onChange={e => updateItem(idx, { total: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded border-gray-300" />
                  </div>
                  <div className="md:col-span-12 flex justify-end">
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-600 hover:text-red-800 text-sm flex items-center"><Trash2 className="w-4 h-4 mr-1" /> Remove</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {showErrors && (!form.items.length || !form.items.every(i => i.description.trim() && i.quantity > 0)) && (
              <p className="text-red-600 text-xs mt-1">Please add at least one valid item (description and quantity required).</p>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <div className="text-gray-700">Grand Total: <span className="font-semibold">${totalAmount.toLocaleString()}</span></div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"><Save className="w-4 h-4 mr-1" /> Save Invoice</button>
          </div>
        </form>
      </div>
    </div>
  );
};
