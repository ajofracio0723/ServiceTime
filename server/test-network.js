const net = require('net');

const host = 'servicetime-instance-1-ap-southeast-2b.c3awcgw2oo79.ap-southeast-2.rds.amazonaws.com';
const port = 5432;

console.log(`Testing network connectivity to ${host}:${port}...`);

const socket = new net.Socket();
const timeout = 10000; // 10 seconds

socket.setTimeout(timeout);

socket.on('connect', () => {
  console.log('✅ Network connection successful! The host and port are reachable.');
  socket.destroy();
});

socket.on('timeout', () => {
  console.log('❌ Connection timed out. The host may be unreachable or blocked by a firewall.');
  socket.destroy();
});

socket.on('error', (err) => {
  console.log('❌ Connection error:', err.message);
  socket.destroy();
});

socket.connect(port, host);
