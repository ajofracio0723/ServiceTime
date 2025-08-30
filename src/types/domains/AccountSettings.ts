export interface BusinessHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface TaxSettings {
  defaultTaxRate: number;
  taxName: string;
  taxNumber?: string;
  exemptServices: string[];
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  headerText: string;
  footerText: string;
  logoUrl?: string;
  colorScheme: string;
  isDefault: boolean;
}

export interface NotificationPreferences {
  emailNotifications: {
    newJobs: boolean;
    jobUpdates: boolean;
    paymentReceived: boolean;
    customerMessages: boolean;
  };
  smsNotifications: {
    jobReminders: boolean;
    emergencyJobs: boolean;
    paymentOverdue: boolean;
  };
  pushNotifications: {
    scheduleChanges: boolean;
    teamUpdates: boolean;
    systemAlerts: boolean;
  };
}

export interface AccountSettings {
  id: string;
  businessName: string;
  businessLogo?: string;
  businessHours: BusinessHours[];
  taxSettings: TaxSettings;
  invoiceTemplates: InvoiceTemplate[];
  notificationPreferences: NotificationPreferences;
  timezone: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}