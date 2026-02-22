// Assignment routes 
const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getClassAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
  getMySubmissions,
  getAssignmentStats
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get student's submissions for a class
router.get('/student/my-submissions/:classId', authorize('student'), getMySubmissions);

// Get assignments for a class
router.get('/class/:classId', getClassAssignments);

// Get assignment stats (teacher only)
router.get('/:id/stats', authorize('teacher', 'admin'), getAssignmentStats);

// Assignment CRUD
router.route('/')
  .post(authorize('teacher', 'admin'), createAssignment);

router.route('/:id')
  .get(getAssignmentById)
  .put(authorize('teacher', 'admin'), updateAssignment)
  .delete(authorize('teacher', 'admin'), deleteAssignment);

// Submit assignment (students)
router.post('/:id/submit', authorize('student'), submitAssignment);

// Grade submission (teacher)
router.put('/:assignmentId/grade/:studentId', authorize('teacher', 'admin'), gradeSubmission);

module.exports = router;