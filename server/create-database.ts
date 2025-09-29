import { Pool } from 'pg';

const pool = new Pool({
  host: 'servicetime-instance-1-ap-southeast-2b.c3awcgw2oo79.ap-southeast-2.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: '5hupugc-DR4OA!obZ2(0miWVq(2>',
  database: 'postgres', // Connect to default database first
  ssl: {
    rejectUnauthorized: false
  }
});

const createDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Check if servicetime database exists
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'servicetime'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('📋 Database "servicetime" already exists');
    } else {
      // Create the servicetime database
      await client.query('CREATE DATABASE servicetime');
      console.log('🎉 Successfully created "servicetime" database');
    }
    
    client.release();
    await pool.end();
    
    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
};

createDatabase();
