const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Class = require('./models/Class');

dotenv.config();

const testClassModel = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Try to create a test class
    const testClass = new Class({
      name: 'Test Class',
      description: 'This is a test class',
      teacherId: new mongoose.Types.ObjectId(), // Dummy teacher ID
      subject: 'Testing',
      semester: 'Spring 2026'
    });

    console.log('Test class before save:', testClass);
    
    // Save the class
    await testClass.save();
    
    console.log('✅ Class saved successfully!');
    console.log('Generated classCode:', testClass.classCode);
    
    // Find the class
    const foundClass = await Class.findOne({ classCode: testClass.classCode });
    console.log('Found class by code:', foundClass ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testClassModel();