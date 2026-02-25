import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Add,
  ExitToApp as LeaveIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { classAPI } from '../services/api';
import toast from 'react-hot-toast';

const Classes = () => {
  const navigate = useNavigate();
  const { user, isTeacher, isStudent } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    subject: '',
    semester: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getClasses();
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    try {
      const response = await classAPI.createClass(newClass);
      toast.success('Class created successfully!');
      setOpenDialog(false);
      setNewClass({ name: '', description: '', subject: '', semester: '' });
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create class');
    }
  };

  const handleEnrollClass = async () => {
    if (!classCode) {
      toast.error('Please enter a class code');
      return;
    }

    try {
      await classAPI.enrollInClass(classCode);
      toast.success('Successfully enrolled in class!');
      setClassCode('');
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to enroll');
    }
  };

  const handleLeaveClass = async (classId) => {
    try {
      await classAPI.leaveClass(classId);
      toast.success('Left class successfully');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to leave class');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header with Back to Dashboard button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Classes
          </Typography>
          
          {isStudent && (
            <Button
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/student/dashboard')}
              sx={{ ml: 2 }}
            >
              Back to Dashboard
            </Button>
          )}
          
          {isTeacher && (
            <Button
              variant="outlined"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/teacher/dashboard')}
              sx={{ ml: 2 }}
            >
              Back to Dashboard
            </Button>
          )}
        </Box>

        {/* Action Buttons */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {isTeacher && (
            <Grid item>
              <Button
                variant="contained"
                onClick={() => setOpenDialog(true)}
                startIcon={<Add />}
              >
                Create New Class
              </Button>
            </Grid>
          )}
          {isStudent && (
            <Grid item>
              <TextField
                size="small"
                label="Enter Class Code"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                sx={{ mr: 1, width: 200 }}
              />
              <Button
                variant="contained"
                onClick={handleEnrollClass}
                startIcon={<SchoolIcon />}
              >
                Join Class
              </Button>
            </Grid>
          )}
        </Grid>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No classes found.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isTeacher && ' Click "Create New Class" to get started!'}
              {isStudent && ' Use a class code to join a class.'}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {classes.map((classItem) => (
              <Grid item xs={12} md={6} lg={4} key={classItem._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {classItem.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {classItem.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip
                        label={`Code: ${classItem.classCode}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={classItem.subject}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={classItem.semester}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Teacher: {classItem.teacherId?.name || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Students: {classItem.students?.length || 0}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/classes/${classItem._id}`)}
                    >
                      View Details
                    </Button>
                    {isStudent && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<LeaveIcon />}
                        onClick={() => handleLeaveClass(classItem._id)}
                      >
                        Leave
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Create Class Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Subject"
            fullWidth
            value={newClass.subject}
            onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Semester"
            fullWidth
            value={newClass.semester}
            onChange={(e) => setNewClass({ ...newClass, semester: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newClass.description}
            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateClass} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Classes;