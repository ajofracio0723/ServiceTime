import { apiClient } from './api';

export interface User {
  id: string;
  account_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'owner' | 'admin' | 'dispatcher' | 'technician' | 'accountant';
  status: 'active' | 'inactive' | 'pending';
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  name: string;
  business_type?: string;
  subscription_plan: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
}

export interface AccountUpdate {
  name?: string;
  business_type?: string;
}

export interface UserPreferences {
  notifications: {
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
    job_updates: boolean;
    payment_reminders: boolean;
    client_messages: boolean;
    system_alerts: boolean;
  };
  branding: {
    business_name: string;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
  };
  business_hours: {
    [key: string]: {
      enabled: boolean;
      open: string;
      close: string;
    };
  };
  tax_settings: {
    tax_id: string;
    default_rate: number;
    tax_inclusive: boolean;
  };
  invoice_settings: {
    template_style: string;
    numbering_prefix: string;
    next_number: number;
    terms: string;
    footer_note: string;
    accent_color: string;
    date_format: string;
    paper_size: string;
    show_logo: boolean;
    show_summary: boolean;
    show_payment_terms: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface UserProfileResponse extends ApiResponse {
  user?: User;
  account?: Account;
}

export interface PreferencesResponse extends ApiResponse {
  preferences?: UserPreferences;
}

export interface TeamMembersResponse extends ApiResponse {
  team_members?: User[];
}

class UserApiService {
  
  // Get current user profile
  async getUserProfile(): Promise<UserProfileResponse> {
    try {
      console.log('🔍 [UserAPI] Getting user profile...');
      const response = await apiClient.get('/user/profile');
      console.log('✅ [UserAPI] Profile response:', response);
      return response;
    } catch (error: any) {
      console.error('🚨 [UserAPI] Error getting user profile:', error);
      console.error('🚨 [UserAPI] Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get user profile'
      };
    }
  }

  // Update user profile
  async updateUserProfile(updates: UserProfileUpdate): Promise<UserProfileResponse> {
    try {
      const response = await apiClient.put('/user/profile', updates);
      return response;
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user profile'
      };
    }
  }

  // Update account information
  async updateAccount(updates: AccountUpdate): Promise<{ success: boolean; message: string; account?: Account }> {
    try {
      const response = await apiClient.put('/user/account', updates);
      return response;
    } catch (error: any) {
      console.error('Error updating account:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update account'
      };
    }
  }

  // Get user preferences
  async getUserPreferences(): Promise<PreferencesResponse> {
    try {
      console.log('🔍 [UserAPI] Getting user preferences...');
      const response = await apiClient.get('/user/preferences');
      console.log('✅ [UserAPI] Preferences response:', response);
      return response;
    } catch (error: any) {
      console.error('🚨 [UserAPI] Error getting user preferences:', error);
      console.error('🚨 [UserAPI] Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get user preferences'
      };
    }
  }

  // Update user preferences
  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<PreferencesResponse> {
    try {
      const response = await apiClient.put('/user/preferences', preferences);
      return response;
    } catch (error: any) {
      console.error('Error updating user preferences:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user preferences'
      };
    }
  }


  // Get team members
  async getTeamMembers(): Promise<TeamMembersResponse> {
    try {
      const response = await apiClient.get('/user/team');
      return response;
    } catch (error: any) {
      console.error('Error getting team members:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get team members'
      };
    }
  }

  // Export account data (Owner only)
  async exportAccountData(): Promise<ApiResponse> {
    try {
      const response = await apiClient.post('/user/export-data');
      return response;
    } catch (error: any) {
      console.error('Error exporting account data:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export account data'
      };
    }
  }

  // Delete account (Owner only)
  async deleteAccount(confirmation: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete('/user/account', { confirmation });
      return response;
    } catch (error: any) {
      console.error('Error deleting account:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete account'
      };
    }
  }
}

export const userApi = new UserApiService();
