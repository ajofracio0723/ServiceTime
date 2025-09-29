import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the root of the 'server' directory
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const config = {
  server: {
    port: Number(process.env.PORT) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'postgres',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  aws: {
    region: process.env.AWS_REGION || 'ap-southeast-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  ses: {
    fromEmail: process.env.SES_FROM_EMAIL || '',
    fromName: process.env.SES_FROM_NAME || 'ServiceTime',
  },
};

// Basic validation for required database variables
const requiredDbEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const key of requiredDbEnv) {
  if (!process.env[key]) {
    console.warn(`Missing recommended environment variable: ${key}. The application may not function correctly.`);
  }
}

export default config;

