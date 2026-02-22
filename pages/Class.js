const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a class name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classCode: {
    type: String,
    required: true,
    unique: true
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject']
  },
  semester: {
    type: String,
    required: [true, 'Please add a semester']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  classImage: {
    type: String,
    default: 'default-class.jpg'
  }
}, {
  timestamps: true
});

// No pre-save hooks - we generate classCode in the controller

module.exports = mongoose.model('Class', classSchema);