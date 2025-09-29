import { testConnection } from './src/config/database';

console.log('Running standalone database connection test...');

const runTest = async () => {
  await testConnection();
  console.log('Test complete.');
};

runTest();
