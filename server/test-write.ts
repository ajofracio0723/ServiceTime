import { Client } from 'pg';

const testWrite = async () => {
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
    
    // Try a simple write operation
    await client.query('SELECT 1 as test');
    console.log('✅ Read operation successful');
    
    // Try creating a simple test table
    await client.query('CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name VARCHAR(50))');
    console.log('✅ Write operation successful - Aurora is writable!');
    
    // Clean up
    await client.query('DROP TABLE IF EXISTS test_table');
    console.log('✅ Test table cleaned up');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('Code:', error.code);
    
    if (error.code === '25006') {
      console.log('\n💡 Aurora is still in read-only mode');
      console.log('Please use AWS RDS Query Editor to create tables manually');
    }
  } finally {
    await client.end();
  }
};

testWrite();
