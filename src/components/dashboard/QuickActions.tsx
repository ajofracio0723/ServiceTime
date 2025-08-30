import React from 'react';
import { Plus, Calendar, Users, FileText, Phone, Settings } from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      id: 'new-job',
      label: 'New Job',
      icon: Plus,
      description: 'Schedule a new service appointment',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'schedule',
      label: 'View Schedule',
      icon: Calendar,
      description: 'Check today\'s appointments',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      id: 'add-customer',
      label: 'Add Customer',
      icon: Users,
      description: 'Add a new customer to your database',
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      id: 'create-invoice',
      label: 'Create Invoice',
      icon: FileText,
      description: 'Generate an invoice for completed work',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      id: 'emergency',
      label: 'Emergency Job',
      icon: Phone,
      description: 'Schedule urgent service call',
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      id: 'settings',
      label: 'Business Settings',
      icon: Settings,
      description: 'Configure your business preferences',
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          
          return (
            <button
              key={action.id}
              className={`p-4 rounded-lg text-white text-left transition-all transform hover:scale-105 ${action.color}`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{action.label}</span>
              </div>
              <p className="text-sm opacity-90">{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};