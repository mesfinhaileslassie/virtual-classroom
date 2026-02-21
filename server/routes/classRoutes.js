const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Public routes (within protected)
router.route('/')
  .get(getClasses)
  .post(authorize('teacher', 'admin'), createClass);

// Enroll route (special case - doesn't need class ID in URL)
router.post('/enroll', authorize('student'), enrollInClass);

// Teacher classes route
router.get('/teacher/:teacherId', getTeacherClasses);

// Routes with ID parameter
router.route('/:id')
  .get(getClassById)
  .put(authorize('teacher', 'admin'), updateClass)
  .delete(authorize('teacher', 'admin'), deleteClass);

// Class students route
router.get('/:id/students', authorize('teacher', 'admin'), getClassStudents);

// Class stats route
router.get('/:id/stats', authorize('teacher', 'admin'), getClassStats);

// Leave class route
router.post('/:id/leave', authorize('student'), leaveClass);

module.exports = router;