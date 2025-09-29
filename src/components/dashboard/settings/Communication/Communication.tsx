import { useEffect, useMemo, useState } from 'react';
import { Plus, Mail, MessageSquare, Phone, Search, Filter, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { communicationStorage, templateStorage } from '../../../../utils/communicationStorage';
import { CommunicationService } from '../../../../services/CommunicationService';
import MessagesPanel from './MessagesPanel';
import TemplatesPanel from './TemplatesPanel';
import NewMessageModal from './NewMessageModal';
import TemplateModal from './TemplateModal';
import { Communication as CommunicationType, CommunicationTemplate } from '../../../../types/domains/Communication';

export const Communication = () => {
  type ComposeState = {
    type: 'email' | 'sms';
    recipientEmail: string;
    recipientPhone: string;
    subject: string;
    content: string;
    templateId: string;
  };
  const [activeTab, setActiveTab] = useState('messages');
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<CommunicationType[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [compose, setCompose] = useState<ComposeState>({
    type: 'email',
    recipientEmail: '',
    recipientPhone: '',
    subject: '',
    content: '',
    templateId: ''
  });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CommunicationTemplate | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<CommunicationType | null>(null);
  const [showEditMessage, setShowEditMessage] = useState(false);
  const [editingMessage, setEditingMessage] = useState<CommunicationType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<CommunicationType | null>(null);

  // Seed defaults on first run
  useEffect(() => {
    const existing = communicationStorage.getAll();
    const existingTpl = templateStorage.getAll();
    if (existing.length === 0) {
      const now = new Date().toISOString();
      const seeded = [
        {
          id: 'c-1',
          type: 'email',
          recipientEmail: 'john.doe@example.com',
          subject: 'Job Confirmation - HVAC Inspection',
          content: 'Your HVAC inspection has been scheduled for tomorrow at 2:00 PM.',
          status: 'delivered',
          sentAt: '2024-01-15T10:30:00Z',
          relatedEntityType: 'job',
          relatedEntityId: 'job-123',
          receipt: { deliveredAt: '2024-01-15T10:31:00Z', openedAt: '2024-01-15T11:15:00Z' },
          createdBy: 'system',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'c-2',
          type: 'sms',
          recipientPhone: '+1234567890',
          content: 'Reminder: Your plumbing service is scheduled for today at 3:00 PM.',
          status: 'sent',
          sentAt: '2024-01-15T09:00:00Z',
          relatedEntityType: 'job',
          relatedEntityId: 'job-124',
          createdBy: 'system',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'c-3',
          type: 'email',
          recipientEmail: 'jane.smith@example.com',
          subject: 'Invoice #INV-001',
          content: 'Please find your invoice attached for the electrical work completed.',
          status: 'failed',
          sentAt: '2024-01-14T16:45:00Z',
          relatedEntityType: 'invoice',
          relatedEntityId: 'inv-001',
          createdBy: 'system',
          createdAt: now,
          updatedAt: now
        }
      ];
      communicationStorage.saveAll(seeded as any);
      setMessages(seeded as any);
    } else {
      setMessages(existing as any);
    }
    if (existingTpl.length === 0) {
      const now = new Date().toISOString();
      const seededTpl = [
        {
          id: 't-1',
          name: 'Job Confirmation',
          type: 'job_confirmation',
          subject: 'Job Confirmation - {{serviceName}}',
          content: 'Dear {{customerName}}, your {{serviceName}} has been scheduled for {{jobDate}} at {{jobTime}}. Our technician will arrive within the scheduled window.',
          variables: ['customerName', 'serviceName', 'jobDate', 'jobTime'],
          isActive: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 't-2',
          name: 'Job Reminder',
          type: 'job_reminder',
          subject: 'Reminder: Service Appointment Tomorrow',
          content: 'This is a reminder that your {{serviceName}} is scheduled for {{jobDate}} at {{jobTime}}.',
          variables: ['customerName', 'serviceName', 'jobDate', 'jobTime'],
          isActive: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 't-3',
          name: 'Invoice Notification',
          type: 'invoice',
          subject: 'Invoice #{{invoiceNumber}}',
          content: 'Dear {{customerName}}, please find your invoice #{{invoiceNumber}} for ${{amount}}. Payment is due by {{dueDate}}.',
          variables: ['customerName', 'invoiceNumber', 'amount', 'dueDate'],
          isActive: true,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 't-4',
          name: 'Payment Receipt',
          type: 'payment_receipt',
          subject: 'Payment Received - Thank You!',
          content: 'Thank you {{customerName}}! We have received your payment of ${{amount}} for invoice #{{invoiceNumber}}.',
          variables: ['customerName', 'amount', 'invoiceNumber'],
          isActive: true,
          createdAt: now,
          updatedAt: now
        }
      ];
      templateStorage.saveAll(seededTpl as any);
      setTemplates(seededTpl as any);
    } else {
      setTemplates(existingTpl as any);
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'sent':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'phone':
        return <Phone className="w-4 h-4 text-purple-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'messages', label: 'Messages', count: messages.length },
    { id: 'templates', label: 'Templates', count: templates.length }
  ];

  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) return messages;
    const q = searchTerm.toLowerCase();
    return messages.filter((m) => {
      const rec = (m.recipientEmail || m.recipientPhone || '').toLowerCase();
      const subj = (m.subject || '').toLowerCase();
      const cont = (m.content || '').toLowerCase();
      return rec.includes(q) || subj.includes(q) || cont.includes(q);
    });
  }, [messages, searchTerm]);

  const openCompose = () => {
    setCompose({ type: 'email', recipientEmail: '', recipientPhone: '', subject: '', content: '', templateId: '' });
    setShowNewMessage(true);
  };

  const applyTemplate = (tplId: string) => {
    setCompose((prev: any) => {
      const tpl = templates.find((t) => t.id === tplId);
      if (!tpl) return { ...prev, templateId: '' };
      return {
        ...prev,
        templateId: tplId,
        subject: tpl.subject || prev.subject,
        content: tpl.content || prev.content
      };
    });
  };

  const sendMessage = async () => {
    if (compose.type === 'email' && !compose.recipientEmail) return;
    if (compose.type === 'sms' && !compose.recipientPhone) return;
    const comm = await CommunicationService.send({
      type: compose.type,
      recipientEmail: compose.type === 'email' ? compose.recipientEmail : undefined,
      recipientPhone: compose.type === 'sms' ? compose.recipientPhone : undefined,
      subject: compose.type === 'email' ? compose.subject : undefined,
      content: compose.content,
      templateId: compose.templateId || undefined,
      createdBy: 'me'
    });
    setMessages((prev) => [comm as any, ...prev]);
    setShowNewMessage(false);
    CommunicationService.simulateDeliveryUpdate(comm.id, (updated) => {
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    });
  };

  const startEditTemplate = (tpl: any) => {
    setEditingTemplate(tpl);
    setShowTemplateModal(true);
  };

  const newTemplate = () => {
    const now = new Date().toISOString();
    setEditingTemplate({ id: '', name: '', type: 'custom', subject: '', content: '', variables: [], isActive: true, createdAt: now, updatedAt: now });
    setShowTemplateModal(true);
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;
    const now = new Date().toISOString();
    const toSave = {
      ...editingTemplate,
      id: editingTemplate.id || `t-${Date.now()}`,
      createdAt: editingTemplate.createdAt || now,
      updatedAt: now
    };
    templateStorage.upsert(toSave as any);
    const list = templateStorage.getAll();
    setTemplates(list as any);
    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const deleteTemplate = (id: string) => {
    templateStorage.remove(id);
    setTemplates(templateStorage.getAll() as any);
  };

  const renderMessages = () => (
    <MessagesPanel
      messages={filteredMessages}
      searchTerm={searchTerm}
      onClearSearch={() => setSearchTerm('')}
      onOpenCompose={() => setShowNewMessage(true)}
      onViewDetails={(msg) => { setSelectedMessage(msg); setShowDetails(true); }}
      onEdit={(msg) => { setEditingMessage(msg); setShowEditMessage(true); }}
      onDelete={(msg) => { setDeletingMessage(msg); setShowDeleteConfirm(true); }}
      getStatusIcon={getStatusIcon}
      getTypeIcon={getTypeIcon}
    />
  );

  const renderTemplates = () => (
    <TemplatesPanel
      templates={templates as any}
      onNew={newTemplate}
      onEdit={(tpl) => startEditTemplate(tpl)}
      onDelete={(id) => deleteTemplate(id)}
    />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'messages':
        return renderMessages();
      case 'templates':
        return renderTemplates();
      default:
        return renderMessages();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication</h1>
          <p className="text-gray-600">Outbound email/SMS, templates, and receipts</p>
        </div>
        <button onClick={openCompose} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Message</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search communications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {renderContent()}
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        open={showNewMessage}
        compose={compose}
        templates={templates}
        onChange={(next) => setCompose((prev) => ({ ...prev, ...next }))}
        onApplyTemplate={applyTemplate}
        onClose={() => setShowNewMessage(false)}
        onSend={sendMessage}
      />

      <TemplateModal
        open={showTemplateModal}
        template={editingTemplate}
        onChange={(next) => setEditingTemplate((prev) => (prev ? { ...prev, ...next } : prev))}
        onSave={saveTemplate}
        onClose={() => { setShowTemplateModal(false); setEditingTemplate(null); }}
      />

      {/* Message Details Modal */}
      {showDetails && selectedMessage && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">Message Details</h3>
              <button className="p-2 text-gray-400 hover:text-gray-600" onClick={() => setShowDetails(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-gray-600">{selectedMessage.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <p className="text-gray-600">{selectedMessage.recipientEmail || selectedMessage.recipientPhone}</p>
                </div>
              </div>
              {selectedMessage.subject && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-gray-600">{selectedMessage.subject}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <p className="text-gray-600">{selectedMessage.content}</p>
              </div>
              <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 rounded-lg border mr-2" onClick={() => { setShowDetails(false); setSelectedMessage(null); }}>Close</button>
                <button className="px-4 py-2 rounded-lg border text-red-600 hover:bg-red-50" onClick={() => { setDeletingMessage(selectedMessage); setShowDetails(false); setShowDeleteConfirm(true); }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Message Modal */}
      {showEditMessage && editingMessage && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">Edit Message</h3>
              <button className="p-2 text-gray-400 hover:text-gray-600" onClick={() => { setShowEditMessage(false); setEditingMessage(null); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editingMessage.type}
                    onChange={(e) => setEditingMessage((p: any) => ({ ...p, type: e.target.value as any }))}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
                {editingMessage.type === 'email' ? (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">To (email)</label>
                    <input
                      type="email"
                      value={editingMessage.recipientEmail || ''}
                      onChange={(e) => setEditingMessage((p: any) => ({ ...p, recipientEmail: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">To (phone)</label>
                    <input
                      type="tel"
                      value={editingMessage.recipientPhone || ''}
                      onChange={(e) => setEditingMessage((p: any) => ({ ...p, recipientPhone: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                )}
              </div>
              {editingMessage.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={editingMessage.subject || ''}
                    onChange={(e) => setEditingMessage((p: any) => ({ ...p, subject: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={editingMessage.content || ''}
                  onChange={(e) => setEditingMessage((p: any) => ({ ...p, content: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 h-40"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 rounded-lg border" onClick={() => { setShowEditMessage(false); setEditingMessage(null); }}>Cancel</button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => {
                    const updated = communicationStorage.update(editingMessage.id, {
                      type: editingMessage.type,
                      recipientEmail: editingMessage.type === 'email' ? editingMessage.recipientEmail : undefined,
                      recipientPhone: editingMessage.type === 'sms' ? editingMessage.recipientPhone : undefined,
                      subject: editingMessage.type === 'email' ? editingMessage.subject : undefined,
                      content: editingMessage.content,
                    } as any);
                    if (updated) setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
                    setShowEditMessage(false);
                    setEditingMessage(null);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && deletingMessage && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">Delete Message</h3>
              <button className="p-2 text-gray-400 hover:text-gray-600" onClick={() => { setShowDeleteConfirm(false); setDeletingMessage(null); }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-gray-700">Are you sure you want to delete this message? This action cannot be undone.</p>
              <div className="bg-gray-50 border rounded p-3 text-sm text-gray-700">
                {(deletingMessage.subject ? deletingMessage.subject + ' — ' : '') + (deletingMessage.content || '').slice(0, 120)}
              </div>
              <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 rounded-lg border" onClick={() => { setShowDeleteConfirm(false); setDeletingMessage(null); }}>Cancel</button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    communicationStorage.remove(deletingMessage.id);
                    setMessages((prev) => prev.filter((m) => m.id !== deletingMessage.id));
                    setShowDeleteConfirm(false);
                    setDeletingMessage(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
