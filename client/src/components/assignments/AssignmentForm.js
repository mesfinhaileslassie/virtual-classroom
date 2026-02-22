import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Save,
  Cancel,
  Add,
  Delete,
  AttachFile
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAssignments } from '../../context/AssignmentContext';
import toast from 'react-hot-toast';

const AssignmentForm = () => {
  const { id, classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentAssignment,
    createAssignment,
    updateAssignment,
    getAssignmentById,
    loading
  } = useAssignments();

  const isEditMode = !!id;

  // Helper function to get default due date (7 days from now)
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return getDefaultDueDate();
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: getDefaultDueDate(),
    points: 100,
    rubric: [{ criterion: '', points: 0, description: '' }],
    allowLateSubmission: false,
    latePenalty: 0,
    status: 'published'
  });

  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (isEditMode && id) {
      getAssignmentById(id);
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (isEditMode && currentAssignment) {
      setFormData({
        title: currentAssignment.title || '',
        description: currentAssignment.description || '',
        instructions: currentAssignment.instructions || '',
        dueDate: formatDateForInput(currentAssignment.dueDate),
        points: currentAssignment.points || 100,
        rubric: currentAssignment.rubric && currentAssignment.rubric.length > 0 
          ? currentAssignment.rubric 
          : [{ criterion: '', points: 0, description: '' }],
        allowLateSubmission: currentAssignment.allowLateSubmission || false,
        latePenalty: currentAssignment.latePenalty || 0,
        status: currentAssignment.status || 'published'
      });
    }
  }, [currentAssignment, isEditMode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRubricChange = (index, field, value) => {
    const updatedRubric = [...formData.rubric];
    updatedRubric[index][field] = value;
    setFormData({ ...formData, rubric: updatedRubric });
  };

  const addRubricItem = () => {
    setFormData({
      ...formData,
      rubric: [...formData.rubric, { criterion: '', points: 0, description: '' }]
    });
  };

  const removeRubricItem = (index) => {
    const updatedRubric = formData.rubric.filter((_, i) => i !== index);
    setFormData({ ...formData, rubric: updatedRubric });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeFile = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.title || !formData.description || !formData.instructions || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate rubric points
    const totalRubricPoints = formData.rubric.reduce((sum, item) => sum + (Number(item.points) || 0), 0);
    if (totalRubricPoints > formData.points) {
      toast.error('Rubric points cannot exceed total assignment points');
      return;
    }

    // Prepare data
    const assignmentData = {
      ...formData,
      classId: classId || currentAssignment?.classId?._id || currentAssignment?.classId,
      dueDate: new Date(formData.dueDate).toISOString(),
      rubric: formData.rubric.filter(item => item.criterion.trim() !== '') // Remove empty rubric items
    };

    let result;
    if (isEditMode) {
      result = await updateAssignment(id, assignmentData);
    } else {
      result = await createAssignment(assignmentData);
    }

    if (result.success) {
      navigate(`/classes/${classId || currentAssignment?.classId?._id}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? 'Edit Assignment' : 'Create New Assignment'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assignment Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="datetime-local"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Points"
                name="points"
                type="number"
                value={formData.points}
                onChange={handleChange}
                required
                inputProps={{ min: 0, max: 1000 }}
              />
            </Grid>

            {/* Late Submission Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Late Submission Settings
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.allowLateSubmission}
                    onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
                  />
                }
                label="Allow Late Submissions"
              />
            </Grid>

            {formData.allowLateSubmission && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Late Penalty (%)"
                  name="latePenalty"
                  type="number"
                  value={formData.latePenalty}
                  onChange={handleChange}
                  helperText="Percentage to deduct for late submissions"
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
            )}

            {/* Rubric */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Grading Rubric</Typography>
                <Button
                  startIcon={<Add />}
                  onClick={addRubricItem}
                  size="small"
                >
                  Add Criterion
                </Button>
              </Box>
            </Grid>

            {formData.rubric.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Criterion"
                        value={item.criterion}
                        onChange={(e) => handleRubricChange(index, 'criterion', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Points"
                        type="number"
                        value={item.points}
                        onChange={(e) => handleRubricChange(index, 'points', parseInt(e.target.value) || 0)}
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={item.description}
                        onChange={(e) => handleRubricChange(index, 'description', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => removeRubricItem(index)}
                        disabled={formData.rubric.length === 1}
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}

            {/* Attachments */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
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

            {/* Status */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Status
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status === 'published'}
                    onChange={(e) => setFormData({
                      ...formData,
                      status: e.target.checked ? 'published' : 'draft'
                    })}
                  />
                }
                label={formData.status === 'published' ? 'Published (visible to students)' : 'Draft (hidden from students)'}
              />
            </Grid>

            {/* Submit Buttons */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {isEditMode ? 'Update' : 'Create'} Assignment
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AssignmentForm;