const Class = require('../models/Class');
const User = require('../models/User');

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Teachers only)
const createClass = async (req, res) => {
  try {
    // Check if user is teacher
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only teachers can create classes'
      });
    }

    const { name, description, subject, semester } = req.body;

    // Validate required fields
    if (!name || !description || !subject || !semester) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Generate unique class code
    const subjectCode = subject.substring(0, 4).toUpperCase();
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    const classCode = `${subjectCode}-${year}-${random}${timestamp}`;

    console.log('Creating class with code:', classCode);

    const newClass = await Class.create({
      name,
      description,
      subject,
      semester,
      teacherId: req.user._id,
      classCode
    });

    // Populate teacher info for response
    const populatedClass = await Class.findById(newClass._id)
      .populate('teacherId', 'name email');

    res.status(201).json({
      success: true,
      data: populatedClass
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all classes (filtered by role)
// @route   GET /api/classes
// @access  Private
const getClasses = async (req, res) => {
  try {
    let classes;
    let query = {};

    // Filter based on user role
    if (req.user.role === 'admin') {
      // Admin sees all classes
      classes = await Class.find({})
        .populate('teacherId', 'name email')
        .populate('students', 'name email')
        .sort('-createdAt');
    } else if (req.user.role === 'teacher') {
      // Teachers see classes they teach
      classes = await Class.find({ teacherId: req.user._id })
        .populate('students', 'name email')
        .sort('-createdAt');
    } else {
      // Students see classes they're enrolled in
      classes = await Class.find({ students: req.user._id })
        .populate('teacherId', 'name email')
        .sort('-createdAt');
    }

    res.json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single class by ID
// @route   GET /api/classes/:id
// @access  Private
const getClassById = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('teacherId', 'name email profilePicture')
      .populate('students', 'name email profilePicture');

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check access rights
    const isTeacher = classItem.teacherId._id.toString() === req.user._id.toString();
    const isEnrolled = classItem.students.some(s => s._id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isEnrolled && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this class'
      });
    }

    res.json({
      success: true,
      data: classItem
    });
  } catch (error) {
    console.error('Get class by ID error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Teacher only)
const updateClass = async (req, res) => {
  try {
    let classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if user is teacher of this class or admin
    const isTeacher = classItem.teacherId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this class'
      });
    }

    // Fields that can be updated
    const updatableFields = ['name', 'description', 'subject', 'semester', 'status', 'classImage'];
    const updateData = {};

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    classItem = await Class.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('teacherId', 'name email')
     .populate('students', 'name email');

    res.json({
      success: true,
      data: classItem
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Teacher only)
const deleteClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if user is teacher of this class or admin
    const isTeacher = classItem.teacherId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this class'
      });
    }

    // Remove class from all enrolled students
    await User.updateMany(
      { _id: { $in: classItem.students } },
      { $pull: { enrolledClasses: classItem._id } }
    );

    // Delete the class
    await classItem.deleteOne();

    res.json({
      success: true,
      message: 'Class removed successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Enroll in a class using class code
// @route   POST /api/classes/enroll
// @access  Private (Students only)
const enrollInClass = async (req, res) => {
  try {
    const { classCode } = req.body;

    if (!classCode) {
      return res.status(400).json({
        success: false,
        error: 'Please provide class code'
      });
    }

    // Find class by code
    const classItem = await Class.findOne({ classCode });

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Invalid class code'
      });
    }

    // Check if class is active
    if (classItem.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'This class is not active'
      });
    }

    // Check if already enrolled
    if (classItem.students.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled in this class'
      });
    }

    // Add student to class
    classItem.students.push(req.user._id);
    await classItem.save();

    // Add class to user's enrolled classes
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledClasses: classItem._id }
    });

    // Get updated class with populated fields
    const updatedClass = await Class.findById(classItem._id)
      .populate('teacherId', 'name email')
      .populate('students', 'name email');

    res.json({
      success: true,
      message: 'Successfully enrolled in class',
      data: updatedClass
    });
  } catch (error) {
    console.error('Enroll in class error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Leave a class
// @route   POST /api/classes/:id/leave
// @access  Private (Students only)
const leaveClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if student is enrolled
    if (!classItem.students.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: 'Not enrolled in this class'
      });
    }

    // Remove student from class
    classItem.students = classItem.students.filter(
      s => s.toString() !== req.user._id.toString()
    );
    await classItem.save();

    // Remove class from user's enrolled classes
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { enrolledClasses: classItem._id }
    });

    res.json({
      success: true,
      message: 'Successfully left the class'
    });
  } catch (error) {
    console.error('Leave class error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get class students
// @route   GET /api/classes/:id/students
// @access  Private (Teacher only)
const getClassStudents = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('students', 'name email profilePicture bio');

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if user is teacher or admin
    const isTeacher = classItem.teacherId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view students'
      });
    }

    res.json({
      success: true,
      count: classItem.students.length,
      data: classItem.students
    });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get classes taught by a specific teacher
// @route   GET /api/classes/teacher/:teacherId
// @access  Private
const getTeacherClasses = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    const classes = await Class.find({ teacherId })
      .populate('students', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get class statistics
// @route   GET /api/classes/:id/stats
// @access  Private (Teacher only)
const getClassStats = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if user is teacher or admin
    const isTeacher = classItem.teacherId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view class statistics'
      });
    }

    // Get additional stats (you can expand this with assignments, submissions, etc.)
    const stats = {
      totalStudents: classItem.students.length,
      className: classItem.name,
      classCode: classItem.classCode,
      createdAt: classItem.createdAt,
      status: classItem.status
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get class stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  enrollInClass,
  leaveClass,
  getClassStudents,
  getTeacherClasses,
  getClassStats
};