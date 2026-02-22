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
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        error: 'Database not connected'
      });
    }
    
    const User = require('./models/User');
    
    let testUser = await User.findOne({ email: 'teacher@test.com' });
    
    if (!testUser) {
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

// Class routes
app.use('/api/classes', require('./routes/classRoutes'));

// Assignment routes
app.use('/api/assignments', require('./routes/assignmentRoutes'));

// Discussion routes
app.use('/api/discussions', require('./routes/discussionRoutes'));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Track live classes
const liveClasses = new Map();
const studentHands = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  // Join a class room (for chat)
  socket.on('join-class', (classId) => {
    socket.join(`class-${classId}`);
    console.log(`Socket ${socket.id} joined class ${classId}`);
    
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

  // Live Class Events
  socket.on('teacher-started', ({ classId, userId, name }) => {
    socket.join(`live-${classId}`);
    socket.to(`live-${classId}`).emit('teacher-started');
    
    if (!liveClasses.has(classId)) {
      liveClasses.set(classId, new Map());
    }
    
    console.log(`👨‍🏫 Teacher ${name} started live class ${classId}`);
  });

  socket.on('join-live-class', ({ classId, userId, name }) => {
    socket.join(`live-${classId}`);
    
    if (!liveClasses.has(classId)) {
      liveClasses.set(classId, new Map());
    }
    
    const classStudents = liveClasses.get(classId);
    classStudents.set(userId, { socketId: socket.id, name, joinedAt: new Date() });
    
    const studentList = Array.from(classStudents.entries()).map(([userId, data]) => ({
      userId,
      name: data.name
    }));
    
    io.to(`live-${classId}`).emit('student-list', studentList);
    
    console.log(`👤 Student ${name} joined live class ${classId}`);
    console.log(`📊 Total students in class ${classId}: ${classStudents.size}`);
  });

  socket.on('send-reaction', ({ classId, userId, name, type }) => {
    io.to(`live-${classId}`).emit('new-reaction', { userId, name, type });
    console.log(`👍 Reaction ${type} from ${name} in class ${classId}`);
  });

  socket.on('raise-hand', ({ classId, userId, name }) => {
    if (!studentHands.has(classId)) {
      studentHands.set(classId, new Map());
    }
    
    const hands = studentHands.get(classId);
    hands.set(userId, { name, socketId: socket.id, raisedAt: new Date() });
    
    io.to(`live-${classId}`).emit('hand-raised', { userId, name });
    console.log(`✋ Hand raised by ${name} in class ${classId}`);
  });

  socket.on('lower-hand', ({ classId, userId }) => {
    if (studentHands.has(classId)) {
      studentHands.get(classId).delete(userId);
    }
    io.to(`live-${classId}`).emit('hand-lowered', { userId });
    console.log(`👇 Hand lowered for user ${userId} in class ${classId}`);
  });

  socket.on('send-chat-message', ({ classId, userId, name, message }) => {
    io.to(`live-${classId}`).emit('new-chat-message', { 
      userId, 
      name, 
      message,
      timestamp: new Date().toISOString()
    });
    console.log(`💬 Chat message from ${name} in class ${classId}`);
  });

  socket.on('teacher-audio-toggle', ({ classId, muted }) => {
    socket.to(`live-${classId}`).emit('teacher-audio-toggle', { muted });
    console.log(`🎤 Teacher audio ${muted ? 'muted' : 'unmuted'} in class ${classId}`);
  });

  socket.on('teacher-video-toggle', ({ classId, off }) => {
    socket.to(`live-${classId}`).emit('teacher-video-toggle', { off });
    console.log(`📹 Teacher video ${off ? 'off' : 'on'} in class ${classId}`);
  });

  socket.on('teacher-screen-share', ({ classId, sharing }) => {
    socket.to(`live-${classId}`).emit('teacher-screen-share', { sharing });
    console.log(`🖥️ Teacher screen sharing ${sharing ? 'started' : 'stopped'} in class ${classId}`);
  });

  socket.on('end-live-class', ({ classId }) => {
    io.to(`live-${classId}`).emit('class-ended');
    
    liveClasses.delete(classId);
    studentHands.delete(classId);
    
    const room = io.sockets.adapter.rooms.get(`live-${classId}`);
    if (room) {
      for (const socketId of room) {
        const clientSocket = io.sockets.sockets.get(socketId);
        if (clientSocket) {
          clientSocket.leave(`live-${classId}`);
        }
      }
    }
    
    console.log(`🔴 Live class ended: ${classId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Find and remove student from all live classes
    for (const [classId, students] of liveClasses) {
      let removedUserId = null;
      let removedName = null;
      
      for (const [userId, data] of students) {
        if (data.socketId === socket.id) {
          students.delete(userId);
          removedUserId = userId;
          removedName = data.name;
          break;
        }
      }
      
      if (removedUserId) {
        const studentList = Array.from(students.entries()).map(([userId, data]) => ({
          userId,
          name: data.name
        }));
        
        io.to(`live-${classId}`).emit('student-list', studentList);
        
        if (studentHands.has(classId)) {
          studentHands.get(classId).delete(removedUserId);
          io.to(`live-${classId}`).emit('hand-lowered', { userId: removedUserId });
        }
        
        console.log(`👤 Student ${removedName} left live class ${classId}`);
        console.log(`📊 Total students in class ${classId}: ${students.size}`);
      }
    }
    
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Test: http://localhost:${PORT}/api/test`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
  console.log(`📍 DB Test: http://localhost:${PORT}/api/test-db-simple`);
  console.log(`📍 User Test: http://localhost:${PORT}/api/test-user`);
  console.log(`🔌 Socket.io server ready for connections`);
});