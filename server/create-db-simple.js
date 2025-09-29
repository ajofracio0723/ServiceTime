const { Client } = require('pg');

async function createDatabase() {
  const client = new Client({
    host: 'servicetime-instance-1-ap-southeast-2b.c3awcgw2oo79.ap-southeast-2.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: '5hupugc-DR4OA!obZ2(0miWVq(2>',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Create database
    await client.query('CREATE DATABASE servicetime');
    console.log('🎉 Successfully created "servicetime" database!');
    
  } catch (error) {
    if (error.code === '42P04') {
      console.log('📋 Database "servicetime" already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
