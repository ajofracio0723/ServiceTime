import { Pool } from 'pg';
import config from './env';

const pool = new Pool({
  connectionTimeoutMillis: 5000, // 5 seconds
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  // SSL is required for connecting to AWS Aurora.
  // rejectUnauthorized: false is suitable for development, but for production,
  // you should use the AWS RDS CA certificate.
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to the database!');
    client.release();
  } catch (error) {
    console.error('❌ Error connecting to the database:', error);
    process.exit(1);
  }
};

export default pool;
