// Mock authentication service for testing without database
export class MockAuthService {
  
  // Generate a 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Store OTPs in memory for testing (in production, use database)
  private otpStore = new Map<string, { code: string; expires: Date; purpose: string }>();

  // Send OTP for login (existing user)
  async sendLoginOTP(email: string): Promise<{ success: boolean; message: string; expires_in?: number }> {
    try {
      // For demo, assume all emails are valid existing users
      const otpCode = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in memory
      this.otpStore.set(email, {
        code: otpCode,
        expires: expiresAt,
        purpose: 'login'
      });

      // Log OTP for testing (in production, send via email)
      console.log(`🔐 Login OTP for ${email}: ${otpCode}`);

      return {
        success: true,
        message: 'OTP sent to your email address',
        expires_in: 600 // 10 minutes in seconds
      };

    } catch (error) {
      console.error('Error sending login OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  // Send OTP for signup (new user)
  async sendSignupOTP(email: string): Promise<{ success: boolean; message: string; expires_in?: number }> {
    try {
      const otpCode = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in memory
      this.otpStore.set(email, {
        code: otpCode,
        expires: expiresAt,
        purpose: 'signup'
      });

      // Log OTP for testing
      console.log(`🔐 Signup OTP for ${email}: ${otpCode}`);

      return {
        success: true,
        message: 'OTP sent to your email address',
        expires_in: 600 // 10 minutes in seconds
      };

    } catch (error) {
      console.error('Error sending signup OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  // Verify OTP and login
  async verifyLoginOTP(email: string, otpCode: string): Promise<{ success: boolean; message: string; user?: any; account?: any; access_token?: string; refresh_token?: string }> {
    try {
      const storedOTP = this.otpStore.get(email);

      if (!storedOTP) {
        return {
          success: false,
          message: 'Invalid OTP code'
        };
      }

      if (storedOTP.code !== otpCode) {
        return {
          success: false,
          message: 'Invalid OTP code'
        };
      }

      if (new Date() > storedOTP.expires) {
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.'
        };
      }

      if (storedOTP.purpose !== 'login') {
        return {
          success: false,
          message: 'Invalid OTP for login'
        };
      }

      // Remove used OTP
      this.otpStore.delete(email);

      // Mock user and account data
      const user = {
        id: 1,
        account_id: 1,
        email: email,
        first_name: 'Demo',
        last_name: 'User',
        role: 'owner',
        status: 'active',
        email_verified: true
      };

      const account = {
        id: 1,
        name: 'Demo Account',
        business_type: 'hvac',
        subscription_plan: 'starter',
        status: 'active'
      };

      // Mock tokens (in production, use proper JWT)
      const accessToken = `mock_access_token_${Date.now()}`;
      const refreshToken = `mock_refresh_token_${Date.now()}`;

      return {
        success: true,
        message: 'Login successful',
        user,
        account,
        access_token: accessToken,
        refresh_token: refreshToken
      };

    } catch (error) {
      console.error('Error verifying login OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      };
    }
  }

  // Complete signup process
  async completeSignup(email: string, otpCode: string, signupData: any): Promise<{ success: boolean; message: string; user?: any; account?: any; access_token?: string; refresh_token?: string }> {
    try {
      const storedOTP = this.otpStore.get(email);

      if (!storedOTP) {
        return {
          success: false,
          message: 'Invalid OTP code'
        };
      }

      if (storedOTP.code !== otpCode) {
        return {
          success: false,
          message: 'Invalid OTP code'
        };
      }

      if (new Date() > storedOTP.expires) {
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.'
        };
      }

      if (storedOTP.purpose !== 'signup') {
        return {
          success: false,
          message: 'Invalid OTP for signup'
        };
      }

      // Remove used OTP
      this.otpStore.delete(email);

      // Mock created user and account
      const user = {
        id: Math.floor(Math.random() * 1000) + 1,
        account_id: Math.floor(Math.random() * 1000) + 1,
        email: email,
        first_name: signupData.first_name,
        last_name: signupData.last_name,
        role: 'owner',
        status: 'active',
        email_verified: true
      };

      const account = {
        id: user.account_id,
        name: signupData.account_name,
        business_type: signupData.business_type,
        subscription_plan: 'starter',
        status: 'active'
      };

      // Mock tokens
      const accessToken = `mock_access_token_${Date.now()}`;
      const refreshToken = `mock_refresh_token_${Date.now()}`;

      console.log(`✅ Account created for ${email}:`, { user, account });

      return {
        success: true,
        message: 'Account created successfully',
        user,
        account,
        access_token: accessToken,
        refresh_token: refreshToken
      };

    } catch (error) {
      console.error('Error completing signup:', error);
      return {
        success: false,
        message: 'Failed to create account. Please try again.'
      };
    }
  }

  // Refresh access token (mock implementation)
  async refreshToken(refreshToken: string): Promise<{ success: boolean; message: string; access_token?: string }> {
    try {
      // For demo, just generate a new mock token
      const newAccessToken = `mock_access_token_${Date.now()}`;

      return {
        success: true,
        message: 'Token refreshed successfully',
        access_token: newAccessToken
      };

    } catch (error) {
      console.error('Error refreshing token:', error);
      return {
        success: false,
        message: 'Failed to refresh token'
      };
    }
  }
}

export const mockAuthService = new MockAuthService();
