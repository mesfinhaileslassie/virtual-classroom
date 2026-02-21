import React from 'react';
import { Container, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const TeacherDashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Teacher Dashboard
        </Typography>
        <Typography variant="h6" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">My Classes</Typography>
                <Typography variant="body2">View and manage your classes</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Create Class</Typography>
                <Typography variant="body2">Create a new class</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Pending Grades</Typography>
                <Typography variant="body2">Grade pending submissions</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TeacherDashboard;