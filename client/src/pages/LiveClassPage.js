import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LiveClass from '../components/live/LiveClass';
import { Container, Paper, Typography, Button, Box, CircularProgress } from '@mui/material';
import { classAPI } from '../services/api';

const LiveClassPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher } = useAuth();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      const response = await classAPI.getClassById(id);
      setClassData(response.data.data);
    } catch (error) {
      console.error('Error fetching class:', error);
      setError('Failed to load class details');
    } finally {
      setLoading(false);
    }
  };

  const handleEndClass = () => {
    navigate(`/classes/${id}`);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !classData) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error
          </Typography>
          <Typography variant="body1" paragraph>
            {error || 'Class not found'}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/classes')}>
            Back to Classes
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <LiveClass 
      classId={id}
      className={classData.name}
      isTeacher={isTeacher}
      onEnd={handleEndClass}
    />
  );
};

export default LiveClassPage;