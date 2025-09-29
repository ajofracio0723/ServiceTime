import { Client } from 'pg';

const verifyTables = async () => {
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
    
    // Check if tables exist
    const result = await client.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN ('accounts', 'users', 'user_otps', 'user_sessions')
      ORDER BY table_name
    `);

    if (result.rows.length === 4) {
      console.log('🎉 All authentication tables found!');
      result.rows.forEach(row => {
        console.log(`  ✓ ${row.table_name} (${row.column_count} columns)`);
      });
      
      console.log('\n🚀 Ready to switch to real authentication service!');
      console.log('Next step: Update auth routes to use real AuthService instead of MockAuthService');
      
    } else {
      console.log('⚠️  Some tables are missing:');
      const expectedTables = ['accounts', 'users', 'user_otps', 'user_sessions'];
      const foundTables = result.rows.map(row => row.table_name);
      const missingTables = expectedTables.filter(table => !foundTables.includes(table));
      
      console.log('Found tables:', foundTables);
      console.log('Missing tables:', missingTables);
      console.log('\nPlease create the missing tables using AWS RDS Query Editor');
    }
    
  } catch (error: any) {
    console.error('❌ Connection error:', error.message);
    console.log('\n💡 Aurora might be scaling up. Please try again in a few minutes.');
  } finally {
    await client.end();
  }
};

verifyTables();
