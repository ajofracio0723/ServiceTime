import { useState } from 'react';
import { 
  Bell, 
  Mail, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Clock,
  User,
  Edit,
  Trash2,
  MoreVertical,
  Send,
  Archive,
  Settings
} from 'lucide-react';

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

export const Notification: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'message' | 'reminder' | 'alert' | 'update' | 'payment'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'client' | 'job' | 'payment' | 'system' | 'general'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');

  const mockNotifications: Notification[] = [
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
  ];

  const filteredNotifications = mockNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.sender.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'read' && notification.isRead) ||
                       (filterRead === 'unread' && !notification.isRead);
    return matchesSearch && matchesType && matchesCategory && matchesRead;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'update': return 'bg-green-100 text-green-800';
      case 'payment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message': return <Mail className="w-4 h-4" />;
      case 'reminder': return <Clock className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'update': return <CheckCircle className="w-4 h-4" />;
      case 'payment': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;
  const urgentCount = mockNotifications.filter(n => n.priority === 'urgent' && !n.isRead).length;

  const markAsRead = (id: string) => {
    // In a real app, this would update the backend
    console.log('Marking notification as read:', id);
  };

  const markAllAsRead = () => {
    // In a real app, this would update the backend
    console.log('Marking all notifications as read');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications & Messages</h2>
          <p className="text-gray-600">Stay updated with important alerts and communications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={markAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Notification Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{mockNotifications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-gray-900">{urgentCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'message' | 'reminder' | 'alert' | 'update' | 'payment')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="message">Messages</option>
          <option value="reminder">Reminders</option>
          <option value="alert">Alerts</option>
          <option value="update">Updates</option>
          <option value="payment">Payments</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as 'all' | 'client' | 'job' | 'payment' | 'system' | 'general')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="client">Client</option>
          <option value="job">Job</option>
          <option value="payment">Payment</option>
          <option value="system">System</option>
          <option value="general">General</option>
        </select>
        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value as 'all' | 'read' | 'unread')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
              !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(notification.type)}`}>
                  {getTypeIcon(notification.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                      {notification.priority}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.category)}`}>
                      {notification.category}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {notification.timestamp}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!notification.isRead && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button className="text-blue-600 hover:text-blue-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Archive className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 mb-3">{notification.message}</p>
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span><span className="font-medium">From:</span> {notification.sender}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Details
                  </button>
                  {notification.type === 'message' && (
                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center">
                      <Send className="w-4 h-4 mr-1" />
                      Reply
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {notification.actionRequired && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Action Required
                    </span>
                  )}
                  {notification.priority === 'urgent' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Urgent
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};
