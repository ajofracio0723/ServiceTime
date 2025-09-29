import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Pause } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'payment' | 'invoice' | 'job' | 'visit' | 'estimate';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type = 'payment', 
  size = 'md',
  showIcon = true 
}) => {
  const getStatusConfig = () => {
    const baseConfig = {
      colors: '',
      icon: null as React.ReactNode,
      label: status
    };

    switch (type) {
      case 'payment':
        switch (status) {
          case 'completed':
            return {
              colors: 'bg-green-100 text-green-800 border-green-200',
              icon: <CheckCircle className="w-3 h-3" />,
              label: 'Completed'
            };
          case 'pending':
            return {
              colors: 'bg-yellow-100 text-yellow-800 border-yellow-200',
              icon: <Clock className="w-3 h-3" />,
              label: 'Pending'
            };
          case 'failed':
            return {
              colors: 'bg-red-100 text-red-800 border-red-200',
              icon: <XCircle className="w-3 h-3" />,
              label: 'Failed'
            };
          case 'refunded':
            return {
              colors: 'bg-gray-100 text-gray-800 border-gray-200',
              icon: <AlertCircle className="w-3 h-3" />,
              label: 'Refunded'
            };
          default:
            return {
              colors: 'bg-gray-100 text-gray-800 border-gray-200',
              icon: <Clock className="w-3 h-3" />,
              label: status
            };
        }

      case 'invoice':
        switch (status) {
          case 'draft':
            return {
              colors: 'bg-gray-100 text-gray-800 border-gray-200',
              icon: <Clock className="w-3 h-3" />,
              label: 'Draft'
            };
          case 'sent':
            return {
              colors: 'bg-blue-100 text-blue-800 border-blue-200',
              icon: <Clock className="w-3 h-3" />,
              label: 'Sent'
            };
          case 'paid':
            return {
              colors: 'bg-green-100 text-green-800 border-green-200',
              icon: <CheckCircle className="w-3 h-3" />,
              label: 'Paid'
            };
          case 'overdue':
            return {
              colors: 'bg-red-100 text-red-800 border-red-200',
              icon: <AlertCircle className="w-3 h-3" />,
              label: 'Overdue'
            };
          case 'cancelled':
            return {
              colors: 'bg-gray-100 text-gray-800 border-gray-200',
              icon: <XCircle className="w-3 h-3" />,
              label: 'Cancelled'
            };
          default:
            return baseConfig;
        }

      case 'job':
        switch (status) {
          case 'draft':
            return {
              colors: 'bg-gray-100 text-gray-800 border-gray-200',
              icon: <Clock className="w-3 h-3" />,
              label: 'Draft'
            };
          case 'scheduled':
            return {
              colors: 'bg-blue-100 text-blue-800 border-blue-200',
              icon: <Clock className="w-3 h-3" />,
              label: 'Scheduled'
            };
          case 'in-progress':
            return {
              colors: 'bg-yellow-100 text-yellow-800 border-yellow-200',
              icon: <Clock className="w-3 h-3" />,
              label: 'In Progress'
            };
          case 'on-hold':
            return {
              colors: 'bg-orange-100 text-orange-800 border-orange-200',
              icon: <Pause className="w-3 h-3" />,
              label: 'On Hold'
            };
          case 'completed':
            return {
              colors: 'bg-green-100 text-green-800 border-green-200',
              icon: <CheckCircle className="w-3 h-3" />,
              label: 'Completed'
            };
          case 'cancelled':
            return {
              colors: 'bg-red-100 text-red-800 border-red-200',
              icon: <XCircle className="w-3 h-3" />,
              label: 'Cancelled'
            };
          default:
            return baseConfig;
        }

      default:
        return baseConfig;
    }
  };

  const config = getStatusConfig();
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${config.colors} ${sizeClasses[size]}`}>
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};
