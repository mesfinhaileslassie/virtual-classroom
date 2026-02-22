const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: 'OK',
    server: 'running',
    database: dbStatus[dbState] || 'unknown',
    port: process.env.PORT || 5000
  });
});

// Simple DB test
app.get('/api/test-db-simple', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        success: false, 
        message: 'Database not connected',
        dbState: mongoose.connection.readyState
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Database is connected',
      dbState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test User model
app.get('/api/test-user', async (req, res) => {
  try {
    // Check database connection first
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        error: 'Database not connected'
      });
    }
    
    const User = require('./models/User');
    
    // Check if test user already exists
    let testUser = await User.findOne({ email: 'teacher@test.com' });
    
    if (!testUser) {
      // Create test user only if it doesn't exist
      testUser = await User.create({
        name: 'Test Teacher',
        email: 'teacher@test.com',
        password: 'password123',
        role: 'teacher'
      });
    }
    
    res.json({
      success: true,
      message: 'User model working!',
      user: {
        id: testUser._id,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role
      }
    });
  } catch (error) {
    console.error('Test user error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// Assignment routes
app.use('/api/assignments', require('./routes/assignmentRoutes'));

// Discussion routes
app.use('/api/discussions', require('./routes/discussionRoutes'));

// Class routes
app.use('/api/classes', require('./routes/classRoutes'));

// Create HTTP server (THIS IS THE KEY CHANGE)
const server = http.createServer(app);

// Initialize Socket.io with the server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join a class room
  socket.on('join-class', (classId) => {
    socket.join(`class-${classId}`);
    console.log(`Socket ${socket.id} joined class ${classId}`);
    
    // Notify others in the class
    socket.to(`class-${classId}`).emit('user-joined', {
      message: 'A user has joined the chat',
      userId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // Leave a class room
  socket.on('leave-class', (classId) => {
    socket.leave(`class-${classId}`);
    console.log(`Socket ${socket.id} left class ${classId}`);
  });

  // Handle chat messages
  socket.on('send-message', (data) => {
    console.log('📨 Message received:', data);
    
    // Broadcast to everyone in the class including sender
    io.to(`class-${data.classId}`).emit('receive-message', {
      text: data.text,
      sender: {
        id: data.sender.id,
        name: data.sender.name,
        role: data.sender.role
      },
      timestamp: data.timestamp || new Date().toISOString(),
      classId: data.classId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Test: http://localhost:${PORT}/api/test`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 DB Test: http://localhost:${PORT}/api/test-db-simple`);
  console.log(`📍 User Test: http://localhost:${PORT}/api/test-user`);
  console.log(`🔌 Socket.io server ready for connections`);
});