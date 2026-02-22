// AssignmentList 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Button,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Grading,
  Schedule,
  CheckCircle,
  Warning,
  Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useAssignments } from '../../context/AssignmentContext';
import toast from 'react-hot-toast';

const AssignmentList = ({ classId }) => {
  const navigate = useNavigate();
  const { user, isTeacher, isStudent } = useAuth();
  const {
    assignments,
    loading,
    getClassAssignments,
    deleteAssignment
  } = useAssignments();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, graded
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, title, points

  useEffect(() => {
    if (classId) {
      console.log('📚 AssignmentList fetching for class:', classId);
      getClassAssignments(classId);
    }
  }, [classId]);

  const handleMenuOpen = (event, assignment) => {
    setAnchorEl(event.currentTarget);
    setSelectedAssignment(assignment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAssignment(null);
  };

  const handleEdit = () => {
    navigate(`/assignments/edit/${selectedAssignment._id}`);
    handleMenuClose();
  };

  const handleView = () => {
    navigate(`/assignments/${selectedAssignment._id}`);
    handleMenuClose();
  };

  const handleGrade = () => {
    navigate(`/assignments/${selectedAssignment._id}/grade`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    const result = await deleteAssignment(selectedAssignment._id);
    if (result.success) {
      setDeleteDialogOpen(false);
    }
    handleMenuClose();
  };

  const getStatusColor = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (assignment.status === 'draft') return 'default';
    if (dueDate < now) return 'error';
    const timeDiff = dueDate - now;
    if (timeDiff < 24 * 60 * 60 * 1000) return 'warning'; // Less than 24 hours
    return 'success';
  };

  const getStatusText = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (assignment.status === 'draft') return 'Draft';
    if (dueDate < now) return 'Past Due';
    const timeDiff = dueDate - now;
    if (timeDiff < 24 * 60 * 60 * 1000) return 'Due Soon';
    return 'Upcoming';
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return new Date(assignment.dueDate) > new Date() && assignment.status === 'published';
    }
    if (filter === 'past') {
      return new Date(assignment.dueDate) < new Date() && assignment.status === 'published';
    }
    if (filter === 'draft' && isTeacher) {
      return assignment.status === 'draft';
    }
    return true;
  });

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'points') {
      return b.points - a.points;
    }
    return 0;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label="All"
                onClick={() => setFilter('all')}
                color={filter === 'all' ? 'primary' : 'default'}
                clickable
              />
              <Chip
                label="Upcoming"
                onClick={() => setFilter('upcoming')}
                color={filter === 'upcoming' ? 'primary' : 'default'}
                clickable
              />
              <Chip
                label="Past Due"
                onClick={() => setFilter('past')}
                color={filter === 'past' ? 'primary' : 'default'}
                clickable
              />
              {isTeacher && (
                <Chip
                  label="Drafts"
                  onClick={() => setFilter('draft')}
                  color={filter === 'draft' ? 'primary' : 'default'}
                  clickable
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Chip
                label="Sort by Due Date"
                onClick={() => setSortBy('dueDate')}
                color={sortBy === 'dueDate' ? 'secondary' : 'default'}
                clickable
              />
              <Chip
                label="Sort by Title"
                onClick={() => setSortBy('title')}
                color={sortBy === 'title' ? 'secondary' : 'default'}
                clickable
              />
              <Chip
                label="Sort by Points"
                onClick={() => setSortBy('points')}
                color={sortBy === 'points' ? 'secondary' : 'default'}
                clickable
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Assignment List */}
      {sortedAssignments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No assignments found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isTeacher 
              ? 'Click "Create Assignment" to get started!'
              : 'Check back later for assignments from your teacher.'
            }
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sortedAssignments.map((assignment) => (
            <Grid item xs={12} md={6} lg={4} key={assignment._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentIcon color="primary" />
                      <Typography variant="h6" gutterBottom>
                        {assignment.title}
                      </Typography>
                    </Box>
                    {isTeacher && (
                      <IconButton onClick={(e) => handleMenuOpen(e, assignment)}>
                        <MoreVert />
                      </IconButton>
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {assignment.description?.substring(0, 100)}
                    {assignment.description?.length > 100 && '...'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      size="small"
                      icon={<Schedule />}
                      label={format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={`${assignment.points} pts`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={getStatusText(assignment)}
                      color={getStatusColor(assignment)}
                    />
                  </Box>

                  {isStudent && assignment.submissions?.length > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      You have submitted this assignment
                      {assignment.submissions[0]?.grade && (
                        <Typography variant="body2">
                          Grade: {assignment.submissions[0].grade}/{assignment.points}
                        </Typography>
                      )}
                    </Alert>
                  )}

                  {isTeacher && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Submissions: {assignment.submissions?.length || 0} / {assignment.gradedCount || 0} graded
                      </Typography>
                      {assignment.submissions?.length > 0 && (
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/assignments/${assignment._id}/grade`)}
                          sx={{ mt: 1 }}
                        >
                          View {assignment.submissions.length} Submission{assignment.submissions.length > 1 ? 's' : ''}
                        </Button>
                      )}
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/assignments/${assignment._id}`)}
                  >
                    View
                  </Button>
                  {isStudent && assignment.status === 'published' && (
                    <Button
                      size="small"
                      startIcon={<AssignmentIcon />}
                      onClick={() => navigate(`/assignments/${assignment._id}/submit`)}
                    >
                      Submit
                    </Button>
                  )}
                  {isTeacher && (
                    <Button
                      size="small"
                      startIcon={<Grading />}
                      onClick={() => navigate(`/assignments/${assignment._id}/grade`)}
                    >
                      Grade
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Menu for teacher actions */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleView}>
          <Visibility sx={{ mr: 1 }} /> View
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleGrade}>
          <Grading sx={{ mr: 1 }} /> Grade
        </MenuItem>
        <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Assignment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedAssignment?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AssignmentList;