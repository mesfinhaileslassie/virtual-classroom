// Assignments 
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
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Schedule,
  Grade,
  Visibility,
  Send,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useAssignments } from '../context/AssignmentContext';
import { classAPI } from '../services/api';

const Assignments = () => {
  const navigate = useNavigate();
  const { user, isStudent, isTeacher } = useAuth();
  const { getClassAssignments, loading } = useAssignments();
  
  const [classes, setClasses] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchAllAssignments();
  }, []);

  const fetchAllAssignments = async () => {
    setLoadingData(true);
    try {
      // Fetch user's classes
      const classesResponse = await classAPI.getClasses();
      const enrolledClasses = classesResponse.data.data || [];
      setClasses(enrolledClasses);

      // Fetch assignments for each class
      let assignmentsList = [];
      for (const classItem of enrolledClasses) {
        const response = await getClassAssignments(classItem._id);
        if (response.success) {
          const classAssignments = response.data.map(assignment => ({
            ...assignment,
            className: classItem.name,
            classId: classItem._id
          }));
          assignmentsList = [...assignmentsList, ...classAssignments];
        }
      }

      // Sort by due date
      assignmentsList.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setAllAssignments(assignmentsList);

    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getStatusColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) return 'error';
    const diff = due - now;
    if (diff < 24 * 60 * 60 * 1000) return 'warning';
    return 'success';
  };

  const getStatusText = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) return 'Past Due';
    const diff = due - now;
    if (diff < 24 * 60 * 60 * 1000) return 'Due Soon';
    return 'Upcoming';
  };

  if (loadingData) {
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
          All Assignments
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

      {allAssignments.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No assignments found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isTeacher ? 'Create assignments in your classes to get started!' : 'Check back later for assignments from your teachers.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {allAssignments.map((assignment) => (
            <Grid item xs={12} md={6} lg={4} key={assignment._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom>
                      {assignment.title}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Class: {assignment.className}
                  </Typography>

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
                      icon={<Grade />}
                      label={`${assignment.points} pts`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label={getStatusText(assignment.dueDate)}
                      color={getStatusColor(assignment.dueDate)}
                    />
                  </Box>

                  {isTeacher && (
                    <Typography variant="body2" color="text.secondary">
                      Submissions: {assignment.submissions?.length || 0}
                    </Typography>
                  )}
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => navigate(`/assignments/${assignment._id}`)}
                  >
                    View Details
                  </Button>
                  {isStudent && (
                    <Button
                      size="small"
                      startIcon={<Send />}
                      onClick={() => navigate(`/assignments/${assignment._id}/submit`)}
                    >
                      Submit
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Assignments;