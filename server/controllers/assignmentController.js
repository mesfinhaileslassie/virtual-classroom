// Assignment controller 
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');
const User = require('../models/User');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Teachers only)
const createAssignment = async (req, res) => {
  try {
    console.log('📝 Creating assignment with data:', JSON.stringify(req.body, null, 2));
    console.log('👤 User:', req.user._id);

    const { title, description, instructions, classId, dueDate, points, rubric, allowLateSubmission, latePenalty } = req.body;

    // Validate required fields
    const errors = [];
    if (!title) errors.push('title');
    if (!description) errors.push('description');
    if (!instructions) errors.push('instructions');
    if (!classId) errors.push('classId');
    if (!dueDate) errors.push('dueDate');

    if (errors.length > 0) {
      console.log('❌ Missing required fields:', errors);
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${errors.join(', ')}`
      });
    }

    console.log('🔍 Looking for class with ID:', classId);

    // Check if class exists
    const classItem = await Class.findById(classId);
    
    if (!classItem) {
      console.log('❌ Class not found with ID:', classId);
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    console.log('✅ Class found:', classItem.name);
    console.log('👨‍🏫 Class teacher:', classItem.teacherId.toString());
    console.log('👤 Current user:', req.user._id.toString());

    // Check authorization
    if (classItem.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.log('❌ User not authorized');
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create assignments for this class'
      });
    }

    // Create assignment
    const assignmentData = {
      title,
      description,
      instructions,
      classId,
      teacherId: req.user._id,
      dueDate: new Date(dueDate),
      points: points || 100,
      rubric: rubric || [],
      allowLateSubmission: allowLateSubmission || false,
      latePenalty: latePenalty || 0,
      status: 'published'
    };

    console.log('📄 Creating assignment with data:', assignmentData);

    const assignment = await Assignment.create(assignmentData);
    console.log('✅ Assignment created successfully with ID:', assignment._id);

    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('❌ Create assignment error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get all assignments for a class
// @route   GET /api/assignments/class/:classId
// @access  Private
const getClassAssignments = async (req, res) => {
  try {
    const { classId } = req.params;

    // Check if class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check access rights
    const isTeacher = classItem.teacherId.toString() === req.user._id.toString();
    const isEnrolled = classItem.students.includes(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isEnrolled && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view assignments for this class'
      });
    }

    let assignments;
    if (isTeacher || isAdmin) {
      // Teachers see all assignments with submissions
      assignments = await Assignment.find({ classId })
        .populate('teacherId', 'name email')
        .populate('submissions.student', 'name email')
        .sort('-createdAt');
    } else {
      // Students see only published assignments without other students' submissions
      assignments = await Assignment.find({ classId, status: 'published' })
        .populate('teacherId', 'name email')
        .select('-submissions') // Don't send submissions to students
        .sort('-createdAt');
    }

    res.json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('teacherId', 'name email')
      .populate('classId', 'name classCode')
      .populate('submissions.student', 'name email profilePicture');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Check access rights
    const classItem = await Class.findById(assignment.classId);
    const isTeacher = classItem.teacherId.toString() === req.user._id.toString();
    const isEnrolled = classItem.students.includes(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isEnrolled && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this assignment'
      });
    }

    // For students, filter out other students' submissions
    if (!isTeacher && !isAdmin) {
      assignment.submissions = assignment.submissions.filter(
        s => s.student._id.toString() === req.user._id.toString()
      );
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Teachers only)
const updateAssignment = async (req, res) => {
  try {
    let assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Check if user is the teacher or admin
    if (assignment.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this assignment'
      });
    }

    // Fields that can be updated
    const updatableFields = [
      'title', 'description', 'instructions', 'dueDate', 
      'points', 'rubric', 'allowLateSubmission', 'latePenalty', 'status'
    ];
    
    const updateData = {};
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    updateData.updatedAt = Date.now();

    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teachers only)
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Check if user is the teacher or admin
    if (assignment.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this assignment'
      });
    }

    await assignment.deleteOne();

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private (Students only)
const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Check if user is enrolled in the class
    const classItem = await Class.findById(assignment.classId);
    if (!classItem.students.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You are not enrolled in this class'
      });
    }

    // Check if assignment is published
    if (assignment.status !== 'published') {
      return res.status(400).json({
        success: false,
        error: 'This assignment is not accepting submissions'
      });
    }

    // Check if student already submitted
    const existingSubmission = assignment.submissions.find(
      s => s.student.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        error: 'You have already submitted this assignment'
      });
    }

    const { content, attachments } = req.body;

    // Check if late
    const now = new Date();
    const isLate = now > assignment.dueDate;
    const status = isLate && assignment.allowLateSubmission ? 'late' : 'submitted';

    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({
        success: false,
        error: 'Assignment due date has passed and late submissions are not allowed'
      });
    }

    const submission = {
      student: req.user._id,
      content,
      attachments: attachments || [],
      submittedAt: now,
      status
    };

    assignment.submissions.push(submission);
    await assignment.save();

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Grade submission
// @route   PUT /api/assignments/:assignmentId/grade/:studentId
// @access  Private (Teachers only)
const gradeSubmission = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Check if user is the teacher or admin
    if (assignment.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to grade this assignment'
      });
    }

    const { grade, feedback } = req.body;

    // Find the submission
    const submissionIndex = assignment.submissions.findIndex(
      s => s.student.toString() === req.params.studentId
    );

    if (submissionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }

    // Update grade
    assignment.submissions[submissionIndex].grade = grade;
    assignment.submissions[submissionIndex].feedback = feedback;
    assignment.submissions[submissionIndex].gradedBy = req.user._id;
    assignment.submissions[submissionIndex].gradedAt = Date.now();
    assignment.submissions[submissionIndex].status = 'graded';

    await assignment.save();

    res.json({
      success: true,
      message: 'Grade submitted successfully',
      data: assignment.submissions[submissionIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get student's submissions for a class
// @route   GET /api/assignments/student/my-submissions/:classId
// @access  Private (Students only)
const getMySubmissions = async (req, res) => {
  try {
    const { classId } = req.params;

    const assignments = await Assignment.find({ classId })
      .select('title dueDate points submissions')
      .populate('submissions.student', 'name email');

    // Filter only the student's submissions
    const mySubmissions = assignments.map(assignment => {
      const mySubmission = assignment.submissions.find(
        s => s.student._id.toString() === req.user._id.toString()
      );
      return {
        assignmentId: assignment._id,
        assignmentTitle: assignment.title,
        dueDate: assignment.dueDate,
        totalPoints: assignment.points,
        submission: mySubmission || null
      };
    });

    res.json({
      success: true,
      data: mySubmissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get assignment statistics
// @route   GET /api/assignments/:id/stats
// @access  Private (Teachers only)
const getAssignmentStats = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('submissions.student', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Check if user is the teacher or admin
    if (assignment.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view stats'
      });
    }

    const stats = {
      totalStudents: assignment.totalSubmissions,
      submittedCount: assignment.submissions.length,
      gradedCount: assignment.gradedCount,
      pendingCount: assignment.submissions.length - assignment.gradedCount,
      averageGrade: 0,
      highestGrade: 0,
      lowestGrade: 100,
      submissionOverTime: [],
      gradeDistribution: {
        A: 0, // 90-100
        B: 0, // 80-89
        C: 0, // 70-79
        D: 0, // 60-69
        F: 0  // Below 60
      }
    };

    // Calculate statistics
    const grades = assignment.submissions
      .filter(s => s.grade !== undefined)
      .map(s => s.grade);

    if (grades.length > 0) {
      stats.averageGrade = grades.reduce((a, b) => a + b, 0) / grades.length;
      stats.highestGrade = Math.max(...grades);
      stats.lowestGrade = Math.min(...grades);

      // Grade distribution
      grades.forEach(grade => {
        if (grade >= 90) stats.gradeDistribution.A++;
        else if (grade >= 80) stats.gradeDistribution.B++;
        else if (grade >= 70) stats.gradeDistribution.C++;
        else if (grade >= 60) stats.gradeDistribution.D++;
        else stats.gradeDistribution.F++;
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createAssignment,
  getClassAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getMySubmissions,
  getAssignmentStats
};