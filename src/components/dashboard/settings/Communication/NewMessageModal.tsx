import { Send, X } from 'lucide-react';
import { CommunicationTemplate } from '../../../../types/domains/Communication';

type ComposeState = {
  type: 'email' | 'sms';
  recipientEmail: string;
  recipientPhone: string;
  subject: string;
  content: string;
  templateId: string;
};

type Props = {
  open: boolean;
  compose: ComposeState;
  templates: CommunicationTemplate[];
  onChange: (next: Partial<ComposeState>) => void;
  onApplyTemplate: (templateId: string) => void;
  onClose: () => void;
  onSend: () => void;
};

export default function NewMessageModal({ open, compose, templates, onChange, onApplyTemplate, onClose, onSend }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold">Compose Message</h3>
          <button className="p-2 text-gray-400 hover:text-gray-600" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={compose.type}
                onChange={(e) => onChange({ type: e.target.value as 'email' | 'sms' })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <select
                value={compose.templateId}
                onChange={(e) => { onChange({ templateId: e.target.value }); onApplyTemplate(e.target.value); }}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">None</option>
                {templates.filter((t) => t.isActive).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {compose.type === 'email' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To (email)</label>
                <input
                  type="email"
                  value={compose.recipientEmail}
                  onChange={(e) => onChange({ recipientEmail: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={compose.subject}
                  onChange={(e) => onChange({ subject: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Subject"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To (phone)</label>
              <input
                type="tel"
                value={compose.recipientPhone}
                onChange={(e) => onChange({ recipientPhone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="+15551234567"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={compose.content}
              onChange={(e) => onChange({ content: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 h-40"
              placeholder="Write your message..."
            />
            <p className="text-xs text-gray-500 mt-1">You can use variables like {'{{customerName}}'}, {'{{jobDate}}'} when a template is selected.</p>
          </div>

          <div className="flex justify-end space-x-2">
            <button className="px-4 py-2 rounded-lg border" onClick={onClose}>Cancel</button>
            <button onClick={onSend} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
