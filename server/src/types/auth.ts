// Authentication types for ServiceTime

export interface User {
  id: string;
  account_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'owner' | 'admin' | 'dispatcher' | 'technician' | 'accountant';
  status: 'active' | 'inactive' | 'pending';
  email_verified: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Account {
  id: string;
  name: string;
  business_type?: string;
  subscription_plan: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: Date;
  updated_at: Date;
}

export interface UserOTP {
  id: number;
  user_id?: number;
  email: string;
  otp_code: string;
  purpose: 'login' | 'signup' | 'password_reset';
  expires_at: Date;
  used_at?: Date;
  attempts: number;
  created_at: Date;
}

export interface UserSession {
  id: number;
  user_id: number;
  refresh_token: string;
  expires_at: Date;
  created_at: Date;
  last_used: Date;
}

export interface JWTPayload {
  userId: string;
  accountId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp_code: string;
}

export interface SignupRequest {
  email: string;
  first_name: string;
  last_name: string;
  account_name: string;
  business_type?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  account?: Account;
  access_token?: string;
  refresh_token?: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expires_in?: number; // seconds until OTP expires
}
