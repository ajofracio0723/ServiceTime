import { useEffect, useMemo, useState } from 'react';
import { 
  UserPlus, 
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
  Calculator,
  Clock,
  Tags,
  Truck,
  Plus
} from 'lucide-react';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'owner' | 'admin' | 'technician' | 'dispatcher' | 'accountant';
  avatar: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
  permissions: string[]; // legacy, kept for compatibility
  permissionsMap?: Record<string, { view: boolean; add: boolean; edit: boolean; delete: boolean }>; // new
  // new optional fields
  availability?: {
    days: string[]; // ['Mon','Tue',...]
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
  };
  skills?: string[];
  assignedVehicles?: VehicleAssignment[];
}

type VehicleAssignment = {
  plate: string;
  type: 'Truck' | 'Van' | 'Car' | 'Bike' | 'Other';
  makeModel?: string;
  notes?: string;
};

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
  const [activeTab, setActiveTab] = useState<'users'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  // localStorage keys
  const LS = {
    users: 'settings.users',
    activeTab: 'settings.userMembership.activeTab',
    billingPlan: 'onboarding.selectedPlan',
  } as const;

  const defaultUsers: UserProfile[] = [
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

  const [users, setUsers] = useState<UserProfile[]>(defaultUsers);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [editSkillInput, setEditSkillInput] = useState('');
  // Vehicles state helpers for inputs
  const vehicleTypes: VehicleAssignment['type'][] = ['Truck','Van','Car','Bike','Other'];
  const modules = [
    'clients','properties','pricebook','estimates','jobs','visits','invoices','payments','files',
    'account_settings','user_settings','communication'
  ] as const;

  type ModuleKey = typeof modules[number];
  type PermSet = { view: boolean; add: boolean; edit: boolean; delete: boolean };

  const defaultPermsForRole = (role: UserProfile['role']): Record<ModuleKey, PermSet> => {
    const off: PermSet = { view: false, add: false, edit: false, delete: false };
    const base = {} as Record<ModuleKey, PermSet>;
    (modules as readonly ModuleKey[]).forEach((m: ModuleKey) => { base[m] = { ...off }; });
    if (role === 'owner' || role === 'admin') {
      (modules as readonly ModuleKey[]).forEach((m: ModuleKey) => { base[m] = { view: true, add: true, edit: true, delete: true }; });
      return base;
    }
    if (role === 'dispatcher') {
      base.clients = { view: true, add: true, edit: true, delete: false };
      base.jobs = { view: true, add: true, edit: true, delete: false };
      base.visits = { view: true, add: true, edit: true, delete: false };
      base.estimates = { view: true, add: false, edit: false, delete: false };
      base.properties = { view: true, add: false, edit: false, delete: false };
      base.account_settings = { view: true, add: false, edit: false, delete: false };
      base.user_settings = { view: true, add: true, edit: true, delete: false };
      base.communication = { view: true, add: true, edit: true, delete: false };
      return base;
    }
    if (role === 'accountant') {
      base.invoices = { view: true, add: true, edit: true, delete: false };
      base.payments = { view: true, add: true, edit: true, delete: false };
      base.clients = { view: true, add: false, edit: true, delete: false };
      base.account_settings = { view: true, add: false, edit: false, delete: false };
      base.user_settings = { view: true, add: false, edit: true, delete: false };
      base.communication = { view: true, add: false, edit: true, delete: false };
      return base;
    }
    // technician
    base.jobs = { view: true, add: false, edit: true, delete: false };
    base.visits = { view: true, add: true, edit: true, delete: false };
    base.files = { view: true, add: true, edit: false, delete: false };
    base.properties = { view: true, add: false, edit: false, delete: false };
    base.estimates = { view: true, add: false, edit: false, delete: false };
    base.account_settings = { view: false, add: false, edit: false, delete: false };
    base.user_settings = { view: true, add: false, edit: false, delete: false };
    base.communication = { view: true, add: false, edit: false, delete: false };
    return base;
  };

  const emptyNewUser: UserProfile = {
    id: '', firstName: '', lastName: '', email: '', phone: '', role: 'technician',
    avatar: '', status: 'active', createdAt: new Date().toISOString(), lastLogin: '', permissions: [],
    permissionsMap: defaultPermsForRole('technician'),
    availability: { days: ['Mon','Tue','Wed','Thu','Fri'], startTime: '09:00', endTime: '17:00' },
    skills: [],
    assignedVehicles: []
  };
  const [newUser, setNewUser] = useState<UserProfile>(emptyNewUser);

  const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Normalize legacy assignedVehicles string[] -> VehicleAssignment[]
  const normalizeVehicles = (val: unknown): VehicleAssignment[] => {
    if (!val) return [];
    if (Array.isArray(val)) {
      return val.map((item) => {
        if (typeof item === 'string') {
          return { plate: '', type: 'Other', makeModel: item } as VehicleAssignment;
        }
        const obj = item as Partial<VehicleAssignment>;
        return {
          plate: obj.plate || '',
          type: (obj.type as VehicleAssignment['type']) || 'Other',
          makeModel: obj.makeModel || '',
          notes: obj.notes || ''
        };
      });
    }
    return [];
  };

  // Load users and active tab from localStorage on mount
  useEffect(() => {
    try {
      const tab = localStorage.getItem(LS.activeTab);
      if (tab === 'users') setActiveTab('users');
      const raw = localStorage.getItem(LS.users);
      if (raw) {
        const parsed: UserProfile[] = JSON.parse(raw);
        setUsers(parsed.map(u => ({
          ...u,
          assignedVehicles: normalizeVehicles((u as any).assignedVehicles)
        })));
      }
    } catch {}
  }, []);

  // Persist active tab
  useEffect(() => {
    try { localStorage.setItem(LS.activeTab, activeTab); } catch {}
  }, [activeTab]);

  // Persist users when changed
  useEffect(() => {
    try { localStorage.setItem(LS.users, JSON.stringify(users)); } catch {}
  }, [users]);

  // Company membership derived from onboarding.selectedPlan
  type PlanId = 'starter'|'pro'|'business'|'enterprise';
  const planMeta: Record<PlanId, { name: string; price: number; includedUsers: number | -1; features: string[]; }>= {
    starter: { name: 'Starter', price: 59, includedUsers: 1, features: ['Basic CRM','Scheduling','Invoices & payments'] },
    pro: { name: 'Pro', price: 119, includedUsers: 5, features: ['Dispatch board','Recurring billing','Customer portal'] },
    business: { name: 'Business', price: 229, includedUsers: 15, features: ['GPS fleet','Inventory','Advanced analytics'] },
    enterprise: { name: 'Enterprise', price: 499, includedUsers: -1, features: ['Unlimited users','SSO','SLA support'] },
  };
  const companyMembership: Membership = useMemo(() => {
    try {
      const raw = localStorage.getItem(LS.billingPlan);
      const parsed = raw ? JSON.parse(raw) : { id: 'pro' };
      const id = (['starter','pro','business','enterprise'] as PlanId[]).includes(parsed.id) ? parsed.id as PlanId : 'pro';
      const meta = planMeta[id];
      return {
        id,
        name: `${meta.name} Plan`,
        type: id === 'enterprise' ? 'enterprise' : id === 'business' ? 'enterprise' : 'professional',
        price: meta.price,
        billingPeriod: 'monthly',
        features: meta.features,
        limits: {
          maxUsers: meta.includedUsers === -1 ? -1 : meta.includedUsers,
          maxJobs: -1,
          maxClients: -1,
          storageGB: 50,
        },
        isActive: true,
      } as Membership;
    } catch {
      return {
        id: 'pro', name: 'Pro Plan', type: 'professional', price: 119, billingPeriod: 'monthly',
        features: planMeta.pro.features,
        limits: { maxUsers: 5, maxJobs: -1, maxClients: -1, storageGB: 50 }, isActive: true
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorage.getItem(LS.billingPlan)]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term) ||
      u.status.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const remainingSeats = useMemo(() => {
    return companyMembership.limits.maxUsers === -1 ? Infinity : Math.max(companyMembership.limits.maxUsers - users.length, 0);
  }, [companyMembership, users]);

  const openAdd = () => { setNewUser({ ...emptyNewUser, id: '', createdAt: new Date().toISOString(), permissionsMap: defaultPermsForRole(emptyNewUser.role) }); setShowAdd(true); };
  const saveNewUser = () => {
    const id = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now());
    // also fill legacy permissions array from matrix
    const flattened = Object.entries(newUser.permissionsMap || {}).flatMap(([mod, perms]) => Object.entries(perms).filter(([,v])=>v).map(([p])=>`${mod}:${p}`));
    const user: UserProfile = { ...newUser, id, permissions: flattened };
    setUsers(prev => [user, ...prev]);
    setShowAdd(false);
  };
  const openEdit = (u: UserProfile) => setEditingUser({ ...u, permissionsMap: u.permissionsMap || defaultPermsForRole(u.role) });
  const saveEdit = () => {
    if (!editingUser) return;
    const flattened = Object.entries(editingUser.permissionsMap || {}).flatMap(([mod, perms]) => Object.entries(perms).filter(([,v])=>v).map(([p])=>`${mod}:${p}`));
    const updated: UserProfile = { ...editingUser, permissions: flattened };
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    setEditingUser(null);
  };
  const deleteUser = (id: string) => {
    if (!confirm('Remove this user?')) return;
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      // no manager role
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
      {filteredUsers.map((user) => (
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
              <button className="p-2 text-gray-400 hover:text-blue-600" onClick={()=>openEdit(user)}>
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600" onClick={()=>deleteUser(user.id)}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Company plan and permissions views removed per request

  // permissions list removed with permissions tab

  

  const tabs = [
    { id: 'users', label: 'Users', count: users.length }
  ];

  const renderContent = () => {
    return renderUsers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User & Role Management</h2>
          <p className="text-gray-600">Add users to your team and assign roles based on your company membership</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2" onClick={openAdd} disabled={remainingSeats === 0 && companyMembership.limits.maxUsers !== -1}>
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
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
              onClick={() => setActiveTab('users')}
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

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Add Team Member</h3>
              <p className="text-sm text-gray-500 mt-1">Create a new employee profile with role-based access.</p>
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Basic Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input placeholder="e.g., John" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={newUser.firstName} onChange={(e)=>setNewUser({...newUser, firstName:e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input placeholder="e.g., Smith" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={newUser.lastName} onChange={(e)=>setNewUser({...newUser, lastName:e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Contact</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="email" placeholder="name@company.com" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={newUser.email} onChange={(e)=>setNewUser({...newUser, email:e.target.value})} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">An invite can be sent to this address later.</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="tel" placeholder="(555) 123-4567" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={newUser.phone} onChange={(e)=>setNewUser({...newUser, phone:e.target.value})} />
                  </div>
                </div>
              </div>
            </div>

            {/* Role & Status */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Role & Status</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Role</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={newUser.role} onChange={(e)=>setNewUser({...newUser, role: e.target.value as UserProfile['role'], permissionsMap: defaultPermsForRole(e.target.value as UserProfile['role'])})}>
                    <option value="technician">Technician</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="admin">Admin</option>
                    <option value="accountant">Accountant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={newUser.status} onChange={(e)=>setNewUser({...newUser, status: e.target.value as UserProfile['status']})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400"/>Availability</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Working Days</label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((d)=>{
                      const selected = newUser.availability?.days?.includes(d);
                      return (
                        <button key={d} type="button" onClick={()=>{
                          const days = new Set(newUser.availability?.days || []);
                          if (days.has(d)) days.delete(d); else days.add(d);
                          setNewUser({ ...newUser, availability: { ...(newUser.availability||{ startTime:'09:00', endTime:'17:00', days: [] }), days: Array.from(days) }});
                        }} className={`px-3 py-1 rounded-full text-sm border ${selected ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Start Time</label>
                    <input type="time" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={newUser.availability?.startTime || '09:00'} onChange={(e)=>setNewUser({ ...newUser, availability: { ...(newUser.availability||{ days: [], endTime: '17:00' }), startTime: e.target.value } })} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">End Time</label>
                    <input type="time" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={newUser.availability?.endTime || '17:00'} onChange={(e)=>setNewUser({ ...newUser, availability: { ...(newUser.availability||{ days: [], startTime: '09:00' }), endTime: e.target.value } })} />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2"><Tags className="w-4 h-4 text-gray-400"/>Skill Tags</h4>
              <div>
                <div className="flex gap-2">
                  <input value={skillInput} onChange={(e)=>setSkillInput(e.target.value)} onKeyDown={(e)=>{
                    if (e.key === 'Enter' && skillInput.trim()) {
                      if (!newUser.skills?.includes(skillInput.trim())) {
                        setNewUser({ ...newUser, skills: [ ...(newUser.skills||[]), skillInput.trim() ] });
                      }
                      setSkillInput('');
                    }
                  }} placeholder="Type a skill and press Enter (e.g., HVAC, Plumbing)" className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(newUser.skills||[]).map((s)=> (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                      {s}
                      <button type="button" className="ml-1 text-blue-700 hover:text-blue-900" onClick={()=>setNewUser({ ...newUser, skills: (newUser.skills||[]).filter(x=>x!==s) })}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Assigned Vehicles */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2"><Truck className="w-4 h-4 text-gray-400"/>Assigned Vehicles</h4>
              <div className="space-y-3">
                {(newUser.assignedVehicles || []).map((veh, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-gray-50">
                    <div className="grid md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Plate</label>
                        <input value={veh.plate} onChange={(e)=>{
                          const arr = [...(newUser.assignedVehicles||[])];
                          arr[idx] = { ...(arr[idx]||{}), plate: e.target.value } as VehicleAssignment;
                          setNewUser({ ...newUser, assignedVehicles: arr });
                        }} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="ABC-1234" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Type</label>
                        <select value={veh.type} onChange={(e)=>{
                          const arr = [...(newUser.assignedVehicles||[])];
                          arr[idx] = { ...(arr[idx]||{}), type: e.target.value as VehicleAssignment['type'] } as VehicleAssignment;
                          setNewUser({ ...newUser, assignedVehicles: arr });
                        }} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Model</label>
                        <input value={veh.makeModel || ''} onChange={(e)=>{
                          const arr = [...(newUser.assignedVehicles||[])];
                          arr[idx] = { ...(arr[idx]||{}), makeModel: e.target.value } as VehicleAssignment;
                          setNewUser({ ...newUser, assignedVehicles: arr });
                        }} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ford F-150" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Plate Notes</label>
                        <input value={veh.notes || ''} onChange={(e)=>{
                          const arr = [...(newUser.assignedVehicles||[])];
                          arr[idx] = { ...(arr[idx]||{}), notes: e.target.value } as VehicleAssignment;
                          setNewUser({ ...newUser, assignedVehicles: arr });
                        }} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Unit nickname, etc." />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button type="button" className="text-red-600 hover:text-red-700 text-sm" onClick={()=>{
                        const arr = [...(newUser.assignedVehicles||[])];
                        arr.splice(idx,1);
                        setNewUser({ ...newUser, assignedVehicles: arr });
                      }}>Remove</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50" onClick={()=>{
                  setNewUser({ ...newUser, assignedVehicles: [ ...(newUser.assignedVehicles||[]), { plate:'', type:'Truck', makeModel:'', notes:'' } ] });
                }}>
                  <Plus className="w-4 h-4"/> Add Vehicle
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Module Permissions</h4>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700">
                      <th className="text-left p-2">Module</th>
                      <th className="p-2">View</th>
                      <th className="p-2">Add</th>
                      <th className="p-2">Edit</th>
                      <th className="p-2">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(modules as readonly ModuleKey[]).map((m: ModuleKey)=>{
                      const ps = (newUser.permissionsMap as Record<ModuleKey, PermSet>)[m] || { view:false, add:false, edit:false, delete:false };
                      const set = (patch: Partial<PermSet>) => setNewUser({ ...(newUser), permissionsMap: { ...(newUser.permissionsMap||{}), [m]: { ...ps, ...patch }}});
                      return (
                        <tr key={m} className="border-t">
                          <td className="p-2 capitalize text-gray-700">{m.replace('_',' ')}</td>
                          <td className="p-2 text-center"><input type="checkbox" checked={ps.view} onChange={(e)=>set({ view: e.target.checked })} /></td>
                          <td className="p-2 text-center"><input type="checkbox" checked={ps.add} onChange={(e)=>set({ add: e.target.checked })} /></td>
                          <td className="p-2 text-center"><input type="checkbox" checked={ps.edit} onChange={(e)=>set({ edit: e.target.checked })} /></td>
                          <td className="p-2 text-center"><input type="checkbox" checked={ps.delete} onChange={(e)=>set({ delete: e.target.checked })} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={()=>setShowAdd(false)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" onClick={saveNewUser} disabled={!newUser.firstName || !newUser.lastName || !newUser.email}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">First Name</label>
                <input className="w-full px-3 py-2 border rounded" value={editingUser.firstName} onChange={(e)=>setEditingUser({...editingUser, firstName:e.target.value} as UserProfile)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Last Name</label>
                <input className="w-full px-3 py-2 border rounded" value={editingUser.lastName} onChange={(e)=>setEditingUser({...editingUser, lastName:e.target.value} as UserProfile)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input className="w-full px-3 py-2 border rounded" value={editingUser.email} onChange={(e)=>setEditingUser({...editingUser, email:e.target.value} as UserProfile)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Phone</label>
                <input className="w-full px-3 py-2 border rounded" value={editingUser.phone} onChange={(e)=>setEditingUser({...editingUser, phone:e.target.value} as UserProfile)} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Role</label>
                <select className="w-full px-3 py-2 border rounded" value={editingUser.role} onChange={(e)=>setEditingUser({...editingUser, role: e.target.value as UserProfile['role']} as UserProfile)}>
                  <option value="technician">Technician</option>
                  <option value="dispatcher">Dispatcher</option>
                  <option value="admin">Admin</option>
                  <option value="accountant">Accountant</option>
                  {editingUser.role === 'owner' && <option value="owner">Owner</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Status</label>
                <select className="w-full px-3 py-2 border rounded" value={editingUser.status} onChange={(e)=>setEditingUser({...editingUser, status: e.target.value as UserProfile['status']} as UserProfile)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Availability (Edit) */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400"/>Availability</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Working Days</label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((d)=>{
                      const selected = editingUser.availability?.days?.includes(d);
                      return (
                        <button key={d} type="button" onClick={()=>{
                          const days = new Set(editingUser.availability?.days || []);
                          if (days.has(d)) days.delete(d); else days.add(d);
                          setEditingUser({ ...(editingUser as UserProfile), availability: { ...(editingUser.availability||{ startTime:'09:00', endTime:'17:00', days: [] }), days: Array.from(days) } } as UserProfile);
                        }} className={`px-3 py-1 rounded-full text-sm border ${selected ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Start Time</label>
                    <input type="time" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={editingUser.availability?.startTime || '09:00'} onChange={(e)=>setEditingUser({ ...(editingUser as UserProfile), availability: { ...(editingUser.availability||{ days: [], endTime: '17:00' }), startTime: e.target.value } } as UserProfile)} />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">End Time</label>
                    <input type="time" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" value={editingUser.availability?.endTime || '17:00'} onChange={(e)=>setEditingUser({ ...(editingUser as UserProfile), availability: { ...(editingUser.availability||{ days: [], startTime: '09:00' }), endTime: e.target.value } } as UserProfile)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills (Edit) */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2"><Tags className="w-4 h-4 text-gray-400"/>Skill Tags</h4>
              <div>
                <div className="flex gap-2">
                  <input value={editSkillInput} onChange={(e)=>setEditSkillInput(e.target.value)} onKeyDown={(e)=>{
                    if (e.key === 'Enter' && editSkillInput.trim()) {
                      if (!(editingUser?.skills||[]).includes(editSkillInput.trim())) {
                        setEditingUser({ ...(editingUser as UserProfile), skills: [ ...(editingUser?.skills||[]), editSkillInput.trim() ] } as UserProfile);
                      }
                      setEditSkillInput('');
                    }
                  }} placeholder="Type a skill and press Enter" className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(editingUser?.skills||[]).map((s)=> (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                      {s}
                      <button type="button" className="ml-1 text-blue-700 hover:text-blue-900" onClick={()=>setEditingUser({ ...(editingUser as UserProfile), skills: (editingUser?.skills||[]).filter(x=>x!==s) } as UserProfile)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Assigned Vehicles (Edit) */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2"><Truck className="w-4 h-4 text-gray-400"/>Assigned Vehicles</h4>
              <div className="space-y-3">
                {(editingUser?.assignedVehicles || []).map((veh, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-gray-50">
                    <div className="grid md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Plate</label>
                        <input value={veh.plate} onChange={(e)=>{
                          const arr = [ ...((editingUser?.assignedVehicles)||[]) ];
                          arr[idx] = { ...(arr[idx]||{}), plate: e.target.value } as VehicleAssignment;
                          setEditingUser({ ...(editingUser as UserProfile), assignedVehicles: arr } as UserProfile);
                        }} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="ABC-1234" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Type</label>
                        <select value={veh.type} onChange={(e)=>{
                          const arr = [ ...((editingUser?.assignedVehicles)||[]) ];
                          arr[idx] = { ...(arr[idx]||{}), type: e.target.value as VehicleAssignment['type'] } as VehicleAssignment;
                          setEditingUser({ ...(editingUser as UserProfile), assignedVehicles: arr } as UserProfile);
                        }} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          {vehicleTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Model</label>
                        <input value={veh.makeModel || ''} onChange={(e)=>{
                          const arr = [ ...((editingUser?.assignedVehicles)||[]) ];
                          arr[idx] = { ...(arr[idx]||{}), makeModel: e.target.value } as VehicleAssignment;
                          setEditingUser({ ...(editingUser as UserProfile), assignedVehicles: arr } as UserProfile);
                        }} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Ford F-150" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Plate Notes</label>
                        <input value={veh.notes || ''} onChange={(e)=>{
                          const arr = [ ...((editingUser?.assignedVehicles)||[]) ];
                          arr[idx] = { ...(arr[idx]||{}), notes: e.target.value } as VehicleAssignment;
                          setEditingUser({ ...(editingUser as UserProfile), assignedVehicles: arr } as UserProfile);
                        }} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Unit nickname, etc." />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button type="button" className="text-red-600 hover:text-red-700 text-sm" onClick={()=>{
                        const arr = [ ...((editingUser?.assignedVehicles)||[]) ];
                        arr.splice(idx,1);
                        setEditingUser({ ...(editingUser as UserProfile), assignedVehicles: arr } as UserProfile);
                      }}>Remove</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50" onClick={()=>{
                  setEditingUser({ ...(editingUser as UserProfile), assignedVehicles: [ ...((editingUser?.assignedVehicles)||[]), { plate:'', type:'Truck', makeModel:'', notes:'' } ] } as UserProfile);
                }}>
                  <Plus className="w-4 h-4"/> Add Vehicle
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Module Permissions</h4>
              <div className="overflow-auto border rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700">
                      <th className="text-left p-2">Module</th>
                      <th className="p-2">View</th>
                      <th className="p-2">Add</th>
                      <th className="p-2">Edit</th>
                      <th className="p-2">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(modules as readonly ModuleKey[]).map((m: ModuleKey)=>{
                      const ps = (editingUser.permissionsMap as Record<ModuleKey, PermSet>)[m] || { view:false, add:false, edit:false, delete:false };
                      const set = (patch: Partial<PermSet>) => setEditingUser({ ...(editingUser as UserProfile), permissionsMap: { ...(editingUser.permissionsMap||{}), [m]: { ...ps, ...patch }}} as UserProfile);
                      return (
                        <tr key={m} className="border-t">
                          <td className="p-2 capitalize text-gray-700">{m.replace('_',' ')}</td>
                          <td className="p-2 text-center"><input type="checkbox" checked={!!ps.view} onChange={(e)=>set({ view: e.target.checked })} /></td>
                          <td className="p-2 text-center"><input type="checkbox" checked={!!ps.add} onChange={(e)=>set({ add: e.target.checked })} /></td>
                          <td className="p-2 text-center"><input type="checkbox" checked={!!ps.edit} onChange={(e)=>set({ edit: e.target.checked })} /></td>
                          <td className="p-2 text-center"><input type="checkbox" checked={!!ps.delete} onChange={(e)=>set({ delete: e.target.checked })} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button className="px-4 py-2 border rounded" onClick={()=>setEditingUser(null)}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
