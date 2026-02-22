import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Rating
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAssignments } from '../../context/AssignmentContext';
import { Grade, Save, ArrowBack, AttachFile } from '@mui/icons-material';
import toast from 'react-hot-toast';

const GradingView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAssignmentById, currentAssignment, loading, gradeSubmission } = useAssignments();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (id) {
      getAssignmentById(id);
    }
  }, [id]);

  useEffect(() => {
    // Get student from URL params
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('student');
    if (studentId && currentAssignment?.submissions) {
      const submission = currentAssignment.submissions.find(
        s => s.student?._id === studentId
      );
      if (submission) {
        setSelectedStudent(submission);
        setGrade(submission.grade || '');
        setFeedback(submission.feedback || '');
      }
    }
  }, [currentAssignment]);

  const handleGradeSubmit = async () => {
    if (!grade || grade < 0 || grade > (currentAssignment?.points || 100)) {
      toast.error(`Grade must be between 0 and ${currentAssignment?.points || 100}`);
      return;
    }

    // For now, just simulate
    toast.success('Grade submitted successfully!');
    navigate(`/assignments/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentAssignment) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Assignment not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Assignment
      </Button>

      <Grid container spacing={3}>
        {/* Left Column - Student List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, maxHeight: '600px', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Submissions ({currentAssignment.submissions?.length || 0})
            </Typography>
            <List>
              {currentAssignment.submissions?.map((submission, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    button 
                    selected={selectedStudent?.student?._id === submission.student?._id}
                    onClick={() => {
                      setSelectedStudent(submission);
                      setGrade(submission.grade || '');
                      setFeedback(submission.feedback || '');
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={submission.student?.profilePicture}>
                        {submission.student?.name?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={submission.student?.name}
                      secondary={
                        <>
                          {new Date(submission.submittedAt).toLocaleDateString()}
                          {submission.grade && ` • Grade: ${submission.grade}`}
                        </>
                      }
                    />
                    {submission.status === 'late' && (
                      <Chip label="Late" size="small" color="warning" />
                    )}
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {(!currentAssignment.submissions || currentAssignment.submissions.length === 0) && (
                <ListItem>
                  <ListItemText primary="No submissions yet" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Right Column - Grading Interface */}
        <Grid item xs={12} md={8}>
          {selectedStudent ? (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Grade Submission
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar 
                  src={selectedStudent.student?.profilePicture}
                  sx={{ width: 60, height: 60 }}
                >
                  {selectedStudent.student?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {selectedStudent.student?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submitted: {new Date(selectedStudent.submittedAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Student's Submission */}
              <Typography variant="subtitle1" gutterBottom>
                Student's Work:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', mb: 3 }}>
                <Typography variant="body1">
                  {selectedStudent.content || 'No content provided'}
                </Typography>
              </Paper>

              {/* Attachments */}
              {selectedStudent.attachments?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Attachments:
                  </Typography>
                  {selectedStudent.attachments.map((file, index) => (
                    <Chip
                      key={index}
                      icon={<AttachFile />}
                      label={file.fileName}
                      onClick={() => window.open(file.fileUrl, '_blank')}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}

              {/* Grading Form */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Grade"
                    type="number"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    helperText={`Out of ${currentAssignment.points} points`}
                    inputProps={{ min: 0, max: currentAssignment.points }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Feedback"
                    multiline
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback to the student..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleGradeSubmit}
                    >
                      Submit Grade
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Grade sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Select a student to grade
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default GradingView;