// Assignment model 
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: String,
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedAt: Date,
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded', 'late'],
    default: 'submitted'
  }
});

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  instructions: {
    type: String,
    required: [true, 'Please add instructions']
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  points: {
    type: Number,
    required: [true, 'Please add total points'],
    min: 0,
    max: 1000
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  rubric: [{
    criterion: String,
    points: Number,
    description: String
  }],
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  latePenalty: {
    type: Number,
    default: 0, // Percentage to deduct
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  submissions: [submissionSchema],
  totalSubmissions: {
    type: Number,
    default: 0
  },
  gradedCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update counts when submissions change
assignmentSchema.pre('save', function(next) {
  if (this.submissions) {
    this.totalSubmissions = this.submissions.length;
    this.gradedCount = this.submissions.filter(s => s.grade !== undefined).length;
  }
  next();
});

// Check if submission is late
assignmentSchema.methods.isLate = function(submissionDate) {
  return submissionDate > this.dueDate;
};

module.exports = mongoose.model('Assignment', assignmentSchema);