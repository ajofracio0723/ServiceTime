// Authentication API service for ServiceTime frontend

const API_BASE_URL = 'http://localhost:3001/api/auth';

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  account?: any;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface LoginRequest {
  email: string;
}

export interface SignupRequest {
  email: string;
  first_name: string;
  last_name: string;
  account_name: string;
  business_type?: string;
}

export interface VerifyRequest {
  email: string;
  otp_code: string;
}

class AuthApiService {
  
  // Send login OTP
  async sendLoginOTP(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending login OTP:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  // Send signup OTP
  async sendSignupOTP(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending signup OTP:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  // Verify login OTP
  async verifyLoginOTP(email: string, otp_code: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp_code }),
      });

      const data = await response.json();
      
      // Store tokens if login successful
      if (data.success && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('account', JSON.stringify(data.account));
      }
      
      return data;
    } catch (error) {
      console.error('Error verifying login OTP:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  // Complete signup
  async completeSignup(
    email: string, 
    otp_code: string, 
    signupData: SignupRequest
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp_code,
          first_name: signupData.first_name,
          last_name: signupData.last_name,
          account_name: signupData.account_name,
          business_type: signupData.business_type,
        }),
      });

      const data = await response.json();
      
      // Store tokens if signup successful
      if (data.success && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('account', JSON.stringify(data.account));
      }
      
      return data;
    } catch (error) {
      console.error('Error completing signup:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  // Refresh access token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        return {
          success: false,
          message: 'No refresh token available',
        };
      }

      const response = await fetch(`${API_BASE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();
      
      // Update access token if refresh successful
      if (data.success && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      
      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.',
      };
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('account');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  // Get current user
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get current account
  getCurrentAccount(): any {
    const accountStr = localStorage.getItem('account');
    return accountStr ? JSON.parse(accountStr) : null;
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authApi = new AuthApiService();
