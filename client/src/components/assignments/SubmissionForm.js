import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAssignments } from '../../context/AssignmentContext';
import { AttachFile, Send, ArrowBack } from '@mui/icons-material';
import toast from 'react-hot-toast';

const SubmissionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitAssignment, loading } = useAssignments();
  
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeFile = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && attachments.length === 0) {
      toast.error('Please add content or attach files');
      return;
    }

    setSubmitting(true);
    
    // For now, just simulate submission
    setTimeout(() => {
      toast.success('Assignment submitted successfully!');
      navigate(`/assignments/${id}`);
    }, 1500);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Assignment
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Submit Assignment
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Answer / Comments"
                multiline
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your answer here or add comments about your submission..."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Attachments
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFile />}
              >
                Upload Files
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileChange}
                />
              </Button>

              {attachments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {attachments.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => removeFile(index)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Alert severity="info">
                Make sure you've reviewed your submission before sending. 
                You cannot edit after submission.
              </Alert>
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
                  type="submit"
                  variant="contained"
                  startIcon={<Send />}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Submit Assignment'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default SubmissionForm;