import React, { useState } from 'react';
import { Plus, Send, Mail, MessageSquare, Phone, Search, Filter, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

export const Communication = () => {
  const [activeTab, setActiveTab] = useState('messages');
  const [searchTerm, setSearchTerm] = useState('');

  const communications = [
    {
      id: '1',
      type: 'email',
      recipientEmail: 'john.doe@example.com',
      subject: 'Job Confirmation - HVAC Inspection',
      content: 'Your HVAC inspection has been scheduled for tomorrow at 2:00 PM.',
      status: 'delivered',
      sentAt: '2024-01-15T10:30:00Z',
      relatedEntityType: 'job',
      relatedEntityId: 'job-123',
      receipt: {
        deliveredAt: '2024-01-15T10:31:00Z',
        openedAt: '2024-01-15T11:15:00Z'
      }
    },
    {
      id: '2',
      type: 'sms',
      recipientPhone: '+1234567890',
      content: 'Reminder: Your plumbing service is scheduled for today at 3:00 PM.',
      status: 'sent',
      sentAt: '2024-01-15T09:00:00Z',
      relatedEntityType: 'job',
      relatedEntityId: 'job-124'
    },
    {
      id: '3',
      type: 'email',
      recipientEmail: 'jane.smith@example.com',
      subject: 'Invoice #INV-001',
      content: 'Please find your invoice attached for the electrical work completed.',
      status: 'failed',
      sentAt: '2024-01-14T16:45:00Z',
      relatedEntityType: 'invoice',
      relatedEntityId: 'inv-001'
    }
  ];

  const templates = [
    {
      id: '1',
      name: 'Job Confirmation',
      type: 'job_confirmation',
      subject: 'Job Confirmation - {{serviceName}}',
      content: 'Dear {{customerName}}, your {{serviceName}} has been scheduled for {{jobDate}} at {{jobTime}}. Our technician will arrive within the scheduled window.',
      variables: ['customerName', 'serviceName', 'jobDate', 'jobTime'],
      isActive: true
    },
    {
      id: '2',
      name: 'Job Reminder',
      type: 'job_reminder',
      subject: 'Reminder: Service Appointment Tomorrow',
      content: 'This is a reminder that your {{serviceName}} is scheduled for {{jobDate}} at {{jobTime}}.',
      variables: ['customerName', 'serviceName', 'jobDate', 'jobTime'],
      isActive: true
    },
    {
      id: '3',
      name: 'Invoice Notification',
      type: 'invoice',
      subject: 'Invoice #{{invoiceNumber}}',
      content: 'Dear {{customerName}}, please find your invoice #{{invoiceNumber}} for ${{amount}}. Payment is due by {{dueDate}}.',
      variables: ['customerName', 'invoiceNumber', 'amount', 'dueDate'],
      isActive: true
    },
    {
      id: '4',
      name: 'Payment Receipt',
      type: 'payment_receipt',
      subject: 'Payment Received - Thank You!',
      content: 'Thank you {{customerName}}! We have received your payment of ${{amount}} for invoice #{{invoiceNumber}}.',
      variables: ['customerName', 'amount', 'invoiceNumber'],
      isActive: true
    }
  ];

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
    { id: 'messages', label: 'Messages', count: communications.length },
    { id: 'templates', label: 'Templates', count: templates.length }
  ];

  const renderMessages = () => (
    <div className="space-y-4">
      {communications.map((comm) => (
        <div key={comm.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {getTypeIcon(comm.type)}
                <span className="font-medium text-gray-900">
                  {comm.type === 'email' ? comm.recipientEmail : comm.recipientPhone}
                </span>
                {getStatusIcon(comm.status)}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  comm.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  comm.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  comm.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {comm.status}
                </span>
              </div>
              
              {comm.subject && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{comm.subject}</h3>
              )}
              
              <p className="text-gray-600 mb-4">{comm.content}</p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>Sent: {new Date(comm.sentAt).toLocaleString()}</span>
                {comm.receipt?.deliveredAt && (
                  <span>Delivered: {new Date(comm.receipt.deliveredAt).toLocaleString()}</span>
                )}
                {comm.receipt?.openedAt && (
                  <span>Opened: {new Date(comm.receipt.openedAt).toLocaleString()}</span>
                )}
                {comm.relatedEntityType && (
                  <span>Related: {comm.relatedEntityType} #{comm.relatedEntityId}</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-green-600">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-4">
      {templates.map((template) => (
        <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {template.type.replace('_', ' ')}
                </span>
                {template.isActive && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                )}
              </div>
              
              {template.subject && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Subject: </span>
                  <span className="text-sm text-gray-600">{template.subject}</span>
                </div>
              )}
              
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">Content: </span>
                <p className="text-sm text-gray-600 mt-1">{template.content}</p>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>Variables: {template.variables.map(v => `{{${v}}}`).join(', ')}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-green-600">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
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
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
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
    </div>
  );
};
