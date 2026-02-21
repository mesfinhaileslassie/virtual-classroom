// Discussion routes 
const express = require('express');
const router = express.Router();
const {
  createDiscussion,
  getClassDiscussions,
  getDiscussionById,
  addComment,
  toggleLike,
  deleteDiscussion
} = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(createDiscussion);

router.get('/class/:classId', getClassDiscussions);

router.route('/:id')
  .get(getDiscussionById)
  .delete(deleteDiscussion);

router.post('/:id/comments', addComment);
router.put('/:id/like', toggleLike);

module.exports = router;