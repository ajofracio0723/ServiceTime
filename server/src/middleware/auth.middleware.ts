import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env';
import { JWTPayload } from '../types/auth';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Log token for debugging (first 20 chars only for security)
    console.log(`🔍 [Auth] Token received: ${token.substring(0, 20)}...`);
    
    // Basic token format validation
    if (!token || token.split('.').length !== 3) {
      console.error('🚨 [Auth] Malformed JWT token:', token.substring(0, 50));
      return res.status(401).json({
        success: false,
        message: 'Malformed access token'
      });
    }

    // Verify token
    const jwtSecret = config.jwt.secret;
    if (!jwtSecret) {
      console.error('JWT secret is not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    console.log(`✅ [Auth] Token verified for user: ${decoded.userId}`);
    
    // Add user info to request
    req.user = decoded;
    
    next();

  } catch (error) {
    console.error('🚨 [Auth] Middleware error:', error);
    
    // Handle expired token explicitly first to support client refresh flow
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Access token has expired'
      });
    }
    
    // Handle other JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};
