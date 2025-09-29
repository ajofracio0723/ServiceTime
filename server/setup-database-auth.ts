import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import config from './src/config/env';

const pool = new Pool({
  connectionTimeoutMillis: 10000,
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  console.log('🚀 Setting up ServiceTime authentication database...');
  
  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Read and execute schema
    console.log('📋 Reading schema file...');
    const schemaPath = path.join(__dirname, 'database', 'schema-auth-onboarding.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔧 Executing schema...');
    await client.query(schema);
    console.log('✅ Schema executed successfully!');
    
    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('accounts', 'users', 'user_otps', 'user_sessions', 'onboarding_profiles')
      ORDER BY table_name
    `);
    
    console.log('📊 Created tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    client.release();
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
