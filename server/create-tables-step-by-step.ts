import { Client } from 'pg';

const createTablesStepByStep = async () => {
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

  const tables = [
    {
      name: 'accounts',
      sql: `
        CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          business_type VARCHAR(100),
          subscription_plan VARCHAR(50) DEFAULT 'starter',
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
    },
    {
      name: 'users',
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          role VARCHAR(50) DEFAULT 'technician',
          status VARCHAR(20) DEFAULT 'active',
          email_verified BOOLEAN DEFAULT FALSE,
          last_login TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
    },
    {
      name: 'user_otps',
      sql: `
        CREATE TABLE IF NOT EXISTS user_otps (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          email VARCHAR(255) NOT NULL,
          otp_code VARCHAR(6) NOT NULL,
          purpose VARCHAR(20) DEFAULT 'login',
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used_at TIMESTAMP WITH TIME ZONE,
          attempts INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
    },
    {
      name: 'user_sessions',
      sql: `
        CREATE TABLE IF NOT EXISTS user_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          refresh_token VARCHAR(500) NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
    }
  ];

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    for (const table of tables) {
      try {
        console.log(`📋 Creating table: ${table.name}...`);
        await client.query(table.sql);
        console.log(`✓ Table ${table.name} created successfully`);
      } catch (error: any) {
        if (error.code === '42P07') {
          console.log(`ℹ️  Table ${table.name} already exists`);
        } else {
          console.error(`❌ Error creating table ${table.name}:`, error.message);
          throw error;
        }
      }
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_account_id ON users(account_id)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_user_otps_email ON user_otps(email)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)'
    ];

    console.log('📋 Creating indexes...');
    for (const indexSql of indexes) {
      try {
        await client.query(indexSql);
      } catch (error: any) {
        console.log(`ℹ️  Index might already exist: ${error.message}`);
      }
    }
    console.log('✓ Indexes created');

    // Verify tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('accounts', 'users', 'user_otps', 'user_sessions')
      ORDER BY table_name
    `);

    console.log('\n🎉 Database setup complete!');
    console.log('✅ Tables verified:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    console.log('\n🚀 Ready to switch from mock to real authentication service!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    if (error.code === '25006') {
      console.log('\n💡 Aurora is in read-only mode. Try these solutions:');
      console.log('1. Wait a few minutes for Aurora to become writable');
      console.log('2. Use AWS RDS Query Editor to create tables manually');
      console.log('3. Check if Aurora Serverless is scaling up');
    }
  } finally {
    await client.end();
  }
};

createTablesStepByStep();
