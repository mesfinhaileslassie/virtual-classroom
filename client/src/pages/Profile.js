import React from 'react';
import { Container, Typography, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        {user && (
          <>
            <Typography variant="body1">Name: {user.name}</Typography>
            <Typography variant="body1">Email: {user.email}</Typography>
            <Typography variant="body1">Role: {user.role}</Typography>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;