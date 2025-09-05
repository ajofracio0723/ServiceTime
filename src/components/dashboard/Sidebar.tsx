import { useState, useEffect } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const { state } = useOnboarding();
  const { personalInfo, businessInfo } = state.data;
  const [settingsExpanded, setSettingsExpanded] = useState(activeSection.startsWith('settings'));

  useEffect(() => {
    setSettingsExpanded(activeSection.startsWith('settings'));
  }, [activeSection]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'properties', label: 'Properties', icon: PropertyIcon },
    { id: 'estimates', label: 'Estimates', icon: FileText },
    { id: 'jobs', label: 'Jobs / Work Orders', icon: Calendar },
    { id: 'visits', label: 'Visits (Slots)', icon: MapPin },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'files', label: 'Files', icon: FolderOpen },
  ];

  const settingsSubItems = [
    { id: 'settings-account', label: 'Account Settings', icon: User },
    { id: 'settings-users', label: 'User & Membership', icon: Users },
    { id: 'settings-pricebook', label: 'Price Book', icon: Package },
    { id: 'settings-communication', label: 'Communication', icon: MessageSquare },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo & Business Name */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/LOGO.png" alt="ServiceTime Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">ServiceTime</h2>
            <p className="text-sm text-gray-600">{businessInfo.businessName}</p>
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
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
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
            <p className="text-sm font-medium text-gray-900 truncate">{personalInfo.name}</p>
            <p className="text-xs text-gray-600 truncate">{personalInfo.email}</p>
          </div>
          <LogOut className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
