console.log('🚀 [index.ts] Starting server execution...');
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { testConnection } from './config/database';
import config from './config/env';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();
const port = config.server.port;

// Security middleware
app.use(helmet());
// CORS configuration
// In development, allow any localhost port to accommodate Vite port changes (5173, 5174, 5175, etc.)
// In production, allow only explicit origins including FRONTEND_URL
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL || ''
].filter(Boolean));

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server, Postman/cURL (no origin header)
    if (!origin) return callback(null, true);

    // Allow any localhost port in development
    const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
    if (config.server.nodeEnv !== 'production' && isLocalhost) {
      return callback(null, true);
    }

    // Explicit allowlist (useful for production or custom domains)
    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ServiceTime API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const startServer = async () => {
  // Test the database connection (non-blocking)
  console.log('🚦 [index.ts] Testing database connection...');
  
  try {
    await testConnection();
    console.log('✅ Database connection successful');
  } catch (dbError) {
    console.log('⚠️  Database connection failed - Aurora may be scaling up');
    console.log('   Server will start anyway, database will reconnect when ready');
  }

  // Start the server regardless of database status
  app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   GET  / - Health check`);
    console.log(`\n🔐 Authentication:`);
    console.log(`   POST /api/auth/login - Send login OTP`);
    console.log(`   POST /api/auth/signup - Send signup OTP`);
    console.log(`   POST /api/auth/verify-login - Verify login OTP`);
    console.log(`   POST /api/auth/verify-signup - Complete signup`);
    console.log(`   POST /api/auth/refresh - Refresh access token`);
    console.log(`   GET  /api/auth/me - Get current user`);
    console.log(`\n👤 User Management:`);
    console.log(`   GET  /api/user/profile - Get user profile`);
    console.log(`   PUT  /api/user/profile - Update user profile`);
    console.log(`   PUT  /api/user/account - Update account info`);
    console.log(`   GET  /api/user/preferences - Get user preferences`);
    console.log(`   PUT  /api/user/preferences - Update user preferences`);
    console.log(`   POST /api/user/password-reset - Initiate password reset`);
    console.log(`   GET  /api/user/team - Get team members`);
    console.log(`\n💡 Frontend integration:`);
    console.log(`\n🎯 Ready to test authentication and user management!`);
  });
};

startServer();
