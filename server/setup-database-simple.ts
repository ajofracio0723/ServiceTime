import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const setupDatabase = async () => {
  const client = new Client({
    host: 'servicetime-instance-1-ap-southeast-2b.c3awcgw2oo79.ap-southeast-2.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: '5hupugc-DR4OA!obZ2(0miWVq(2>',
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Read the simplified schema file
    const schemaPath = path.join(__dirname, 'database', 'schema-simple.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Creating database schema...');
    
    // Execute the schema
    await client.query(schema);
    
    console.log('🎉 Database schema created successfully!');
    console.log('📊 Tables created:');
    console.log('  - accounts (business/tenant isolation)');
    console.log('  - users (user management)');
    console.log('  - user_otps (passwordless authentication)');
    console.log('  - user_sessions (JWT token management)');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('accounts', 'users', 'user_otps', 'user_sessions')
      ORDER BY table_name
    `);
    
    console.log('✅ Verified tables:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await client.end();
  }
};

setupDatabase();
