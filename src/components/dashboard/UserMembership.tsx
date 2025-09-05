import { useState } from 'react';
import { 
  UserPlus, 
  Users, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Crown, 
  Shield, 
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Settings,
  Key,
  Calculator
} from 'lucide-react';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'owner' | 'admin' | 'manager' | 'technician' | 'dispatcher' | 'accountant';
  avatar: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
  permissions: string[];
}

interface Membership {
  id: string;
  name: string;
  type: 'basic' | 'professional' | 'enterprise' | 'custom';
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  limits: {
    maxUsers: number;
    maxJobs: number;
    maxClients: number;
    storageGB: number;
  };
  isActive: boolean;
}

export const UserMembership: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'memberships' | 'permissions'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  const users: UserProfile[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@servicetime.com',
      phone: '(555) 123-4567',
      role: 'owner',
      avatar: '/avatars/john.jpg',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: '2024-01-15T10:30:00Z',
      permissions: ['all']
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@servicetime.com',
      phone: '(555) 234-5678',
      role: 'admin',
      avatar: '/avatars/sarah.jpg',
      status: 'active',
      createdAt: '2024-01-05T00:00:00Z',
      lastLogin: '2024-01-15T09:15:00Z',
      permissions: ['manage_users', 'manage_jobs', 'view_reports', 'manage_clients']
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Davis',
      email: 'mike.davis@servicetime.com',
      phone: '(555) 345-6789',
      role: 'technician',
      avatar: '/avatars/mike.jpg',
      status: 'active',
      createdAt: '2024-01-10T00:00:00Z',
      lastLogin: '2024-01-15T07:45:00Z',
      permissions: ['view_jobs', 'update_jobs', 'upload_photos']
    },
    {
      id: '4',
      firstName: 'Lisa',
      lastName: 'Wilson',
      email: 'lisa.wilson@servicetime.com',
      phone: '(555) 456-7890',
      role: 'dispatcher',
      avatar: '/avatars/lisa.jpg',
      status: 'inactive',
      createdAt: '2024-01-12T00:00:00Z',
      lastLogin: '2024-01-13T16:20:00Z',
      permissions: ['view_jobs', 'schedule_jobs', 'manage_visits']
    },
    {
      id: '5',
      firstName: 'Robert',
      lastName: 'Martinez',
      email: 'robert.martinez@servicetime.com',
      phone: '(555) 567-8901',
      role: 'accountant',
      avatar: '/avatars/robert.jpg',
      status: 'active',
      createdAt: '2024-01-08T00:00:00Z',
      lastLogin: '2024-01-15T08:30:00Z',
      permissions: ['view_reports', 'manage_pricing', 'manage_invoices', 'manage_payments', 'view_financial']
    }
  ];

  // Current company membership (owned by the business owner)
  const companyMembership: Membership = {
    id: '1',
    name: 'Professional Plan',
    type: 'professional',
    price: 49,
    billingPeriod: 'monthly',
    features: ['Up to 10 users', 'Advanced reporting', 'Inventory management', 'Priority support', 'Mobile app'],
    limits: {
      maxUsers: 10,
      maxJobs: 500,
      maxClients: 2000,
      storageGB: 50
    },
    isActive: true
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'manager':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'technician':
        return <Settings className="w-4 h-4 text-green-500" />;
      case 'dispatcher':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'accountant':
        return <Calculator className="w-4 h-4 text-orange-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'suspended':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderUsers = () => (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  {getRoleIcon(user.role)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'owner' ? 'bg-yellow-100 text-yellow-800' :
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'technician' ? 'bg-green-100 text-green-800' :
                    user.role === 'accountant' ? 'bg-orange-100 text-orange-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {user.role}
                  </span>
                  {getStatusIcon(user.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' :
                    user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Key className="w-4 h-4" />
                    <span>Permissions: {user.permissions.length}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                  <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                  <span>Last Login: {new Date(user.lastLogin).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMemberships = () => (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Current Company Membership</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                companyMembership.type === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                companyMembership.type === 'professional' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {companyMembership.name}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center space-x-4 mb-3">
                <span className="text-2xl font-bold text-gray-900">
                  ${companyMembership.price}/{companyMembership.billingPeriod}
                </span>
                <span className="text-sm text-gray-600">
                  Next billing: February 15, 2024
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                This membership covers all users in your organization. Users are assigned roles without individual memberships.
              </p>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Included Features:</h4>
              <div className="flex flex-wrap gap-2">
                {companyMembership.features.map((feature, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-700">Users</div>
                <div className="text-lg font-bold text-blue-600">
                  {users.length}/{companyMembership.limits.maxUsers === -1 ? '∞' : companyMembership.limits.maxUsers}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-700">Jobs</div>
                <div className="text-lg font-bold text-green-600">
                  {companyMembership.limits.maxJobs === -1 ? 'Unlimited' : companyMembership.limits.maxJobs}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-700">Clients</div>
                <div className="text-lg font-bold text-purple-600">
                  {companyMembership.limits.maxClients === -1 ? 'Unlimited' : companyMembership.limits.maxClients}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-gray-700">Storage</div>
                <div className="text-lg font-bold text-orange-600">{companyMembership.limits.storageGB}GB</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
              Upgrade Plan
            </button>
            <button className="text-gray-400 hover:text-gray-600 text-sm">
              Billing History
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const permissions = [
    { id: 'all', name: 'Full Access', description: 'Complete system access', category: 'System' },
    { id: 'manage_users', name: 'Manage Users', description: 'Create, edit, and delete users', category: 'User Management' },
    { id: 'manage_jobs', name: 'Manage Jobs', description: 'Create, edit, and delete jobs', category: 'Job Management' },
    { id: 'view_jobs', name: 'View Jobs', description: 'View job details and status', category: 'Job Management' },
    { id: 'update_jobs', name: 'Update Jobs', description: 'Update job status and details', category: 'Job Management' },
    { id: 'schedule_jobs', name: 'Schedule Jobs', description: 'Create and manage job schedules', category: 'Scheduling' },
    { id: 'manage_visits', name: 'Manage Visits', description: 'Schedule and manage visits', category: 'Scheduling' },
    { id: 'manage_clients', name: 'Manage Clients', description: 'Create, edit, and delete clients', category: 'Client Management' },
    { id: 'view_reports', name: 'View Reports', description: 'Access reporting and analytics', category: 'Reporting' },
    { id: 'manage_pricing', name: 'Manage Pricing', description: 'Edit price books and rates', category: 'Financial' },
    { id: 'manage_invoices', name: 'Manage Invoices', description: 'Create, edit, and manage invoices', category: 'Financial' },
    { id: 'manage_payments', name: 'Manage Payments', description: 'Process and track payments', category: 'Financial' },
    { id: 'view_financial', name: 'View Financial Reports', description: 'Access financial reports and analytics', category: 'Financial' },
    { id: 'upload_photos', name: 'Upload Photos', description: 'Upload and manage job photos', category: 'Files' }
  ];

  const renderPermissions = () => (
    <div className="space-y-6">
      {Object.entries(
        permissions.reduce((acc, permission) => {
          if (!acc[permission.category]) {
            acc[permission.category] = [];
          }
          acc[permission.category].push(permission);
          return acc;
        }, {} as Record<string, typeof permissions>)
      ).map(([category, perms]) => (
        <div key={category} className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
          <div className="space-y-3">
            {perms.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{permission.name}</h4>
                  <p className="text-sm text-gray-600">{permission.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">{permission.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'users', label: 'Users', count: users.length },
    { id: 'memberships', label: 'Company Plan', count: 1 },
    { id: 'permissions', label: 'Permissions', count: permissions.length }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return renderUsers();
      case 'memberships':
        return renderMemberships();
      case 'permissions':
        return renderPermissions();
      default:
        return renderUsers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User & Role Management</h2>
          <p className="text-gray-600">Add users to your team and assign roles based on your company membership</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users..."
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
              onClick={() => setActiveTab(tab.id as 'users' | 'memberships' | 'permissions')}
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