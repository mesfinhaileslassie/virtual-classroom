import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Tab,
  Tabs,
  Badge
} from '@mui/material';
import {
  ThumbUpAlt,
  ThumbUpAltOutlined,
  Comment,
  PushPin,
  Announcement,
  Delete,
  Edit
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useDiscussions } from '../../context/DiscussionContext';
import { useNavigate } from 'react-router-dom';

const DiscussionList = ({ classId, isTeacher, isEnrolled }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    discussions,
    loading,
    getClassDiscussions,
    createDiscussion,
    toggleLike,
    deleteDiscussion
  } = useDiscussions();

  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    tags: '',
    isAnnouncement: false
  });

  useEffect(() => {
    if (classId) {
      getClassDiscussions(classId);
    }
  }, [classId]);

  const handleCreateDiscussion = async () => {
    const result = await createDiscussion({
      ...newDiscussion,
      classId,
      tags: newDiscussion.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });
    
    if (result.success) {
      setOpenDialog(false);
      setNewDiscussion({ title: '', content: '', tags: '', isAnnouncement: false });
    }
  };

  const filteredDiscussions = discussions.filter(d => {
    if (tabValue === 0) return true; // All
    if (tabValue === 1) return d.isAnnouncement; // Announcements
    if (tabValue === 2) return !d.isAnnouncement; // General
    return true;
  });

  const pinnedDiscussions = filteredDiscussions.filter(d => d.isPinned);
  const regularDiscussions = filteredDiscussions.filter(d => !d.isPinned);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Discussions</Typography>
        {(isTeacher || isEnrolled) && (
          <Button 
            variant="contained" 
            onClick={() => setOpenDialog(true)}
            startIcon={<Edit />}
          >
            New Discussion
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="All" />
        <Tab label="Announcements" />
        <Tab label="General" />
      </Tabs>

      {/* Discussions List */}
      {loading ? (
        <Typography>Loading discussions...</Typography>
      ) : filteredDiscussions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No discussions yet. {isTeacher || isEnrolled ? 'Start a new discussion!' : ''}
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Pinned Discussions */}
          {pinnedDiscussions.length > 0 && (
            <>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                📌 Pinned
              </Typography>
              <List sx={{ mb: 3 }}>
                {pinnedDiscussions.map((discussion) => (
                  <DiscussionItem
                    key={discussion._id}
                    discussion={discussion}
                    user={user}
                    isTeacher={isTeacher}
                    onLike={toggleLike}
                    onDelete={deleteDiscussion}
                    onClick={() => navigate(`/discussions/${discussion._id}`)}
                  />
                ))}
              </List>
            </>
          )}

          {/* Regular Discussions */}
          {regularDiscussions.length > 0 && (
            <>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Recent Discussions
              </Typography>
              <List>
                {regularDiscussions.map((discussion) => (
                  <DiscussionItem
                    key={discussion._id}
                    discussion={discussion}
                    user={user}
                    isTeacher={isTeacher}
                    onLike={toggleLike}
                    onDelete={deleteDiscussion}
                    onClick={() => navigate(`/discussions/${discussion._id}`)}
                  />
                ))}
              </List>
            </>
          )}
        </>
      )}

      {/* Create Discussion Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Discussion</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newDiscussion.title}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
            required
          />
          
          {isTeacher && (
            <FormControl fullWidth margin="dense">
              <InputLabel>Type</InputLabel>
              <Select
                value={newDiscussion.isAnnouncement ? 'announcement' : 'discussion'}
                label="Type"
                onChange={(e) => setNewDiscussion({ 
                  ...newDiscussion, 
                  isAnnouncement: e.target.value === 'announcement' 
                })}
              >
                <MenuItem value="discussion">General Discussion</MenuItem>
                <MenuItem value="announcement">📢 Announcement</MenuItem>
              </Select>
            </FormControl>
          )}

          <TextField
            margin="dense"
            label="Tags (comma separated)"
            fullWidth
            value={newDiscussion.tags}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, tags: e.target.value })}
            placeholder="homework, question, project"
          />

          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={newDiscussion.content}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateDiscussion} 
            variant="contained"
            disabled={!newDiscussion.title || !newDiscussion.content}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Discussion Item Component
const DiscussionItem = ({ discussion, user, isTeacher, onLike, onDelete, onClick }) => {
  const isLiked = discussion.likes?.some(like => like._id === user?._id || like === user?._id);
  const isAuthor = discussion.author?._id === user?._id || discussion.author === user?._id;

  return (
    <>
      <ListItem 
        alignItems="flex-start" 
        sx={{ 
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
          position: 'relative'
        }}
        onClick={onClick}
      >
        <ListItemAvatar>
          <Avatar src={discussion.author?.profilePicture}>
            {discussion.authorName?.charAt(0) || discussion.author?.name?.charAt(0)}
          </Avatar>
        </ListItemAvatar>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {discussion.isPinned && <PushPin fontSize="small" color="primary" />}
              {discussion.isAnnouncement && (
                <Chip 
                  icon={<Announcement />} 
                  label="Announcement" 
                  size="small" 
                  color="secondary"
                />
              )}
              <Typography variant="subtitle1" component="span">
                {discussion.title}
              </Typography>
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary" component="span">
                {discussion.authorName || discussion.author?.name} • 
                {discussion.authorRole && ` ${discussion.authorRole} • `}
                {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {discussion.content?.substring(0, 150)}
                {discussion.content?.length > 150 && '...'}
              </Typography>

              {discussion.tags && discussion.tags.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {discussion.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              )}

              <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <IconButton 
                  size="small" 
                  onClick={(e) => { e.stopPropagation(); onLike(discussion._id); }}
                  color={isLiked ? 'primary' : 'default'}
                >
                  {isLiked ? <ThumbUpAlt fontSize="small" /> : <ThumbUpAltOutlined fontSize="small" />}
                </IconButton>
                <Typography variant="caption">{discussion.likes?.length || 0}</Typography>

                <IconButton size="small" disabled>
                  <Comment fontSize="small" />
                </IconButton>
                <Typography variant="caption">{discussion.commentCount || 0}</Typography>

                {(isAuthor || isTeacher) && (
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={(e) => { e.stopPropagation(); onDelete(discussion._id); }}
                    sx={{ ml: 'auto' }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          }
        />
      </ListItem>
      <Divider variant="inset" component="li" />
    </>
  );
};

export default DiscussionList;