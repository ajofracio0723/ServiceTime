import { X } from 'lucide-react';
import { CommunicationTemplate } from '../../../../types/domains/Communication';

type Props = {
  open: boolean;
  template: CommunicationTemplate | null;
  onChange: (next: Partial<CommunicationTemplate>) => void;
  onSave: () => void;
  onClose: () => void;
};

export default function TemplateModal({ open, template, onChange, onSave, onClose }: Props) {
  if (!open || !template) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">{template.id ? 'Edit Template' : 'New Template'}</h3>
          <button className="p-2 text-gray-400 hover:text-gray-600" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={template.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Template name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={template.type}
                onChange={(e) => onChange({ type: e.target.value as CommunicationTemplate['type'] })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="job_confirmation">Job Confirmation</option>
                <option value="job_reminder">Job Reminder</option>
                <option value="invoice">Invoice</option>
                <option value="payment_receipt">Payment Receipt</option>
                <option value="estimate">Estimate</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject (Email only)</label>
            <input
              type="text"
              value={template.subject || ''}
              onChange={(e) => onChange({ subject: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Subject with variables like {{invoiceNumber}}"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={template.content}
              onChange={(e) => onChange({ content: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 h-40"
              placeholder="Content. Use variables like {{customerName}}, {{jobDate}}, {{amount}}"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variables (comma separated)</label>
              <input
                type="text"
                value={(template.variables || []).join(', ')}
                onChange={(e) => onChange({ variables: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="customerName, jobDate"
              />
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <input
                id="tpl-active"
                type="checkbox"
                checked={!!template.isActive}
                onChange={(e) => onChange({ isActive: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="tpl-active" className="text-sm text-gray-700">Active</label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button className="px-4 py-2 rounded-lg border" onClick={onClose}>Cancel</button>
            <button onClick={onSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
