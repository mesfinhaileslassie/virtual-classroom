const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Delete all users
    const result = await mongoose.connection.db.collection('users').deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} users`);
    
    // Delete all classes
    const classResult = await mongoose.connection.db.collection('classes').deleteMany({});
    console.log(`✅ Deleted ${classResult.deletedCount} classes`);
    
    console.log('✅ Database cleaned successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

cleanup();