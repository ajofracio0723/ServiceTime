import { useState, useEffect } from 'react';
import { 
  Palette,
  Clock,
  Percent,
  FileText,
  Bell, 
  Save
} from 'lucide-react';

 

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
  const [activeTab, setActiveTab] = useState<'branding' | 'businessHours' | 'tax' | 'invoices' | 'billing' | 'notifications'>('branding');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // localStorage keys
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
  interface PlanLike { id: 'starter'|'pro'|'business'|'enterprise'; name: string; price: number; customPricing?: boolean; }
  const allPlans: PlanLike[] = [
    { id: 'starter', name: 'Starter', price: 59 },
    { id: 'pro', name: 'Pro', price: 119 },
    { id: 'business', name: 'Business', price: 229 },
    { id: 'enterprise', name: 'Enterprise', price: 499, customPricing: true },
  ];
  const defaultPlan: PlanLike = allPlans[1];
  const [billingPlan, setBillingPlan] = useState<PlanLike>(defaultPlan);
  const [savedBillingPlan, setSavedBillingPlan] = useState<PlanLike>(defaultPlan);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedTab = localStorage.getItem(LS_KEYS.activeTab);
      if (storedTab === 'branding' || storedTab === 'businessHours' || storedTab === 'notifications' || storedTab === 'tax' || storedTab === 'invoices' || storedTab === 'billing') {
        setActiveTab(storedTab);
      }
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

      const rawPlan = localStorage.getItem(LS_KEYS.billingPlan);
      if (rawPlan) {
        try {
          const parsed = JSON.parse(rawPlan);
          const matched = allPlans.find(p => p.id === parsed.id) || defaultPlan;
          setBillingPlan(matched);
          setSavedBillingPlan(matched);
        } catch {}
      } else {
        setBillingPlan(defaultPlan);
        setSavedBillingPlan(defaultPlan);
      }
    } catch (e) {
      // If parsing fails, fall back to defaults silently
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist active tab
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.activeTab, activeTab);
    } catch {}
  }, [activeTab]);

  // Dirty-state helpers
  const isEqual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const brandingDirty = !isEqual(branding, savedBranding);
  const hoursDirty = !isEqual(hours, savedHours);
  const taxDirty = !isEqual(tax, savedTax);
  const invoicesDirty = !isEqual(invoices, savedInvoices);
  const notificationsDirty = !isEqual(notificationSettings, savedNotificationSettings);
  const billingDirty = billingPlan.id !== savedBillingPlan.id;

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'businessHours', label: 'Business Hours', icon: Clock },
    { id: 'tax', label: 'Tax Settings', icon: Percent },
    { id: 'invoices', label: 'Invoice Templates', icon: FileText },
    { id: 'billing', label: 'Billing', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Simulate a short delay for UX and persist to localStorage
      await new Promise(resolve => setTimeout(resolve, 400));

      // Persist only the relevant pieces based on active tab
      if (activeTab === 'branding') {
        localStorage.setItem(LS_KEYS.branding, JSON.stringify(branding));
        setSavedBranding(branding);
      } else if (activeTab === 'businessHours') {
        localStorage.setItem(LS_KEYS.hours, JSON.stringify(hours));
        setSavedHours(hours);
      } else if (activeTab === 'tax') {
        localStorage.setItem(LS_KEYS.tax, JSON.stringify(tax));
        setSavedTax(tax);
      } else if (activeTab === 'invoices') {
        localStorage.setItem(LS_KEYS.invoices, JSON.stringify(invoices));
        setSavedInvoices(invoices);
      } else if (activeTab === 'notifications') {
        localStorage.setItem(LS_KEYS.notifications, JSON.stringify(notificationSettings));
        setSavedNotificationSettings(notificationSettings);
      } else if (activeTab === 'billing') {
        localStorage.setItem(LS_KEYS.billingPlan, JSON.stringify(billingPlan));
        setSavedBillingPlan(billingPlan);
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
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

  const renderBillingTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Billing & Subscription</h3>
      <p className="text-sm text-gray-600">Select a plan below. Your choice will sync with onboarding.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {allPlans.map((plan) => {
          const isSelected = billingPlan.id === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setBillingPlan(plan)}
              className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">Selected</span>
              )}
              <div className="text-center mb-3">
                <h4 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h4>
                <div className="text-2xl font-bold text-gray-900">
                  ${plan.price}
                  <span className="text-xs font-normal text-gray-600 block">{plan.customPricing ? '+ custom pricing' : '/month'}</span>
                </div>
              </div>
              <ul className="text-xs text-gray-700 space-y-1">
                <li className="flex items-start"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 mr-2"></span>Core features</li>
                <li className="flex items-start"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 mr-2"></span>Scheduling & jobs</li>
                <li className="flex items-start"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 mr-2"></span>Invoices & payments</li>
              </ul>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Current: <span className="font-semibold text-gray-900">{billingPlan.name}</span></div>
        <button onClick={handleSave} disabled={saveStatus==='saving' || !billingDirty} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>{saveStatus==='saving'?'Saving...':'Save Plan'}</span>
        </button>
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
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                  {(tab.id==='branding' && brandingDirty) && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Unsaved</span>}
                  {(tab.id==='businessHours' && hoursDirty) && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Unsaved</span>}
                  {(tab.id==='tax' && taxDirty) && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Unsaved</span>}
                  {(tab.id==='invoices' && invoicesDirty) && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Unsaved</span>}
                  {(tab.id==='notifications' && notificationsDirty) && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Unsaved</span>}
                  {(tab.id==='billing' && billingDirty) && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Unsaved</span>}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'branding' && renderBrandingTab()}
        {activeTab === 'businessHours' && renderBusinessHoursTab()}
        {activeTab === 'tax' && renderTaxTab()}
        {activeTab === 'invoices' && renderInvoiceTemplatesTab()}
        {activeTab === 'billing' && renderBillingTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
      </div>
    </div>
  );
};
