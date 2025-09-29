import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ServiceTime Authentication API is running!',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /api/auth/login': 'Send login OTP',
      'POST /api/auth/signup': 'Send signup OTP', 
      'POST /api/auth/verify-login': 'Verify login OTP',
      'POST /api/auth/verify-signup': 'Complete signup'
    }
  });
});

// Mock authentication endpoints for testing
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Mock response - in real implementation this would send OTP
  res.json({
    success: true,
    message: 'OTP sent to your email address',
    expires_in: 600,
    note: 'This is a mock response. Database tables need to be created first.'
  });
});

app.post('/api/auth/signup', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Mock response
  res.json({
    success: true,
    message: 'OTP sent to your email address',
    expires_in: 600,
    note: 'This is a mock response. Database tables need to be created first.'
  });
});

app.listen(port, () => {
  console.log(`🚀 ServiceTime Authentication API is running on http://localhost:${port}`);
  console.log(`📋 Test the API:`);
  console.log(`   GET  http://localhost:${port}/ - Health check`);
  console.log(`   POST http://localhost:${port}/api/auth/login - Test login endpoint`);
  console.log(`   POST http://localhost:${port}/api/auth/signup - Test signup endpoint`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Create database tables when Aurora is writable`);
  console.log(`   2. Test authentication flow with frontend`);
  console.log(`   3. Implement email service for OTP delivery`);
});
