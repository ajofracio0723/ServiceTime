export interface PersonalInfo {
  name: string;
  email: string;
  password: string;
  phone: string;
  profilePic?: string;
}

export interface BusinessInfo {
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  logo?: string;
}

export interface BusinessCategory {
  serviceType: string;
  technicianCount: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
  customPricing?: boolean;
}

export interface OnboardingData {
  personalInfo: PersonalInfo;
  businessInfo: BusinessInfo;
  businessCategory: BusinessCategory;
  selectedPlan: Plan | null;
}