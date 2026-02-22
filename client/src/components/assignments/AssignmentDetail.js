import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Schedule,
  AttachFile,
  Grade,
  Send,
  ArrowBack
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useAssignments } from '../../context/AssignmentContext';
import toast from 'react-hot-toast';

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher, isStudent } = useAuth();
  const {
    currentAssignment,
    loading,
    getAssignmentById
  } = useAssignments();

  const [submissionContent, setSubmissionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      getAssignmentById(id);
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentAssignment) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Assignment not found</Alert>
      </Container>
    );
  }

  const dueDate = new Date(currentAssignment.dueDate);
  const now = new Date();
  const isPastDue = dueDate < now;
  const mySubmission = currentAssignment.submissions?.find(
    s => s.student?._id === user?._id
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      {/* Header */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {currentAssignment.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                icon={<Schedule />}
                label={`Due: ${format(dueDate, 'MMMM dd, yyyy hh:mm a')}`}
                color={isPastDue ? 'error' : 'primary'}
              />
              <Chip
                icon={<Grade />}
                label={`${currentAssignment.points} points`}
                color="secondary"
              />
              <Chip
                label={`Status: ${currentAssignment.status}`}
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Description */}
        <Typography variant="h6" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1" paragraph>
          {currentAssignment.description}
        </Typography>

        {/* Instructions */}
        <Typography variant="h6" gutterBottom>
          Instructions
        </Typography>
        <Typography variant="body1" paragraph>
          {currentAssignment.instructions}
        </Typography>

        {/* Attachments */}
        {currentAssignment.attachments?.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Attachments
            </Typography>
            <List>
              {currentAssignment.attachments.map((file, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      <AttachFile />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={file.fileName}
                    secondary={`${(file.fileSize / 1024).toFixed(2)} KB`}
                  />
                  <Button size="small" href={file.fileUrl} target="_blank">
                    Download
                  </Button>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Rubric */}
        {currentAssignment.rubric?.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Grading Rubric
            </Typography>
            <Grid container spacing={2}>
              {currentAssignment.rubric.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">
                        {item.criterion} - {item.points} points
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>

 // Student Submission Section
{isStudent && (
  <Paper sx={{ p: 4 }}>
    <Typography variant="h5" gutterBottom>
      Your Submission
    </Typography>

    {console.log('🎯 Student view - submissions:', currentAssignment.submissions)}

    {currentAssignment.submissions && currentAssignment.submissions.length > 0 ? (
      <Box>
        {currentAssignment.submissions.map((submission, idx) => (
          <Box key={idx}>
            <Alert severity="success" sx={{ mb: 2 }}>
              You submitted this assignment on {format(new Date(submission.submittedAt), 'MMMM dd, yyyy hh:mm a')}
              {submission.status === 'late' && <span> (Late)</span>}
            </Alert>

            <Typography variant="body1" paragraph>
              {submission.content}
            </Typography>

            {submission.attachments?.length > 0 && (
              <>
                <Typography variant="subtitle1">Attachments:</Typography>
                <List>
                  {submission.attachments.map((file, fileIdx) => (
                    <ListItem key={fileIdx}>
                      <ListItemAvatar>
                        <Avatar>
                          <AttachFile />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={file.fileName}
                        secondary={`${(file.fileSize / 1024).toFixed(2)} KB`}
                      />
                      <Button size="small" href={file.fileUrl} target="_blank">
                        Download
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {submission.grade !== undefined && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="subtitle1">
                  Grade: {submission.grade}/{currentAssignment.points}
                </Typography>
                {submission.feedback && (
                  <Typography variant="body2">
                    Feedback: {submission.feedback}
                  </Typography>
                )}
              </Alert>
            )}
          </Box>
        ))}
      </Box>
    ) : (
      <Box>
        {isPastDue ? (
          <Alert severity="error">
            This assignment is past due and no longer accepting submissions.
          </Alert>
        ) : (
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => navigate(`/assignments/${id}/submit`)}
          >
            Submit Assignment
          </Button>
        )}
      </Box>
    )}
  </Paper>
)}

// Teacher View - All Submissions
{isTeacher && currentAssignment.submissions && currentAssignment.submissions.length > 0 && (
  <Paper sx={{ p: 4, mt: 3 }}>
    <Typography variant="h5" gutterBottom>
      Submissions ({currentAssignment.submissions.length})
    </Typography>
    <List>
      {currentAssignment.submissions.map((submission, index) => (
        <React.Fragment key={index}>
          <ListItem>
            <ListItemAvatar>
              <Avatar src={submission.student?.profilePicture}>
                {submission.student?.name?.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={submission.student?.name}
              secondary={
                <>
                  Submitted: {format(new Date(submission.submittedAt), 'MMM dd, yyyy hh:mm a')}
                  {submission.status === 'late' && ' • Late'}
                  {submission.grade && ` • Grade: ${submission.grade}/${currentAssignment.points}`}
                </>
              }
            />
            <Button
              variant="outlined"
              onClick={() => navigate(`/assignments/${id}/grade?student=${submission.student?._id}`)}
            >
              {submission.grade ? 'Update Grade' : 'Grade'}
            </Button>
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  </Paper>
)}

{isTeacher && (!currentAssignment.submissions || currentAssignment.submissions.length === 0) && (
  <Paper sx={{ p: 4, mt: 3, textAlign: 'center' }}>
    <Typography variant="body1" color="text.secondary">
      No submissions yet.
    </Typography>
  </Paper>
)}

      {/* Teacher View - All Submissions */}
      {isTeacher && currentAssignment.submissions?.length > 0 && (
        <Paper sx={{ p: 4, mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Submissions ({currentAssignment.submissions.length})
          </Typography>
          <List>
            {currentAssignment.submissions.map((submission, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={submission.student?.profilePicture}>
                      {submission.student?.name?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={submission.student?.name}
                    secondary={
                      <>
                        Submitted: {format(new Date(submission.submittedAt), 'MMM dd, yyyy hh:mm a')}
                        {submission.grade && ` • Grade: ${submission.grade}/${currentAssignment.points}`}
                      </>
                    }
                  />
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/assignments/${id}/grade?student=${submission.student?._id}`)}
                  >
                    {submission.grade ? 'Update Grade' : 'Grade'}
                  </Button>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default AssignmentDetail;