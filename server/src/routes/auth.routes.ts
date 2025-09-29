import express from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest, VerifyOTPRequest, SignupRequest } from '../types/auth';

const router = express.Router();

// POST /auth/login - Send OTP for login
router.post('/login', async (req, res) => {
  try {
    const { email }: AuthRequest = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    const result = await authService.sendLoginOTP(email.toLowerCase().trim());
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /auth/signup - Send OTP for signup
router.post('/signup', async (req, res) => {
  try {
    const { email }: AuthRequest = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    const result = await authService.sendSignupOTP(email.toLowerCase().trim());
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Signup route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /auth/verify-login - Verify OTP and complete login
router.post('/verify-login', async (req, res) => {
  try {
    const { email, otp_code }: VerifyOTPRequest = req.body;

    if (!email || !otp_code) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required'
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp_code)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits'
      });
    }

    const result = await authService.verifyLoginOTP(email.toLowerCase().trim(), otp_code);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Verify login route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /auth/verify-signup - Verify OTP and complete signup
router.post('/verify-signup', async (req, res) => {
  try {
    const { email, otp_code, first_name, last_name, account_name, business_type }: VerifyOTPRequest & SignupRequest = req.body;

    if (!email || !otp_code || !first_name || !last_name || !account_name) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP code, first name, last name, and account name are required'
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp_code)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits'
      });
    }

    const signupData: SignupRequest = {
      email: email.toLowerCase().trim(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      account_name: account_name.trim(),
      business_type: business_type?.trim()
    };

    const result = await authService.completeSignup(email.toLowerCase().trim(), otp_code, signupData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Verify signup route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const result = await authService.refreshToken(refresh_token);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }

  } catch (error) {
    console.error('Refresh token route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /auth/me - Get current user info (requires authentication)
router.get('/me', async (req, res) => {
  try {
    // TODO: Add authentication middleware to extract user from JWT
    res.status(200).json({
      success: true,
      message: 'Authentication endpoint working',
      user: null // Will be populated when auth middleware is added
    });
  } catch (error) {
    console.error('Me route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
