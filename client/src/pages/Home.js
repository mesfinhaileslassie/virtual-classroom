import React from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent, CardActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Virtual Classrooms',
      description: 'Create and join virtual classrooms with unique class codes'
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Student Management',
      description: 'Track student enrollment, grades, and progress'
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'Assignments & Grading',
      description: 'Create assignments, accept submissions, and provide feedback'
    }
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', my: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Virtual Classroom
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          An online platform for teachers and students to connect, learn, and grow together
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          {!isAuthenticated ? (
            <>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </>
          ) : (
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/classes')}
            >
              Go to Dashboard
            </Button>
          )}
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ my: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;