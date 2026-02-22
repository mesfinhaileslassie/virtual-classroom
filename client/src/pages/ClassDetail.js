import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  Forum as ForumIcon,
  Announcement as AnnouncementIcon,
  Chat as ChatIcon,
  Add,
  ArrowBack
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { classAPI } from '../services/api';
import DiscussionList from '../components/discussions/DiscussionList';
import ClassChat from '../components/common/ClassChat';
import AssignmentList from '../components/assignments/AssignmentList';
import toast from 'react-hot-toast';

const ClassDetail = () => {
  // Get the ID from URL params
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher, isStudent } = useAuth();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Check if ID exists
  useEffect(() => {
    console.log('🔍 Class ID from URL:', id);
    
    if (!id || id === 'undefined') {
      console.error('❌ Invalid class ID:', id);
      toast.error('Invalid class ID');
      navigate('/classes');
      return;
    }
    
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      console.log('📡 Fetching class with ID:', id);
      const response = await classAPI.getClassById(id);
      console.log('✅ Class data received:', response.data);
      setClassData(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching class:', error);
      toast.error('Failed to load class details');
      navigate('/classes');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveClass = async () => {
    if (window.confirm('Are you sure you want to leave this class?')) {
      try {
        await classAPI.leaveClass(id);
        toast.success('Left class successfully');
        navigate('/classes');
      } catch (error) {
        toast.error('Failed to leave class');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateAssignment = () => {
    // Validate ID before navigating
    if (!id || id === 'undefined') {
      console.error('❌ Cannot create assignment: invalid class ID', id);
      toast.error('Class ID is invalid');
      return;
    }
    
    console.log('📝 Navigating to create assignment with classId:', id);
    console.log('📝 Navigation URL:', `/assignments/create/${id}`);
    
    // Navigate to create assignment with classId parameter
    navigate(`/assignments/create/${id}`);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!classData) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Class not found</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/classes')}
          sx={{ mt: 2 }}
        >
          Back to Classes
        </Button>
      </Container>
    );
  }

  const isEnrolled = classData.students?.some(s => 
    s._id === user?._id || s === user?._id
  );
  const isOwner = classData.teacherId?._id === user?._id || 
                  classData.teacherId === user?._id;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Debug Info - Remove after fixing */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: '#f0f0f0' }}>
        <Typography variant="body2">
          <strong>Debug:</strong> Class ID: {id} | Valid: {id && id !== 'undefined' ? '✅' : '❌'}
        </Typography>
      </Paper>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/classes')}
        sx={{ mb: 2 }}
      >
        Back to Classes
      </Button>

      {/* Header */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {classData.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {classData.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={`Code: ${classData.classCode}`} color="primary" />
          <Chip label={classData.subject} />
          <Chip label={classData.semester} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src={classData.teacherId?.profilePicture}>
            {classData.teacherId?.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">Teacher</Typography>
            <Typography variant="body2">{classData.teacherId?.name}</Typography>
            <Typography variant="caption">{classData.teacherId?.email}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<AnnouncementIcon />} label="Announcements" />
          <Tab icon={<AssignmentIcon />} label="Assignments" />
          <Tab icon={<ForumIcon />} label="Discussions" />
          <Tab icon={<GroupIcon />} label="Students" />
          <Tab icon={<ChatIcon />} label="Live Chat" />
        </Tabs>

        {/* Announcements Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Announcements</Typography>
            {isOwner && (
              <Button variant="contained" sx={{ mb: 2 }}>
                Post Announcement
              </Button>
            )}
            <Paper sx={{ p: 2 }}>
              <Typography variant="body1" color="text.secondary">
                No announcements yet.
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Assignments Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Assignments</Typography>
              {isOwner && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleCreateAssignment}
                >
                  Create Assignment
                </Button>
              )}
              


            </Box>
            <AssignmentList classId={id} />
          </Box>
        )}

        


        {/* Discussions Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <DiscussionList 
              classId={id} 
              isTeacher={isOwner} 
              isEnrolled={isEnrolled}
            />
          </Box>
        )}

        {/* Students Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Enrolled Students ({classData.students?.length || 0})
            </Typography>
            <List>
              {classData.students?.map((student) => (
                <React.Fragment key={student._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar src={student.profilePicture}>
                        {student.name?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={student.name}
                      secondary={student.email}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {(!classData.students || classData.students.length === 0) && (
                <ListItem>
                  <ListItemText primary="No students enrolled yet" />
                </ListItem>
              )}
            </List>
          </Box>
        )}

        {/* Live Chat Tab */}
        {tabValue === 4 && (
          <Box sx={{ p: 3 }}>
            <ClassChat classId={id} className={classData.name} />
          </Box>
        )}
      </Paper>

      {/* Leave Class Button */}
      {isStudent && isEnrolled && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleLeaveClass}
          >
            Leave Class
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ClassDetail;