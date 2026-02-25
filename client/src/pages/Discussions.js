import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Forum as ForumIcon,
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Dashboard as DashboardIcon,
  Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useDiscussions } from '../context/DiscussionContext';
import { classAPI } from '../services/api';

const Discussions = () => {
  const navigate = useNavigate();
  const { user, isStudent, isTeacher } = useAuth();
  const { getClassDiscussions, createDiscussion, toggleLike } = useDiscussions();
  
  const [classes, setClasses] = useState([]);
  const [allDiscussions, setAllDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    tags: ''
  });

  useEffect(() => {
    fetchAllDiscussions();
  }, []);

  const fetchAllDiscussions = async () => {
    setLoading(true);
    try {
      // Fetch user's classes
      const classesResponse = await classAPI.getClasses();
      const enrolledClasses = classesResponse.data.data || [];
      setClasses(enrolledClasses);

      // Fetch discussions for each class
      let discussionsList = [];
      for (const classItem of enrolledClasses) {
        const response = await getClassDiscussions(classItem._id);
        if (response.success) {
          const classDiscussions = (response.data || []).map(discussion => ({
            ...discussion,
            className: classItem.name,
            classId: classItem._id
          }));
          discussionsList = [...discussionsList, ...classDiscussions];
        }
      }

      // Sort by date (newest first)
      discussionsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllDiscussions(discussionsList);

    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }

    const discussionData = {
      title: newDiscussion.title,
      content: newDiscussion.content,
      classId: selectedClass,
      tags: newDiscussion.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    const result = await createDiscussion(discussionData);
    if (result.success) {
      setOpenDialog(false);
      setNewDiscussion({ title: '', content: '', tags: '' });
      setSelectedClass('');
      fetchAllDiscussions();
    }
  };

  const handleLike = async (discussionId) => {
    await toggleLike(discussionId);
    // Refresh to show updated likes
    fetchAllDiscussions();
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Back to Dashboard button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Discussions
        </Typography>
        
        {isStudent && (
          <Button
            variant="outlined"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/student/dashboard')}
          >
            Back to Dashboard
          </Button>
        )}
        
        {isTeacher && (
          <Button
            variant="outlined"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/teacher/dashboard')}
          >
            Back to Dashboard
          </Button>
        )}
      </Box>

      {/* New Discussion Button */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Start New Discussion
        </Button>
      </Box>

      {allDiscussions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ForumIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No discussions yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Be the first to start a discussion!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {allDiscussions.map((discussion) => (
            <Grid item xs={12} key={discussion._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar src={discussion.author?.profilePicture}>
                      {discussion.authorName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {discussion.authorName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {discussion.authorRole} • {discussion.className} • {formatDistanceToNow(new Date(discussion.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {discussion.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {discussion.content?.substring(0, 200)}
                    {discussion.content?.length > 200 && '...'}
                  </Typography>

                  {discussion.tags && discussion.tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                      {discussion.tags.map(tag => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                      size="small"
                      startIcon={discussion.likes?.some(l => l === user?._id) ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                      onClick={() => handleLike(discussion._id)}
                    >
                      {discussion.likes?.length || 0}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<CommentIcon />}
                      onClick={() => navigate(`/discussions/${discussion._id}`)}
                    >
                      {discussion.comments?.length || 0} Comments
                    </Button>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/discussions/${discussion._id}`)}
                  >
                    View Discussion
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* New Discussion Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Start New Discussion</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="dense"
            label="Select Class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="">Select a class</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </TextField>

          <TextField
            margin="dense"
            label="Title"
            fullWidth
            value={newDiscussion.title}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
          />

          <TextField
            margin="dense"
            label="Tags (comma separated)"
            fullWidth
            value={newDiscussion.tags}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, tags: e.target.value })}
            placeholder="homework, question, help"
          />

          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={newDiscussion.content}
            onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateDiscussion} 
            variant="contained"
            disabled={!selectedClass || !newDiscussion.title || !newDiscussion.content}
          >
            Create Discussion
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Discussions;