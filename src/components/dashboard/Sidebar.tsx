import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  User,
  Home as PropertyIcon,
  MapPin,
  Receipt,
  CreditCard,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Package,
  MessageSquare,
  List,
  Route,
  Navigation,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const { state } = useOnboarding();
  const { personalInfo, businessInfo } = state.data;
  const { logout, state: authState } = useAuth();
  
  // Use authenticated user data if available, fallback to onboarding data
  const displayName = authState.user ? `${authState.user.first_name} ${authState.user.last_name}` : personalInfo.name;
  const displayEmail = authState.user?.email || personalInfo.email;
  const displayBusinessName = authState.account?.name || businessInfo.businessName;
  const [settingsExpanded, setSettingsExpanded] = useState(activeSection.startsWith('settings'));
  const [visitsExpanded, setVisitsExpanded] = useState(activeSection.startsWith('visits'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  useEffect(() => {
    setSettingsExpanded(activeSection.startsWith('settings'));
    setVisitsExpanded(activeSection.startsWith('visits'));
  }, [activeSection]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pricebook', label: 'Price Book', icon: Package },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'properties', label: 'Properties', icon: PropertyIcon },
    { id: 'estimates', label: 'Estimates', icon: FileText },
    { id: 'jobs', label: 'Jobs / Work Orders', icon: Calendar },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'files', label: 'Files', icon: FolderOpen },
  ];

  const visitsSubItems = [
    { id: 'visits-calendar', label: 'Calendar View', icon: Calendar },
    { id: 'visits-list', label: 'List View', icon: List },
    { id: 'visits-routes', label: 'Routes', icon: Route },
    { id: 'visits-gps', label: 'GPS Tracking', icon: Navigation },
  ];

  const settingsSubItems = [
    { id: 'settings-account', label: 'Account Settings', icon: User },
    { id: 'settings-users', label: 'User & Membership', icon: Users },
    { id: 'settings-communication', label: 'Communication', icon: MessageSquare },
  ];

  const SidebarContent = (
    <>
      {/* Logo & Business Name */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/LOGO.png" alt="ServiceTime Logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">ServiceTime</h2>
            <p className="text-sm text-gray-600 truncate">{displayBusinessName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <React.Fragment key={item.id}>
                <li>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    aria-label={item.label}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
                
                {/* Insert Visits dropdown after Jobs */}
                {item.id === 'jobs' && (
                  <li>
                    <button
                      onClick={() => {
                        setVisitsExpanded(!visitsExpanded);
                        if (!visitsExpanded) {
                          setActiveSection('visits-calendar'); // Default to calendar view
                        }
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection.startsWith('visits')
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      aria-expanded={visitsExpanded}
                    >
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium flex-1">Visits (Slots)</span>
                      {visitsExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* Visits Dropdown */}
                    {visitsExpanded && (
                      <ul className="mt-2 ml-6 space-y-1">
                        {visitsSubItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = activeSection === subItem.id;
                          
                          return (
                            <li key={subItem.id}>
                              <button
                                onClick={() => setActiveSection(subItem.id)}
                                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                                  isSubActive
                                    ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                                aria-label={subItem.label}
                              >
                                <SubIcon className="w-4 h-4" />
                                <span className="font-medium">{subItem.label}</span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                )}
              </React.Fragment>
            );
          })}
          
          {/* Settings with Dropdown */}
          <li>
            <button
              onClick={() => {
                setSettingsExpanded(!settingsExpanded);
                if (!settingsExpanded) {
                  setActiveSection('settings-account'); // Default to account settings
                }
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection.startsWith('settings')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              aria-expanded={settingsExpanded}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium flex-1">Settings</span>
              {settingsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {/* Settings Dropdown */}
            {settingsExpanded && (
              <ul className="mt-2 ml-6 space-y-1">
                {settingsSubItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = activeSection === subItem.id;
                  
                  return (
                    <li key={subItem.id}>
                      <button
                        onClick={() => setActiveSection(subItem.id)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                          isSubActive
                            ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                        aria-label={subItem.label}
                      >
                        <SubIcon className="w-4 h-4" />
                        <span className="font-medium">{subItem.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
            <p className="text-xs text-gray-600 truncate">{displayEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-400 hover:text-red-600 transition-colors" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 h-screen flex-col">
        {SidebarContent}
      </div>

      {/* Mobile floating menu button */}
      <button
        type="button"
        className="md:hidden fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
        <span>Menu</span>
      </button>

      {/* Mobile off-canvas sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white border-r border-gray-200 shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <img src="/LOGO.png" alt="ServiceTime Logo" className="w-8 h-8 object-contain" />
                <span className="font-semibold">ServiceTime</span>
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            {/* Reuse the same content */}
            <div className="flex-1 flex flex-col">
              {SidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
