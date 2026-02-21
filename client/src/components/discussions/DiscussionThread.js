import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Divider,
  TextField,
  Button,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  ThumbUpAlt,
  ThumbUpAltOutlined,
  Comment,
  MoreVert,
  Delete,
  PushPin,
  Announcement
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useDiscussions } from '../../context/DiscussionContext';
import { useParams, useNavigate } from 'react-router-dom';

const DiscussionThread = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentDiscussion,
    comments,
    loading,
    getDiscussionById,
    addComment,
    toggleLike,
    deleteDiscussion
  } = useDiscussions();

  const [newComment, setNewComment] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [commentAnchorEl, setCommentAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    if (id) {
      getDiscussionById(id);
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment(id, newComment);
    setNewComment('');
  };

  const handleLike = () => {
    toggleLike(id);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this discussion?')) {
      await deleteDiscussion(id);
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading discussion...</Typography>
      </Box>
    );
  }

  if (!currentDiscussion) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Discussion not found</Typography>
      </Box>
    );
  }

  const isLiked = currentDiscussion.likes?.some(like => 
    like._id === user?._id || like === user?._id
  );
  const isAuthor = currentDiscussion.author?._id === user?._id;
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      {/* Discussion Header */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            {currentDiscussion.isAnnouncement && (
              <Chip 
                icon={<Announcement />} 
                label="Announcement" 
                color="secondary" 
                size="small" 
                sx={{ mb: 2 }}
              />
            )}
            {currentDiscussion.isPinned && (
              <Chip 
                icon={<PushPin />} 
                label="Pinned" 
                color="primary" 
                size="small" 
                sx={{ ml: 1, mb: 2 }}
              />
            )}
            <Typography variant="h4" gutterBottom>
              {currentDiscussion.title}
            </Typography>
          </Box>
          
          {(isAuthor || isTeacher) && (
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          )}
          
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <Delete sx={{ mr: 1 }} /> Delete
            </MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar src={currentDiscussion.author?.profilePicture}>
            {currentDiscussion.authorName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">
              {currentDiscussion.authorName || currentDiscussion.author?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentDiscussion.authorRole} • 
              {formatDistanceToNow(new Date(currentDiscussion.createdAt), { addSuffix: true })} • 
              {currentDiscussion.views} views
            </Typography>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {currentDiscussion.content}
        </Typography>

        {currentDiscussion.tags && currentDiscussion.tags.length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {currentDiscussion.tags.map(tag => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton onClick={handleLike} color={isLiked ? 'primary' : 'default'}>
            {isLiked ? <ThumbUpAlt /> : <ThumbUpAltOutlined />}
          </IconButton>
          <Typography>{currentDiscussion.likes?.length || 0} likes</Typography>
          
          <IconButton disabled>
            <Comment />
          </IconButton>
          <Typography>{comments.length} comments</Typography>
        </Box>
      </Paper>

      {/* Comments Section */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Comments ({comments.length})
        </Typography>

        {/* New Comment Form */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Avatar src={user?.profilePicture} sx={{ width: 40, height: 40 }}>
            {user?.name?.charAt(0)}
          </Avatar>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button 
            variant="contained" 
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            sx={{ alignSelf: 'flex-end' }}
          >
            Post
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Comments List */}
        <List>
          {comments.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No comments yet. Be the first to comment!
            </Typography>
          ) : (
            comments.map((comment, index) => (
              <React.Fragment key={comment._id || index}>
                <CommentItem 
                  comment={comment} 
                  user={user}
                  isTeacher={isTeacher}
                />
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

// Comment Item Component
const CommentItem = ({ comment, user, isTeacher }) => {
  const isAuthor = comment.author?._id === user?._id;
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <ListItem alignItems="flex-start" sx={{ py: 2 }}>
      <ListItemAvatar>
        <Avatar src={comment.author?.profilePicture}>
          {comment.authorName?.charAt(0)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2">
              {comment.authorName || comment.author?.name}
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {comment.authorRole} • 
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </Typography>
            </Typography>
            
            {(isAuthor || isTeacher) && (
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVert fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
        secondary={
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
            {comment.content}
          </Typography>
        }
      />
      
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => {}} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </ListItem>
  );
};

export default DiscussionThread;