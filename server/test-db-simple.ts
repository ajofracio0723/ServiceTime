import { Pool } from 'pg';

const pool = new Pool({
  host: 'servicetime-instance-1-ap-southeast-2b.c3awcgw2oo79.ap-southeast-2.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: '5hupugc-DR4OA!obZ2(0miWVq(2>',
  database: 'postgres', // Try connecting to default postgres database first
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000
});

console.log('Testing connection to default postgres database...');

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // List all databases
    const result = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log('📋 Available databases:');
    result.rows.forEach(row => {
      console.log(`  - ${row.datname}`);
    });
    
    client.release();
    await pool.end();
  } catch (error) {
    console.error('❌ Error connecting to the database:', error);
    await pool.end();
    process.exit(1);
  }
};

testConnection();
