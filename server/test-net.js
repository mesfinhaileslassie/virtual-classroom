const net = require('net');

const socket = net.createConnection(27017, '127.0.0.1', () => {
  console.log('✅ TCP connection successful!');
  socket.write('hello\r\n');
});

socket.on('data', (data) => {
  console.log('📥 Received:', data.toString());
  socket.end();
});

socket.on('error', (err) => {
  console.error('❌ Connection error:', err.message);
});

socket.on('close', () => {
  console.log('Connection closed');
});