import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  id: string;
  type: 'message' | 'reminder' | 'alert' | 'update' | 'payment';
  title: string;
  message: string;
  sender: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'client' | 'job' | 'payment' | 'system' | 'general';
  actionRequired: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  urgentCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: 'New Client Inquiry',
      message: 'John Smith has sent a new service request for HVAC maintenance at 123 Main St.',
      sender: 'John Smith',
      timestamp: '2024-01-20 10:30 AM',
      isRead: false,
      priority: 'high',
      category: 'client',
      actionRequired: true
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Job Reminder',
      message: 'Reminder: HVAC maintenance scheduled for Sarah Johnson tomorrow at 2:00 PM.',
      sender: 'System',
      timestamp: '2024-01-20 09:15 AM',
      isRead: false,
      priority: 'medium',
      category: 'job',
      actionRequired: false
    },
    {
      id: '3',
      type: 'alert',
      title: 'Payment Overdue',
      message: 'Invoice INV-2024-003 for Mike Wilson is now 10 days overdue. Amount: $200.',
      sender: 'System',
      timestamp: '2024-01-20 08:00 AM',
      isRead: true,
      priority: 'urgent',
      category: 'payment',
      actionRequired: true
    },
    {
      id: '4',
      type: 'update',
      title: 'Job Status Updated',
      message: 'Plumbing repair job for Sarah Johnson has been marked as completed.',
      sender: 'David Wilson',
      timestamp: '2024-01-19 05:30 PM',
      isRead: true,
      priority: 'low',
      category: 'job',
      actionRequired: false
    },
    {
      id: '5',
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of $325 received from Sarah Johnson for invoice INV-2024-002.',
      sender: 'System',
      timestamp: '2024-01-19 03:45 PM',
      isRead: true,
      priority: 'medium',
      category: 'payment',
      actionRequired: false
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const addNotification = (newNotification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [{ ...newNotification, id }, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    urgentCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export type { Notification };
