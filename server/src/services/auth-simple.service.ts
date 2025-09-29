import { query } from '../config/database';
import { User, Account, SignupRequest } from '../types/auth';
import { emailService } from './email.service';

export class SimpleAuthService {
  
  // Generate a 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate simple tokens (for demo - in production use proper JWT)
  private generateTokens(user: User, account: Account) {
    const accessToken = `access_${user.id}_${Date.now()}`;
    const refreshToken = `refresh_${user.id}_${Date.now()}`;
    return { accessToken, refreshToken };
  }

  // Send OTP for login (existing user)
  async sendLoginOTP(email: string): Promise<{ success: boolean; message: string; expires_in?: number }> {
    try {
      // Check if user exists
      const userResult = await query(
        'SELECT id, email, status FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        return {
          success: false,
          message: 'No account found with this email address. Please sign up first.'
        };
      }

      const user = userResult.rows[0];
      
      if (user.status !== 'active') {
        return {
          success: false,
          message: 'Your account is not active. Please contact support.'
        };
      }

      // Generate OTP
      const otpCode = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database
      await query(
        `INSERT INTO user_otps (user_id, email, otp_code, purpose, expires_at) 
         VALUES ($1, $2, $3, 'login', $4)`,
        [user.id, email, otpCode, expiresAt]
      );

      // Send OTP via email
      const emailSent = await emailService.sendOTP(email, otpCode, 'login');
      if (!emailSent) {
        console.log(`⚠️  Email failed, logging OTP for ${email}: ${otpCode}`);
      }

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
      // Check if user already exists
      const userResult = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length > 0) {
        return {
          success: false,
          message: 'An account with this email already exists. Please login instead.'
        };
      }

      // Generate OTP
      const otpCode = this.generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in database (no user_id for signup)
      await query(
        `INSERT INTO user_otps (email, otp_code, purpose, expires_at) 
         VALUES ($1, $2, 'signup', $3)`,
        [email, otpCode, expiresAt]
      );

      // Send OTP via email
      const emailSent = await emailService.sendOTP(email, otpCode, 'signup');
      if (!emailSent) {
        console.log(`⚠️  Email failed, logging OTP for ${email}: ${otpCode}`);
      }

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
  async verifyLoginOTP(email: string, otpCode: string): Promise<{ success: boolean; message: string; user?: User; account?: Account; access_token?: string; refresh_token?: string }> {
    try {
      // Find valid OTP
      const otpResult = await query(
        `SELECT id, user_id, expires_at, used_at, attempts 
         FROM user_otps 
         WHERE email = $1 AND otp_code = $2 AND purpose = 'login' 
         ORDER BY created_at DESC LIMIT 1`,
        [email, otpCode]
      );

      if (otpResult.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid OTP code'
        };
      }

      const otp = otpResult.rows[0];

      // Check if OTP is already used
      if (otp.used_at) {
        return {
          success: false,
          message: 'OTP has already been used'
        };
      }

      // Check if OTP is expired
      if (new Date() > new Date(otp.expires_at)) {
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.'
        };
      }

      // Mark OTP as used
      await query(
        'UPDATE user_otps SET used_at = CURRENT_TIMESTAMP WHERE id = $1',
        [otp.id]
      );

      // Get user and account information
      const userResult = await query(
        `SELECT u.*, a.name as account_name, a.business_type, a.subscription_plan, a.status as account_status
         FROM users u 
         JOIN accounts a ON u.account_id = a.id 
         WHERE u.id = $1`,
        [otp.user_id]
      );

      if (userResult.rows.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const userData = userResult.rows[0];
      const user: User = {
        id: userData.id,
        account_id: userData.account_id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        status: userData.status,
        email_verified: userData.email_verified,
        last_login: userData.last_login,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };

      const account: Account = {
        id: userData.account_id,
        name: userData.account_name,
        business_type: userData.business_type,
        subscription_plan: userData.subscription_plan,
        status: userData.account_status,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user, account);

      // Update last login
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Store refresh token
      await query(
        `INSERT INTO user_sessions (user_id, refresh_token, expires_at) 
         VALUES ($1, $2, $3)`,
        [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 days
      );

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
  async completeSignup(email: string, otpCode: string, signupData: SignupRequest): Promise<{ success: boolean; message: string; user?: User; account?: Account; access_token?: string; refresh_token?: string }> {
    try {
      // Verify OTP first
      const otpResult = await query(
        `SELECT id, expires_at, used_at 
         FROM user_otps 
         WHERE email = $1 AND otp_code = $2 AND purpose = 'signup' 
         ORDER BY created_at DESC LIMIT 1`,
        [email, otpCode]
      );

      if (otpResult.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid OTP code'
        };
      }

      const otp = otpResult.rows[0];

      if (otp.used_at) {
        return {
          success: false,
          message: 'OTP has already been used'
        };
      }

      if (new Date() > new Date(otp.expires_at)) {
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.'
        };
      }

      // Create account first
      const accountResult = await query(
        `INSERT INTO accounts (name, business_type) 
         VALUES ($1, $2) RETURNING *`,
        [signupData.account_name, signupData.business_type]
      );

      const account: Account = accountResult.rows[0];

      // Create user
      const userResult = await query(
        `INSERT INTO users (account_id, email, first_name, last_name, role, email_verified) 
         VALUES ($1, $2, $3, $4, 'owner', true) RETURNING *`,
        [account.id, email, signupData.first_name, signupData.last_name]
      );

      const user: User = userResult.rows[0];

      // Mark OTP as used
      await query(
        'UPDATE user_otps SET used_at = CURRENT_TIMESTAMP WHERE id = $1',
        [otp.id]
      );

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(user, account);

      // Store refresh token
      await query(
        `INSERT INTO user_sessions (user_id, refresh_token, expires_at) 
         VALUES ($1, $2, $3)`,
        [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 days
      );

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

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ success: boolean; message: string; access_token?: string }> {
    try {
      // Check if refresh token exists in database
      const sessionResult = await query(
        'SELECT user_id FROM user_sessions WHERE refresh_token = $1 AND expires_at > CURRENT_TIMESTAMP',
        [refreshToken]
      );

      if (sessionResult.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid or expired refresh token'
        };
      }

      // Generate new access token
      const newAccessToken = `access_${sessionResult.rows[0].user_id}_${Date.now()}`;

      // Update session last used
      await query(
        'UPDATE user_sessions SET last_used = CURRENT_TIMESTAMP WHERE refresh_token = $1',
        [refreshToken]
      );

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

export const simpleAuthService = new SimpleAuthService();
