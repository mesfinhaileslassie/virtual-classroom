// Discussion controller 
const Discussion = require('../models/Discussion');
const Class = require('../models/Class');

// @desc    Create a new discussion
// @route   POST /api/discussions
// @access  Private
const createDiscussion = async (req, res) => {
  try {
    const { title, content, classId, tags, isAnnouncement } = req.body;

    // Check if class exists and user has access
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Check if user is enrolled or is teacher
    const isEnrolled = classItem.students.includes(req.user._id);
    const isTeacher = classItem.teacherId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isEnrolled && !isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to post in this class'
      });
    }

    // Only teachers can make announcements
    if (isAnnouncement && !isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only teachers can create announcements'
      });
    }

    const discussion = await Discussion.create({
      title,
      content,
      classId,
      author: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      tags: tags || [],
      isAnnouncement: isAnnouncement || false
    });

    res.status(201).json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all discussions for a class
// @route   GET /api/discussions/class/:classId
// @access  Private
const getClassDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find({ classId: req.params.classId })
      .populate('author', 'name email profilePicture role')
      .populate('comments.author', 'name email profilePicture role')
      .sort('-isPinned -lastActivity');

    res.json({
      success: true,
      count: discussions.length,
      data: discussions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single discussion
// @route   GET /api/discussions/:id
// @access  Private
const getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name email profilePicture role')
      .populate('comments.author', 'name email profilePicture role');

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    // Increment view count
    discussion.views += 1;
    await discussion.save();

    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add comment to discussion
// @route   POST /api/discussions/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    const comment = {
      content: req.body.content,
      author: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      createdAt: Date.now()
    };

    discussion.comments.push(comment);
    discussion.lastActivity = Date.now();
    await discussion.save();

    // Populate the new comment
    await discussion.populate('comments.author', 'name email profilePicture role');

    res.json({
      success: true,
      data: discussion.comments[discussion.comments.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Like/unlike discussion
// @route   PUT /api/discussions/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    const likeIndex = discussion.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      // Like
      discussion.likes.push(req.user._id);
    } else {
      // Unlike
      discussion.likes.splice(likeIndex, 1);
    }

    await discussion.save();

    res.json({
      success: true,
      likes: discussion.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete discussion (teacher or author only)
// @route   DELETE /api/discussions/:id
// @access  Private
const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    // Check if user is author, teacher of the class, or admin
    const classItem = await Class.findById(discussion.classId);
    const isAuthor = discussion.author.toString() === req.user._id.toString();
    const isTeacher = classItem && classItem.teacherId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this discussion'
      });
    }

    await discussion.deleteOne();

    res.json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createDiscussion,
  getClassDiscussions,
  getDiscussionById,
  addComment,
  toggleLike,
  deleteDiscussion
};