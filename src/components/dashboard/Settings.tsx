import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Users,
  MessageSquare
} from 'lucide-react';
import { AccountSettings } from './AccountSettings';
import { UserMembership } from './UserMembership';
import { Communication } from './Communication';

interface SettingsProps {
  section?: string;
}

export const Settings: React.FC<SettingsProps> = ({ section = 'account' }) => {
  const getInitialSection = (): 'account' | 'users' | 'communication' => {
    switch (section) {
      case 'settings-account':
        return 'account';
      case 'settings-users':
        return 'users';
      case 'settings-communication':
        return 'communication';
      default:
        return 'account';
    }
  };

  const [activeSection, setActiveSection] = useState<'account' | 'users' | 'communication'>(getInitialSection());

  useEffect(() => {
    const newSection = (): 'account' | 'users' | 'communication' => {
      switch (section) {
        case 'settings-account':
          return 'account';
        case 'settings-users':
          return 'users';
        case 'settings-communication':
          return 'communication';
        default:
          return 'account';
      }
    };
    setActiveSection(newSection());
  }, [section]);

  const settingsSections = [
    { 
      id: 'account', 
      label: 'Account Settings', 
      icon: User, 
      description: 'Personal information, business details, notifications, security, and billing'
    },
    { 
      id: 'users', 
      label: 'User & Membership', 
      icon: Users, 
      description: 'Create user profiles, assign memberships, configure permissions and details'
    },
    { 
      id: 'communication', 
      label: 'Communication', 
      icon: MessageSquare, 
      description: 'Email/SMS templates, message history, and communication settings'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'users':
        return <UserMembership />;
      case 'communication':
        return <Communication />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600">Manage your account, users, communication, and system configurations</p>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0">
          {settingsSections.map((section, index) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const isLast = index === settingsSections.length - 1;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as 'account' | 'users' | 'communication')}
                className={`
                  p-6 text-left transition-all duration-200 relative
                  ${isActive 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                  }
                  ${index === 0 ? 'rounded-tl-lg' : ''}
                  ${index === 1 ? 'lg:rounded-none md:rounded-tr-lg' : ''}
                  ${index === 2 ? 'lg:rounded-none md:rounded-bl-lg' : ''}
                  ${isLast ? 'rounded-br-lg lg:rounded-tr-lg md:rounded-none' : ''}
                  ${!isLast && index < 2 ? 'md:border-r border-gray-200' : ''}
                  ${index < 2 ? 'md:border-b lg:border-b-0 border-gray-200' : ''}
                  ${index === 1 ? 'lg:border-r border-gray-200' : ''}
                  ${index === 2 ? 'lg:border-r border-gray-200' : ''}
                `}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-lg"></div>
                )}
                <div className="flex items-center space-x-3 mb-2">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <h3 className={`font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {section.label}
                  </h3>
                </div>
                <p className={`text-sm ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {section.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-screen">
        {renderContent()}
      </div>
    </div>
  );
};