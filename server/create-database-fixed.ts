import { Client } from 'pg';

const createDatabase = async () => {
  const client = new Client({
    host: 'servicetime-instance-1-ap-southeast-2b.c3awcgw2oo79.ap-southeast-2.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: '5hupugc-DR4OA!obZ2(0miWVq(2>',
    database: 'postgres', // Connect to default database first
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Check if servicetime database exists
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'servicetime'"
    );
    
    if (checkResult.rows.length > 0) {
      console.log('📋 Database "servicetime" already exists');
    } else {
      // Create the servicetime database (no transaction needed)
      await client.query('CREATE DATABASE servicetime');
      console.log('🎉 Successfully created "servicetime" database');
    }
    
    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
};

createDatabase();
