import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { classAPI } from '../services/api';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ForumIcon from '@mui/icons-material/Forum';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import ChatIcon from '@mui/icons-material/Chat';
import toast from 'react-hot-toast';

// Import components
import DiscussionList from '../components/discussions/DiscussionList';
import ClassChat from '../components/common/ClassChat';

const ClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher, isStudent } = useAuth();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      const response = await classAPI.getClassById(id);
      setClassData(response.data.data);
    } catch (error) {
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

  if (loading) return <Container><Typography>Loading...</Typography></Container>;
  if (!classData) return <Container><Typography>Class not found</Typography></Container>;

  const isEnrolled = classData.students?.some(s => s._id === user?._id || s === user?._id);
  const isOwner = classData.teacherId?._id === user?._id || classData.teacherId === user?._id;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
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
              <Typography variant="h6" gutterBottom>Assignments</Typography>
              {isOwner && (
                <Button variant="contained" sx={{ mb: 2 }}>
                  Create Assignment
                </Button>
              )}
              <Paper sx={{ p: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  No assignments yet.
                </Typography>
              </Paper>
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
                      <Avatar sx={{ mr: 2 }}>{student.name?.charAt(0)}</Avatar>
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

        {/* Action Buttons */}
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
      </Box>
    </Container>
  );
};

export default ClassDetail;