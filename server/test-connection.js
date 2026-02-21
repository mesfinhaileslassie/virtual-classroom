const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/virtual-classroom';

console.log('Testing connection to:', uri);

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
.then(() => {
  console.log('✅ SUCCESS! Connected to MongoDB');
  console.log('Database:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  console.log('Port:', mongoose.connection.port);
  process.exit(0);
})
.catch(err => {
  console.error('❌ FAILED to connect:');
  console.error(err.message);
  process.exit(1);
});