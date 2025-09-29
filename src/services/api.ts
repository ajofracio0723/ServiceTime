// Centralized API client for ServiceTime frontend

const API_BASE_URL = 'http://localhost:3001/api';

// Single-flight refresh lock
let refreshInFlight: Promise<boolean> | null = null;

// Cleanup and optional redirect on auth failure
function logoutCleanup() {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('account');
  } catch (e) {
    console.error('Error during logout cleanup:', e);
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  // Optional token field returned by /auth/refresh
  access_token?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Get authorization header
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      // Validate token format (should be a JWT with 3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('Invalid JWT token format, removing from storage');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('account');
      }
    }
    
    return headers;
  }

  // Handle API response
  private async handleResponse(response: Response): Promise<any> {
    // Gracefully handle empty/204 responses
    let data: any = null;
    const text = await response.text().catch(() => '');
    if (text && text.trim() !== '') {
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Non-JSON response; return raw text
        data = { success: response.ok, message: text };
      }
    } else {
      data = { success: response.ok, message: '' };
    }

    // 401 handling – try refresh flow if we have a refresh token
    if (response.status === 401) {
      const hasRefresh = !!localStorage.getItem('refresh_token');
      const message = (data?.message || '').toLowerCase();
      const isExpired = message.includes('expired') || message.includes('access token');
      if (hasRefresh && isExpired) {
        const refreshed = await this.ensureRefreshed();
        if (refreshed) {
          // Signal the caller to retry request with new token
          throw new Error('TOKEN_REFRESHED');
        } else {
          // Refresh failed – cleanup and surface 401
          logoutCleanup();
        }
      }
    }

    return data;
  }

  // Refresh access token (single-flight)
  private async refreshToken(): Promise<ApiResponse> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        return {
          success: false,
          message: 'No refresh token available',
        };
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const text = await response.text().catch(() => '');
      const data = text ? JSON.parse(text) : { success: response.ok, message: '' };
      
      // Update access token if refresh successful
      if (data.success && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      
      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return {
        success: false,
        message: 'Failed to refresh token',
      };
    }
  }

  // Ensure only one refresh runs; returns true if refreshed successfully
  private async ensureRefreshed(): Promise<boolean> {
    if (!refreshInFlight) {
      refreshInFlight = (async () => {
        const result = await this.refreshToken();
        return !!(result && result.success && result.access_token);
      })()
      .finally(() => {
        // clear after completion to allow future refreshes
        setTimeout(() => { refreshInFlight = null; }, 0);
      });
    }
    try {
      return await refreshInFlight;
    } catch {
      return false;
    }
  }

  // Generic request method
  private async request(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'TOKEN_REFRESHED') {
        // Retry the request with new token
        const retryConfig: RequestInit = {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        };
        const retryResponse = await fetch(url, retryConfig);
        return await this.handleResponse(retryResponse);
      }
      
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch(endpoint: string, data?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
