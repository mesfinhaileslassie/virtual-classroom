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
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  Alert,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Forum as ForumIcon,
  Event as EventIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Class as ClassIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAssignments } from '../context/AssignmentContext';
import { classAPI } from '../services/api';
import { format, formatDistanceToNow } from 'date-fns';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getMySubmissions, loading } = useAssignments();
  
  const [classes, setClasses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0,
    completedAssignments: 0,
    upcomingDeadlines: 0
  });
  const [classPerformance, setClassPerformance] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      // Fetch enrolled classes
      const classesResponse = await classAPI.getClasses();
      const enrolledClasses = classesResponse.data.data || [];
      setClasses(enrolledClasses);
      
      setStats(prev => ({ ...prev, totalClasses: enrolledClasses.length }));

      // Fetch assignments and submissions for each class
      let allUpcoming = [];
      let allRecentGrades = [];
      let totalAssignments = 0;
      let pendingCount = 0;
      let sumGrades = 0;
      let gradedCount = 0;
      let classPerf = [];

      for (const classItem of enrolledClasses) {
        const submissionsResponse = await getMySubmissions(classItem._id);
        
        if (submissionsResponse.success) {
          const submissions = submissionsResponse.data || [];
          
          // Calculate class-specific stats
          let classTotal = 0;
          let classGraded = 0;
          let classSum = 0;

          submissions.forEach(item => {
            totalAssignments++;
            classTotal++;
            
            if (!item.submission) {
              pendingCount++;
              // Check if assignment is upcoming
              const dueDate = new Date(item.dueDate);
              const now = new Date();
              if (dueDate > now && dueDate - now < 7 * 24 * 60 * 60 * 1000) {
                allUpcoming.push({
                  ...item,
                  className: classItem.name,
                  classId: classItem._id
                });
              }
            }

            if (item.submission?.grade !== undefined) {
              gradedCount++;
              classGraded++;
              classSum += (item.submission.grade / item.totalPoints) * 100;
              
              // Add to recent grades
              if (item.submission.gradedAt) {
                allRecentGrades.push({
                  ...item,
                  className: classItem.name,
                  classId: classItem._id,
                  percentage: ((item.submission.grade / item.totalPoints) * 100).toFixed(1)
                });
              }
            }
          });

          // Calculate class average
          if (classGraded > 0) {
            classPerf.push({
              classId: classItem._id,
              className: classItem.name,
              average: (classSum / classGraded).toFixed(1),
              gradedCount: classGraded,
              totalCount: classTotal
            });
          }
        }
      }

      // Sort and limit
      allUpcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      allRecentGrades.sort((a, b) => new Date(b.submission?.gradedAt) - new Date(a.submission?.gradedAt));

      setUpcomingAssignments(allUpcoming.slice(0, 5));
      setRecentGrades(allRecentGrades.slice(0, 5));
      setClassPerformance(classPerf);

      setStats({
        totalClasses: enrolledClasses.length,
        totalAssignments,
        pendingAssignments: pendingCount,
        averageGrade: gradedCount > 0 ? (sumGrades / gradedCount).toFixed(1) : 0,
        completedAssignments: gradedCount,
        upcomingDeadlines: allUpcoming.length
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Navigation handlers
  const handleViewAllClasses = () => {
    navigate('/classes');
  };

  const handleViewResults = () => {
    navigate('/student/results');
  };

  const handleViewAllAssignments = () => {
    navigate('/assignments');
  };

  const handleViewDiscussions = () => {
    navigate('/discussions');
  };

  const handleClassClick = (classId) => {
    navigate(`/classes/${classId}`);
  };

  const handleAssignmentClick = (assignmentId) => {
    navigate(`/assignments/${assignmentId}`);
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
      {/* Welcome Header */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={user?.profilePicture}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  border: '3px solid white',
                  bgcolor: 'secondary.main'
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Welcome back, {user?.name}!
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Student • {user?.email}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Chip 
                icon={<SchoolIcon />} 
                label={`${stats.totalClasses} Classes`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Chip 
                icon={<GradeIcon />} 
                label={`Avg: ${stats.averageGrade}%`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ height: '100%', cursor: 'pointer' }}
            onClick={() => handleViewAllClasses()}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Classes
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {stats.totalClasses}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ height: '100%', cursor: 'pointer' }}
            onClick={() => handleViewAllAssignments()}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Assignments
                  </Typography>
                  <Typography variant="h3" color="success.main">
                    {stats.completedAssignments}/{stats.totalAssignments}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.completedAssignments / stats.totalAssignments) * 100 || 0} 
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ height: '100%', cursor: 'pointer' }}
            onClick={() => handleViewResults()}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Average Grade
                  </Typography>
                  <Typography variant="h3" color="warning.main">
                    {stats.averageGrade}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', width: 56, height: 56 }}>
                  <GradeIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.averageGrade} 
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h3" color="error.main">
                    {stats.pendingAssignments}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.light', width: 56, height: 56 }}>
                  <WarningIcon />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {stats.upcomingDeadlines} due this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Classes and Performance */}
        <Grid item xs={12} md={6}>
          {/* My Classes */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                My Classes
              </Typography>
              <Button 
                endIcon={<ArrowForwardIcon />}
                onClick={handleViewAllClasses}
              >
                View All
              </Button>
            </Box>
            
            {classes.length === 0 ? (
              <Alert severity="info">
                You haven't joined any classes yet. Use a class code to join!
              </Alert>
            ) : (
              <List>
                {classes.slice(0, 3).map((classItem) => (
                  <React.Fragment key={classItem._id}>
                    <ListItem 
                      button
                      onClick={() => handleClassClick(classItem._id)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <ClassIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={classItem.name}
                        secondary={`${classItem.subject} • ${classItem.semester}`}
                      />
                      <Chip 
                        label={classItem.classCode} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>

          {/* Class Performance */}
          {classPerformance.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Class Performance
              </Typography>
              <List>
                {classPerformance.map((perf) => (
                  <ListItem key={perf.classId}>
                    <ListItemText
                      primary={perf.className}
                      secondary={`${perf.gradedCount}/${perf.totalCount} assignments graded`}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={perf.average} 
                        sx={{ width: 100, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {perf.average}%
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        {/* Right Column - Assignments and Grades */}
        <Grid item xs={12} md={6}>
          {/* Upcoming Assignments */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <ScheduleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Upcoming Assignments
            </Typography>
            
            {upcomingAssignments.length === 0 ? (
              <Alert severity="success">
                No upcoming assignments! You're all caught up.
              </Alert>
            ) : (
              <List>
                {upcomingAssignments.map((assignment) => (
                  <ListItem 
                    key={assignment.assignmentId}
                    button
                    onClick={() => handleAssignmentClick(assignment.assignmentId)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.light' }}>
                        <AssignmentIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={assignment.assignmentTitle}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {assignment.className}
                          </Typography>
                          {` • Due ${formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}`}
                        </>
                      }
                    />
                    <Badge badgeContent="!" color="error">
                      <Chip 
                        label={format(new Date(assignment.dueDate), 'MMM dd')}
                        size="small"
                        color="warning"
                      />
                    </Badge>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {/* Recent Grades */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <GradeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Grades
            </Typography>
            
            {recentGrades.length === 0 ? (
              <Alert severity="info">
                No grades posted yet. Check back later!
              </Alert>
            ) : (
              <List>
                {recentGrades.map((grade) => (
                  <ListItem 
                    key={grade.assignmentId}
                    button
                    onClick={() => handleAssignmentClick(grade.assignmentId)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'success.light' }}>
                        <CheckCircleIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={grade.assignmentTitle}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {grade.className}
                          </Typography>
                          {` • Grade: ${grade.submission?.grade}/${grade.totalPoints} (${grade.percentage}%)`}
                        </>
                      }
                    />
                    <Chip 
                      label={grade.submission?.grade ? 'Graded' : 'Pending'}
                      color={grade.submission?.grade ? 'success' : 'default'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              startIcon={<ClassIcon />}
              onClick={handleViewAllClasses}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Browse Classes
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<GradeIcon />}
              onClick={handleViewResults}
              fullWidth
              sx={{ py: 1.5 }}
            >
              View Results
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<AssignmentIcon />}
              onClick={handleViewAllAssignments}
              fullWidth
              sx={{ py: 1.5 }}
            >
              All Assignments
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<ForumIcon />}
              onClick={handleViewDiscussions}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Discussions
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Join Class Section */}
      {classes.length === 0 && (
        <Paper sx={{ p: 4, mt: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Join Your First Class
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Get started by joining a class using the class code provided by your teacher.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleViewAllClasses}
          >
            Join a Class
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default StudentDashboard;