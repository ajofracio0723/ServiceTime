import { useState, useEffect } from 'react';
import { 
  Palette,
  Clock,
  Percent,
  FileText,
  Bell, 
  Save,
  User,
  Building,
  Shield,
  Users
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { userApi, UserProfileUpdate, AccountUpdate } from '../../../../services/userApi';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  jobUpdates: boolean;
  paymentReminders: boolean;
  clientMessages: boolean;
  systemAlerts: boolean;
}

export const AccountSettings: React.FC = () => {
  const { state } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'branding' | 'businessHours' | 'tax' | 'invoices' | 'notifications' | 'security' | 'team'>('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfileUpdate>({
    first_name: state.user?.first_name || '',
    last_name: state.user?.last_name || '',
    email: state.user?.email || '',
    role: state.user?.role || 'technician'
  });
  const [savedUserProfile, setSavedUserProfile] = useState<UserProfileUpdate>(userProfile);

  // Account State
  const [accountInfo, setAccountInfo] = useState<AccountUpdate>({
    name: state.account?.name || '',
    business_type: state.account?.business_type || ''
  });
  const [savedAccountInfo, setSavedAccountInfo] = useState<AccountUpdate>(accountInfo);

  // Preferences State
  // Removed unused preferences state (values were never read)

  // localStorage keys for backward compatibility
  const LS_KEYS = {
    activeTab: 'settings.activeTab',
    branding: 'settings.branding',
    hours: 'settings.businessHours',
    tax: 'settings.tax',
    invoices: 'settings.invoiceTemplates',
    notifications: 'settings.notifications',
    billingPlan: 'onboarding.selectedPlan',
  } as const;

  // Branding
  interface BrandingSettings { businessName: string; logoUrl: string; primaryColor: string; secondaryColor: string; }
  const defaultBranding: BrandingSettings = {
    businessName: 'ServiceTime Solutions',
    logoUrl: '/LOGO.png',
    primaryColor: '#2563eb',
    secondaryColor: '#111827'
  };
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [savedBranding, setSavedBranding] = useState<BrandingSettings>(defaultBranding);

  const defaultNotifications: NotificationSettings = {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    jobUpdates: true,
    paymentReminders: true,
    clientMessages: true,
    systemAlerts: false
  };
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotifications);
  const [savedNotificationSettings, setSavedNotificationSettings] = useState<NotificationSettings>(defaultNotifications);

  // Business Hours
  type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  interface DayHours { enabled: boolean; open: string; close: string; }
  type BusinessHours = Record<DayKey, DayHours>;
  const defaultHours: BusinessHours = {
    mon: { enabled: true, open: '09:00', close: '17:00' },
    tue: { enabled: true, open: '09:00', close: '17:00' },
    wed: { enabled: true, open: '09:00', close: '17:00' },
    thu: { enabled: true, open: '09:00', close: '17:00' },
    fri: { enabled: true, open: '09:00', close: '17:00' },
    sat: { enabled: false, open: '09:00', close: '13:00' },
    sun: { enabled: false, open: '09:00', close: '13:00' },
  };
  const [hours, setHours] = useState<BusinessHours>(defaultHours);
  const [savedHours, setSavedHours] = useState<BusinessHours>(defaultHours);

  // Tax
  interface TaxSettings { taxId: string; defaultRate: number; taxInclusive: boolean; }
  const defaultTax: TaxSettings = { taxId: '12-3456789', defaultRate: 8.5, taxInclusive: false };
  const [tax, setTax] = useState<TaxSettings>(defaultTax);
  const [savedTax, setSavedTax] = useState<TaxSettings>(defaultTax);

  // Invoice Templates
  interface InvoiceTemplates {
    templateStyle: 'Classic' | 'Modern' | 'Minimal';
    numberingPrefix: string;
    nextNumber: number;
    terms: string;
    footerNote: string;
    accentColor: string;
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
    paperSize: 'Letter' | 'A4';
    showLogo: boolean;
    showSummary: boolean;
    showPaymentTerms: boolean;
  }
  const defaultInvoices: InvoiceTemplates = {
    templateStyle: 'Modern',
    numberingPrefix: 'INV-',
    nextNumber: 1001,
    terms: 'Payment due within 15 days.',
    footerNote: 'Thank you for your business!',
    accentColor: '#2563eb',
    dateFormat: 'MM/DD/YYYY',
    paperSize: 'Letter',
    showLogo: true,
    showSummary: true,
    showPaymentTerms: true,
  };
  const [invoices, setInvoices] = useState<InvoiceTemplates>(defaultInvoices);
  const [savedInvoices, setSavedInvoices] = useState<InvoiceTemplates>(defaultInvoices);

  // Billing (uses onboarding plan key)
  // Billing UI removed per request. Plan remains managed via onboarding.

  // Check if user has valid authentication
  const checkAuthAndLoadData = async () => {
    // Check if we have a valid JWT token format
    const token = localStorage.getItem('access_token');
    if (!token || token.split('.').length !== 3) {
      console.log('🚨 [AccountSettings] Invalid or missing JWT token, clearing auth data');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('account');
      setError('Please log in again to access account settings');
      return;
    }
    
    // Load data if we have a valid token format
    await loadUserData();
    await loadPreferences();
  };

  // Load user data and preferences on mount
  useEffect(() => {
    checkAuthAndLoadData();
    
    // Load active tab from localStorage
    try {
      const storedTab = localStorage.getItem(LS_KEYS.activeTab);
      if (storedTab && ['profile', 'account', 'branding', 'businessHours', 'tax', 'invoices', 'notifications', 'security', 'team'].includes(storedTab)) {
        setActiveTab(storedTab as any);
      }
    } catch (e) {
      // If parsing fails, fall back to defaults silently
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load user profile and account data
  const loadUserData = async () => {
    if (!state.user) {
      console.log('🚨 [AccountSettings] No user in auth state, skipping data load');
      return;
    }
    
    console.log('🔍 [AccountSettings] Loading user data for:', state.user.email);
    setLoading(true);
    setError(null);
    
    try {
      // Check if we have a valid token
      const token = localStorage.getItem('access_token');
      console.log('🔍 [AccountSettings] Current token:', token ? `${token.substring(0, 20)}...` : 'None');
      
      const result = await userApi.getUserProfile();
      console.log('🔍 [AccountSettings] getUserProfile result:', result);
      
      if (result && result.success && result.user && result.account) {
        const profileData = {
          first_name: result.user.first_name || '',
          last_name: result.user.last_name || '',
          email: result.user.email || '',
          role: result.user.role || 'technician'
        };
        setUserProfile(profileData);
        setSavedUserProfile(profileData);
        
        const accountData = {
          name: result.account.name || '',
          business_type: result.account.business_type || ''
        };
        setAccountInfo(accountData);
        setSavedAccountInfo(accountData);
      }
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load user preferences
  const loadPreferences = async () => {
    console.log('🔍 [AccountSettings] Loading user preferences...');
    try {
      const result = await userApi.getUserPreferences();
      console.log('🔍 [AccountSettings] getUserPreferences result:', result);
      
      if (result && result.success && result.preferences) {
        // Using returned preferences to hydrate legacy state for UI sections
        
        // Update legacy state for backward compatibility
        if (result.preferences.branding) {
          const brandingData = {
            businessName: result.preferences.branding.business_name,
            logoUrl: result.preferences.branding.logo_url,
            primaryColor: result.preferences.branding.primary_color,
            secondaryColor: result.preferences.branding.secondary_color
          };
          setBranding(brandingData);
          setSavedBranding(brandingData);
        }
        if (result.preferences.business_hours) {
          setHours(result.preferences.business_hours as any);
          setSavedHours(result.preferences.business_hours as any);
        }
        if (result.preferences.tax_settings) {
          setTax(result.preferences.tax_settings as any);
          setSavedTax(result.preferences.tax_settings as any);
        }
        if (result.preferences.invoice_settings) {
          setInvoices(result.preferences.invoice_settings as any);
          setSavedInvoices(result.preferences.invoice_settings as any);
        }
        if (result.preferences.notifications) {
          const notifSettings = {
            emailNotifications: result.preferences.notifications.email_notifications,
            smsNotifications: result.preferences.notifications.sms_notifications,
            pushNotifications: result.preferences.notifications.push_notifications,
            jobUpdates: result.preferences.notifications.job_updates,
            paymentReminders: result.preferences.notifications.payment_reminders,
            clientMessages: result.preferences.notifications.client_messages,
            systemAlerts: result.preferences.notifications.system_alerts
          };
          setNotificationSettings(notifSettings);
          setSavedNotificationSettings(notifSettings);
        }
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      // Fall back to localStorage for backward compatibility
      try {
        const b = JSON.parse(localStorage.getItem(LS_KEYS.branding) || 'null') || defaultBranding;
        setBranding(b); setSavedBranding(b);
        const h = JSON.parse(localStorage.getItem(LS_KEYS.hours) || 'null') || defaultHours;
        setHours(h); setSavedHours(h);
        const t = JSON.parse(localStorage.getItem(LS_KEYS.tax) || 'null') || defaultTax;
        setTax(t); setSavedTax(t);
        const inv = JSON.parse(localStorage.getItem(LS_KEYS.invoices) || 'null') || defaultInvoices;
        setInvoices(inv); setSavedInvoices(inv);
        const noti = JSON.parse(localStorage.getItem(LS_KEYS.notifications) || 'null') || defaultNotifications;
        setNotificationSettings(noti);
        setSavedNotificationSettings(noti);
      } catch (e) {
        // If parsing fails, fall back to defaults silently
      }
    }
  };

  // Persist active tab
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.activeTab, activeTab);
    } catch {}
  }, [activeTab]);

  // Dirty-state helpers
  const isEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const profileDirty = !isEqual(userProfile, savedUserProfile);
  const accountDirty = !isEqual(accountInfo, savedAccountInfo);
  const brandingDirty = !isEqual(branding, savedBranding);
  const hoursDirty = !isEqual(hours, savedHours);
  const taxDirty = !isEqual(tax, savedTax);
  const invoicesDirty = !isEqual(invoices, savedInvoices);
  const notificationsDirty = !isEqual(notificationSettings, savedNotificationSettings);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Building },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'businessHours', label: 'Business Hours', icon: Clock },
    { id: 'tax', label: 'Tax Settings', icon: Percent },
    { id: 'invoices', label: 'Invoice Templates', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'team', label: 'Team', icon: Users },
  ];

  const handleSave = async () => {
    setSaveStatus('saving');
    setError(null);
    
    try {
      let result: any = { success: false };
      
      if (activeTab === 'profile') {
        result = await userApi.updateUserProfile(userProfile);
        if (result.success) {
          setSavedUserProfile(userProfile);
        }
      } else if (activeTab === 'account') {
        result = await userApi.updateAccount(accountInfo);
        if (result.success) {
          setSavedAccountInfo(accountInfo);
        }
      } else if (activeTab === 'branding') {
        const prefsUpdate = { branding: { 
          business_name: branding.businessName,
          logo_url: branding.logoUrl,
          primary_color: branding.primaryColor,
          secondary_color: branding.secondaryColor
        }};
        result = await userApi.updateUserPreferences(prefsUpdate);
        if (result.success) {
          setSavedBranding(branding);
          localStorage.setItem(LS_KEYS.branding, JSON.stringify(branding));
        }
      } else if (activeTab === 'businessHours') {
        const prefsUpdate = { business_hours: hours };
        result = await userApi.updateUserPreferences(prefsUpdate);
        if (result.success) {
          setSavedHours(hours);
          localStorage.setItem(LS_KEYS.hours, JSON.stringify(hours));
        }
      } else if (activeTab === 'tax') {
        const prefsUpdate = { tax_settings: {
          tax_id: tax.taxId,
          default_rate: tax.defaultRate,
          tax_inclusive: tax.taxInclusive
        }};
        result = await userApi.updateUserPreferences(prefsUpdate);
        if (result.success) {
          setSavedTax(tax);
          localStorage.setItem(LS_KEYS.tax, JSON.stringify(tax));
        }
      } else if (activeTab === 'invoices') {
        const prefsUpdate = { invoice_settings: {
          template_style: invoices.templateStyle,
          numbering_prefix: invoices.numberingPrefix,
          next_number: invoices.nextNumber,
          terms: invoices.terms,
          footer_note: invoices.footerNote,
          accent_color: invoices.accentColor,
          date_format: invoices.dateFormat,
          paper_size: invoices.paperSize,
          show_logo: invoices.showLogo,
          show_summary: invoices.showSummary,
          show_payment_terms: invoices.showPaymentTerms
        }};
        result = await userApi.updateUserPreferences(prefsUpdate);
        if (result.success) {
          setSavedInvoices(invoices);
          localStorage.setItem(LS_KEYS.invoices, JSON.stringify(invoices));
        }
      } else if (activeTab === 'notifications') {
        const prefsUpdate = { notifications: {
          email_notifications: notificationSettings.emailNotifications,
          sms_notifications: notificationSettings.smsNotifications,
          push_notifications: notificationSettings.pushNotifications,
          job_updates: notificationSettings.jobUpdates,
          payment_reminders: notificationSettings.paymentReminders,
          client_messages: notificationSettings.clientMessages,
          system_alerts: notificationSettings.systemAlerts
        }};
        result = await userApi.updateUserPreferences(prefsUpdate);
        if (result.success) {
          setSavedNotificationSettings(notificationSettings);
          localStorage.setItem(LS_KEYS.notifications, JSON.stringify(notificationSettings));
        }
      }
      
      if (result.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setError(result.message || 'Failed to save settings');
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (err) {
      setError('An error occurred while saving');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      console.error('Save error:', err);
    }
  };

  // Handle export account data
  const handleExportData = async () => {
    if (!window.confirm('Export all account data? This will download a JSON file with your account information.')) {
      return;
    }

    setSaveStatus('saving');
    setError(null);

    try {
      const result = await userApi.exportAccountData();
      
      if (result.success && result.data) {
        // Create and download JSON file
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `servicetime-account-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setError(result.message || 'Failed to export account data');
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (err) {
      setError('An error occurred while exporting data');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      console.error('Export error:', err);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    const confirmation1 = window.confirm(
      '⚠️ WARNING: This will permanently delete your entire account and all data. This action cannot be undone.\n\nAre you absolutely sure you want to continue?'
    );
    
    if (!confirmation1) return;

    const confirmation2 = window.prompt(
      'To confirm account deletion, please type "DELETE_ACCOUNT" (without quotes):'
    );
    
    if (confirmation2 !== 'DELETE_ACCOUNT') {
      alert('Account deletion cancelled. The confirmation text did not match.');
      return;
    }

    setSaveStatus('saving');
    setError(null);

    try {
      const result = await userApi.deleteAccount('DELETE_ACCOUNT');
      
      if (result.success) {
        alert('Account deleted successfully. You will be logged out.');
        // Clear all local storage and redirect to login
        localStorage.clear();
        window.location.href = '/';
      } else {
        setError(result.message || 'Failed to delete account');
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (err) {
      setError('An error occurred while deleting account');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      console.error('Delete error:', err);
    }
  };

  // Handle subscription management
  const handleManageSubscription = () => {
    // For now, show a modal with subscription options
    // In a real implementation, this would integrate with Stripe/payment provider
    
    const currentPlan = state.account?.subscription_plan || 'starter';
    const plans = [
      { id: 'starter', name: 'Starter', price: '$59/mo', features: ['Basic features', 'Up to 5 users', 'Email support'] },
      { id: 'pro', name: 'Pro', price: '$119/mo', features: ['Advanced features', 'Up to 25 users', 'Priority support', 'AI insights'] },
      { id: 'business', name: 'Business', price: '$229/mo', features: ['All features', 'Unlimited users', '24/7 support', 'Custom integrations'] },
      { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['Enterprise features', 'Dedicated support', 'Custom deployment'] }
    ];

    const planDetails = plans.map(plan => 
      `${plan.name} - ${plan.price}\n${plan.features.join(', ')}`
    ).join('\n\n');

    const message = `Current Plan: ${currentPlan.toUpperCase()}\n\nAvailable Plans:\n\n${planDetails}\n\nNote: This is a demo. In production, this would open a subscription management portal with Stripe or similar payment provider.`;

    alert(message);
    
    // TODO: Implement real subscription management
    // - Integrate with Stripe Customer Portal
    // - Add backend API for subscription changes
    // - Handle plan upgrades/downgrades
    // - Process payments and billing
  };

  // helpers for Branding
  const presetPalettes: Array<{primary: string; secondary: string}> = [
    { primary: '#2563eb', secondary: '#111827' }, // Blue / Gray
    { primary: '#16a34a', secondary: '#052e16' }, // Green / Dark
    { primary: '#db2777', secondary: '#111827' }, // Pink / Gray
    { primary: '#f59e0b', secondary: '#0b1021' }, // Amber / Navy
  ];

  const handleLogoUpload = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setBranding({ ...branding, logoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  // Profile Tab
  const renderProfileTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">User Profile</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {/* Basic Profile Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input 
              type="text" 
              value={userProfile.first_name || ''} 
              onChange={(e) => setUserProfile({...userProfile, first_name: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input 
              type="text" 
              value={userProfile.last_name || ''} 
              onChange={(e) => setUserProfile({...userProfile, last_name: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              value={userProfile.email || ''} 
              onChange={(e) => setUserProfile({...userProfile, email: e.target.value})} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select 
              value={userProfile.role || 'technician'} 
              onChange={(e) => setUserProfile({...userProfile, role: e.target.value})} 
              disabled={state.user?.role !== 'owner'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="technician">Technician</option>
              <option value="accountant">Accountant</option>
            </select>
            {state.user?.role !== 'owner' && (
              <p className="text-xs text-gray-500 mt-1">Only the account owner can change user roles</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Account Details</h4>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Status</label>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              state.user?.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : state.user?.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {state.user?.status?.toUpperCase() || 'ACTIVE'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              state.user?.email_verified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {state.user?.email_verified ? 'VERIFIED' : 'UNVERIFIED'}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
            <p className="text-gray-600">
              {state.user?.last_login 
                ? new Date(state.user.last_login).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Never'
              }
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
            <p className="text-gray-600">
              {state.user?.created_at 
                ? new Date(state.user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Unknown'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Owner-Only Settings */}
      {state.user?.role === 'owner' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-amber-600 mr-2" />
            <h4 className="text-md font-medium text-amber-900">Owner Settings</h4>
          </div>
          
          <div className="space-y-6">
            {/* Subscription Management */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Subscription Plan</label>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
                    {state.account?.subscription_plan?.toUpperCase() || 'STARTER'}
                  </span>
                  <button 
                    onClick={handleManageSubscription}
                    className="text-sm text-amber-700 hover:text-amber-900 underline"
                  >
                    Manage Subscription
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">Account Status</label>
                <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  state.account?.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {state.account?.status?.toUpperCase() || 'ACTIVE'}
                </span>
              </div>
            </div>

            {/* Data Management */}
            <div className="border-t border-amber-200 pt-6">
              <h5 className="text-sm font-medium text-amber-900 mb-4">Data Management</h5>
              <div className="grid md:grid-cols-2 gap-4">
                <button 
                  onClick={handleExportData}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center justify-center px-4 py-3 border border-amber-300 rounded-lg text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {saveStatus === 'saving' ? 'Exporting...' : 'Export Account Data'}
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center justify-center px-4 py-3 border border-red-300 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {saveStatus === 'saving' ? 'Processing...' : 'Delete Account'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <User className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Profile Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your profile information is used throughout the application. Changes to your email address may require re-verification.
            </p>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleSave} 
        disabled={saveStatus === 'saving' || !profileDirty} 
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
      >
        <Save className="w-4 h-4" />
        <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Profile'}</span>
      </button>
    </div>
  );

  // Account Tab
  const renderAccountTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
          <input 
            type="text" 
            value={accountInfo.name || ''} 
            onChange={(e) => setAccountInfo({...accountInfo, name: e.target.value})} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
          <select 
            value={accountInfo.business_type || ''} 
            onChange={(e) => setAccountInfo({...accountInfo, business_type: e.target.value})} 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Business Type</option>
            <option value="hvac">HVAC</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="general_contractor">General Contractor</option>
            <option value="landscaping">Landscaping</option>
            <option value="cleaning">Cleaning Services</option>
            <option value="maintenance">Property Maintenance</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Account Information Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Account Information</h4>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account ID</label>
            <p className="text-gray-600 font-mono text-xs">
              {state.account?.id || 'Not available'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
            <p className="text-gray-600">
              {state.account?.created_at 
                ? new Date(state.account.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'Unknown'
              }
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
            <p className="text-gray-600">
              {state.account?.updated_at 
                ? new Date(state.account.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Unknown'
              }
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Plan</label>
            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {state.account?.subscription_plan?.toUpperCase() || 'STARTER'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Building className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800">Account Settings</h4>
            <p className="text-sm text-yellow-700 mt-1">
              These settings affect your entire account. Only account owners and admins can modify this information.
            </p>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleSave} 
        disabled={saveStatus === 'saving' || !accountDirty || (state.user?.role !== 'owner' && state.user?.role !== 'admin')} 
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
      >
        <Save className="w-4 h-4" />
        <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Account'}</span>
      </button>
      
      {(state.user?.role !== 'owner' && state.user?.role !== 'admin') && (
        <p className="text-sm text-gray-500 mt-2">
          You need owner or admin permissions to modify account settings.
        </p>
      )}
    </div>
  );

  // Security Tab
  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
      
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Security Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your account is secured with email-based OTP authentication. No passwords are stored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Team Tab
  const renderTeamTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Team Management</h3>
      
      {state.user?.role === 'owner' ? (
        <div className="space-y-6">
          {/* Team Overview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">Team Overview</h4>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Invite Member</span>
              </button>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">1</p>
                <p className="text-sm text-blue-800">Owner</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-sm text-green-800">Admins</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">0</p>
                <p className="text-sm text-yellow-800">Dispatchers</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-purple-800">Technicians</p>
              </div>
            </div>

            {/* Current User */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {state.user?.first_name} {state.user?.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{state.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    OWNER
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Permissions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Role Permissions</h4>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-5 gap-4 text-xs font-medium text-gray-700 border-b pb-2">
                <div>Permission</div>
                <div className="text-center">Owner</div>
                <div className="text-center">Admin</div>
                <div className="text-center">Dispatcher</div>
                <div className="text-center">Technician</div>
              </div>
              
              {[
                { name: 'Manage Account Settings', owner: true, admin: true, dispatcher: false, technician: false },
                { name: 'Invite Team Members', owner: true, admin: true, dispatcher: false, technician: false },
                { name: 'Manage Billing', owner: true, admin: false, dispatcher: false, technician: false },
                { name: 'Create/Edit Jobs', owner: true, admin: true, dispatcher: true, technician: false },
                { name: 'View All Jobs', owner: true, admin: true, dispatcher: true, technician: false },
                { name: 'Manage Clients', owner: true, admin: true, dispatcher: true, technician: false },
                { name: 'Generate Reports', owner: true, admin: true, dispatcher: false, technician: false },
                { name: 'Update Job Status', owner: true, admin: true, dispatcher: true, technician: true },
                { name: 'View Assigned Jobs', owner: true, admin: true, dispatcher: true, technician: true },
              ].map((permission, index) => (
                <div key={index} className="grid md:grid-cols-5 gap-4 py-2 text-sm border-b border-gray-100">
                  <div className="text-gray-900">{permission.name}</div>
                  <div className="text-center">
                    {permission.owner ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </div>
                  <div className="text-center">
                    {permission.admin ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </div>
                  <div className="text-center">
                    {permission.dispatcher ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </div>
                  <div className="text-center">
                    {permission.technician ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-400">✗</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invitation Management */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Pending Invitations</h4>
            
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No pending invitations</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-yellow-600 mr-3" />
            <div>
              <h4 className="font-medium text-yellow-900">Access Restricted</h4>
              <p className="text-sm text-yellow-800 mt-1">
                Only account owners can access team management features. Contact your account owner to manage team members and permissions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBrandingTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Branding</h3>
      
      {/* Inputs */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input type="text" value={branding.businessName} onChange={(e)=>setBranding({...branding,businessName:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
              <input type="text" value={branding.logoUrl} onChange={(e)=>setBranding({...branding,logoUrl:e.target.value})} placeholder="https://... or upload below" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <div className="mt-3">
                <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
                  <input type="file" accept="image/*" className="hidden" onChange={(e)=>handleLogoUpload(e.target.files?.[0])} />
                  <span>Upload Logo</span>
                </label>
                <span className="text-xs text-gray-500 ml-2">PNG/JPG/SVG. Stored locally.</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex items-center space-x-3">
                <input type="color" value={branding.primaryColor} onChange={(e)=>setBranding({...branding,primaryColor:e.target.value})} className="h-10 w-12 p-0 border border-gray-300 rounded" />
                <input type="text" value={branding.primaryColor} onChange={(e)=>setBranding({...branding,primaryColor:e.target.value})} className="w-28 px-2 py-2 border border-gray-300 rounded" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
              <div className="flex items-center space-x-3">
                <input type="color" value={branding.secondaryColor} onChange={(e)=>setBranding({...branding,secondaryColor:e.target.value})} className="h-10 w-12 p-0 border border-gray-300 rounded" />
                <input type="text" value={branding.secondaryColor} onChange={(e)=>setBranding({...branding,secondaryColor:e.target.value})} className="w-28 px-2 py-2 border border-gray-300 rounded" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Palettes</p>
            <div className="flex flex-wrap gap-2">
              {presetPalettes.map((p, idx)=> (
                <button key={idx} type="button" onClick={()=>setBranding({...branding, primaryColor:p.primary, secondaryColor:p.secondary})} className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: p.primary }}></span>
                  <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: p.secondary }}></span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleSave} disabled={saveStatus==='saving' || !brandingDirty} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>{saveStatus==='saving'?'Saving...':'Save Branding'}</span>
          </button>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4" style={{ backgroundColor: branding.primaryColor }}>
              <div className="flex items-center space-x-3">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt="Logo Preview" className="h-8 w-8 object-contain rounded bg-white p-1" />
                ) : (
                  <div className="h-8 w-8 rounded bg-white"></div>
                )}
                <span className="font-semibold text-white">{branding.businessName || 'Your Business'}</span>
              </div>
            </div>
            <div className="p-4" style={{ backgroundColor: branding.secondaryColor }}>
              <div className="h-24 rounded-md bg-white/10 border border-white/20"></div>
            </div>
            <div className="p-4 bg-white">
              <p className="text-xs text-gray-600">This preview simulates a header/footer using your colors and logo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const renderBusinessHoursTab = () => {
    const dayLabels: Record<DayKey,string> = { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' };
    const update = (day: DayKey, patch: Partial<DayHours>) => setHours({ ...hours, [day]: { ...hours[day], ...patch }});
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Business Hours</h3>
        <div className="space-y-3">
          {(Object.keys(dayLabels) as DayKey[]).map((d)=> (
            <div key={d} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3 text-sm text-gray-700">{dayLabels[d]}</div>
              <div className="col-span-2">
                <label className="inline-flex items-center space-x-2 text-sm"><input type="checkbox" checked={hours[d].enabled} onChange={(e)=>update(d,{enabled:e.target.checked})} /><span>Open</span></label>
              </div>
              <div className="col-span-3">
                <input type="time" value={hours[d].open} onChange={(e)=>update(d,{open:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="col-span-3">
                <input type="time" value={hours[d].close} onChange={(e)=>update(d,{close:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSave} disabled={saveStatus==='saving' || !hoursDirty} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>{saveStatus==='saving'?'Saving...':'Save Hours'}</span>
        </button>
      </div>
    );
  };

  const renderTaxTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Tax Settings</h3>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
          <input type="text" value={tax.taxId} onChange={(e)=>setTax({...tax, taxId:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default Tax Rate (%)</label>
          <input type="number" step="0.01" value={tax.defaultRate} onChange={(e)=>setTax({...tax, defaultRate: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div className="md:col-span-2">
          <label className="inline-flex items-center space-x-2 text-sm"><input type="checkbox" checked={tax.taxInclusive} onChange={(e)=>setTax({...tax, taxInclusive:e.target.checked})} /><span>Prices include tax</span></label>
        </div>
      </div>
      <button onClick={handleSave} disabled={saveStatus==='saving' || !taxDirty} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2">
        <Save className="w-4 h-4" />
        <span>{saveStatus==='saving'?'Saving...':'Save Tax Settings'}</span>
      </button>
    </div>
  );

  const renderInvoiceTemplatesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Invoice Templates</h3>

      {/* Template style cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {(['Classic','Modern','Minimal'] as InvoiceTemplates['templateStyle'][]).map((style)=>{
          const isActive = invoices.templateStyle === style;
          return (
            <div key={style} onClick={()=>setInvoices({...invoices, templateStyle: style})} className={`cursor-pointer border-2 rounded-xl p-4 transition-all hover:shadow ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{style}</h4>
                {isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Selected</span>}
              </div>
              <div className="h-20 rounded-md border border-dashed border-gray-300 bg-white flex items-center justify-center text-xs text-gray-500">Preview</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numbering</label>
              <div className="flex items-center space-x-2">
                <input type="text" value={invoices.numberingPrefix} onChange={(e)=>setInvoices({...invoices, numberingPrefix:e.target.value})} className="w-28 px-2 py-2 border border-gray-300 rounded" />
                <input type="number" value={invoices.nextNumber} onChange={(e)=>setInvoices({...invoices, nextNumber: parseInt(e.target.value||'0',10)})} className="w-28 px-2 py-2 border border-gray-300 rounded" />
                <div className="text-sm text-gray-600">Preview: <span className="font-semibold text-gray-900">{invoices.numberingPrefix}{invoices.nextNumber}</span></div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
              <div className="flex items-center space-x-3">
                <input type="color" value={invoices.accentColor} onChange={(e)=>setInvoices({...invoices, accentColor:e.target.value})} className="h-10 w-12 p-0 border border-gray-300 rounded" />
                <input type="text" value={invoices.accentColor} onChange={(e)=>setInvoices({...invoices, accentColor:e.target.value})} className="w-28 px-2 py-2 border border-gray-300 rounded" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
              <select value={invoices.dateFormat} onChange={(e)=>setInvoices({...invoices, dateFormat: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size</label>
              <select value={invoices.paperSize} onChange={(e)=>setInvoices({...invoices, paperSize: e.target.value as any})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Letter</option>
                <option>A4</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <label className="inline-flex items-center space-x-2 text-sm">
              <input type="checkbox" checked={invoices.showLogo} onChange={(e)=>setInvoices({...invoices, showLogo:e.target.checked})} />
              <span>Show Logo</span>
            </label>
            <label className="inline-flex items-center space-x-2 text-sm">
              <input type="checkbox" checked={invoices.showSummary} onChange={(e)=>setInvoices({...invoices, showSummary:e.target.checked})} />
              <span>Show Summary</span>
            </label>
            <label className="inline-flex items-center space-x-2 text-sm">
              <input type="checkbox" checked={invoices.showPaymentTerms} onChange={(e)=>setInvoices({...invoices, showPaymentTerms:e.target.checked})} />
              <span>Show Payment Terms</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Terms</label>
            <textarea value={invoices.terms} onChange={(e)=>setInvoices({...invoices, terms:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Note</label>
            <textarea value={invoices.footerNote} onChange={(e)=>setInvoices({...invoices, footerNote:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={2} />
          </div>

          <button onClick={handleSave} disabled={saveStatus==='saving' || !invoicesDirty} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>{saveStatus==='saving'?'Saving...':'Save Invoice Template'}</span>
          </button>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4" style={{ backgroundColor: invoices.accentColor }}>
              <div className="flex items-center justify-between">
                {invoices.showLogo ? (
                  <div className="h-8 w-24 bg-white rounded" />
                ) : <div />}
                <div className="text-white text-sm">{invoices.numberingPrefix}{invoices.nextNumber}</div>
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="h-20 border border-dashed border-gray-300 rounded mb-3"></div>
              {invoices.showSummary && <div className="h-10 bg-gray-50 border border-gray-200 rounded mb-2" />}
              {invoices.showPaymentTerms && <div className="h-16 bg-gray-50 border border-gray-200 rounded" />}
              <p className="text-[10px] text-gray-500 mt-3">Paper: {invoices.paperSize} • Date: {invoices.dateFormat}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-600">Receive notifications via email</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">SMS Notifications</h4>
            <p className="text-sm text-gray-600">Receive notifications via text message</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.smsNotifications}
              onChange={(e) => setNotificationSettings({...notificationSettings, smsNotifications: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Push Notifications</h4>
            <p className="text-sm text-gray-600">Receive notifications in the app</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.pushNotifications}
              onChange={(e) => setNotificationSettings({...notificationSettings, pushNotifications: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Job Updates</h4>
            <p className="text-sm text-gray-600">Get notified about job status changes</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.jobUpdates}
              onChange={(e) => setNotificationSettings({...notificationSettings, jobUpdates: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Payment Reminders</h4>
            <p className="text-sm text-gray-600">Get reminded about overdue payments</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.paymentReminders}
              onChange={(e) => setNotificationSettings({...notificationSettings, paymentReminders: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saveStatus === 'saving' || !notificationsDirty}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
      >
        <Save className="w-4 h-4" />
        <span>{saveStatus === 'saving' ? 'Saving...' : 'Save Preferences'}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>
      {saveStatus === 'success' && (
        <div className="inline-flex items-center space-x-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-md">
          <span>Settings saved!</span>
        </div>
      )}
      

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className={`${activeTab === tab.id ? 'text-blue-900' : 'text-gray-900'}`}>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        )}
        
        {!loading && (
          <>
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'account' && renderAccountTab()}
            {activeTab === 'branding' && renderBrandingTab()}
            {activeTab === 'businessHours' && renderBusinessHoursTab()}
            {activeTab === 'tax' && renderTaxTab()}
            {activeTab === 'invoices' && renderInvoiceTemplatesTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'team' && renderTeamTab()}
          </>
        )}
      </div>
    </div>
  );
};
