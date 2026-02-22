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
  // Get URL parameters
  const params = useParams();
  console.log('🔍 PARAMS OBJECT:', params);
  console.log('🔍 params.classId:', params.classId);
  console.log('🔍 params.id:', params.id);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentAssignment,
    createAssignment,
    updateAssignment,
    getAssignmentById,
    loading
  } = useAssignments();

  // Extract parameters
  const classId = params.classId;
  const id = params.id;
  const isEditMode = !!id;

  console.log('📌 Extracted classId:', classId, '| type:', typeof classId, '| value:', classId);
  console.log('📌 Extracted id:', id, '| type:', typeof id, '| value:', id);
  console.log('📌 isEditMode:', isEditMode);

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

  // Redirect if no classId and not in edit mode
  useEffect(() => {
    console.log('🔄 useEffect - Checking classId availability');
    console.log('  - isEditMode:', isEditMode);
    console.log('  - classId:', classId);
    
    if (!isEditMode && !classId) {
      console.error('❌ No classId provided and not in edit mode');
      toast.error('No class specified');
      navigate('/classes');
    }
  }, [isEditMode, classId, navigate]);

  // Fetch assignment if in edit mode
  useEffect(() => {
    console.log('🔄 useEffect - Fetching assignment if edit mode');
    console.log('  - isEditMode:', isEditMode);
    console.log('  - id:', id);
    
    if (isEditMode && id) {
      console.log('📡 Fetching assignment with ID:', id);
      getAssignmentById(id);
    }
  }, [isEditMode, id, getAssignmentById]);

  // Update form when currentAssignment changes
  useEffect(() => {
    console.log('🔄 useEffect - currentAssignment changed');
    console.log('  - currentAssignment:', currentAssignment);
    
    if (isEditMode && currentAssignment) {
      console.log('📝 Populating form with assignment data');
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
    console.log('📝📝📝 FORM SUBMITTED 📝📝📝');
    console.log('Form data before processing:', formData);

    // Get classId from multiple possible sources
    let targetClassId = classId;
    console.log('📍 Initial targetClassId from URL:', targetClassId);
    
    if (!targetClassId && isEditMode && currentAssignment) {
      targetClassId = currentAssignment.classId?._id || currentAssignment.classId;
      console.log('📍 targetClassId from currentAssignment:', targetClassId);
    }

    console.log('📍 Final targetClassId:', targetClassId);
    console.log('📍 targetClassId type:', typeof targetClassId);
    console.log('📍 targetClassId length:', targetClassId?.length);

    // Validate classId
    if (!targetClassId) {
      console.error('❌ CRITICAL: targetClassId is undefined or null');
      console.error('  - URL classId:', classId);
      console.error('  - isEditMode:', isEditMode);
      console.error('  - currentAssignment:', currentAssignment);
      toast.error('Class ID is missing. Please go back to the class page and try again.');
      return;
    }

    // Validate form fields
    if (!formData.title || !formData.description || !formData.instructions || !formData.dueDate) {
      console.error('❌ Missing required fields:', {
        title: !!formData.title,
        description: !!formData.description,
        instructions: !!formData.instructions,
        dueDate: !!formData.dueDate
      });
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
      title: formData.title,
      description: formData.description,
      instructions: formData.instructions,
      classId: targetClassId,
      dueDate: new Date(formData.dueDate).toISOString(),
      points: parseInt(formData.points) || 100,
      rubric: formData.rubric.filter(item => item.criterion.trim() !== ''),
      allowLateSubmission: formData.allowLateSubmission,
      latePenalty: parseInt(formData.latePenalty) || 0,
      status: formData.status
    };

    console.log('📦 Submitting assignment data:', assignmentData);
    console.log('📦 classId in submission:', assignmentData.classId);
    console.log('📦 classId type:', typeof assignmentData.classId);
    console.log('📦 classId value:', assignmentData.classId);

    let result;
    if (isEditMode) {
      console.log('✏️ Updating assignment with ID:', id);
      result = await updateAssignment(id, assignmentData);
    } else {
      console.log('➕ Creating new assignment');
      result = await createAssignment(assignmentData);
    }

    console.log('📨 Submission result:', result);

    if (result?.success) {
      console.log('✅ Assignment saved successfully, navigating to class:', targetClassId);
      navigate(`/classes/${targetClassId}`);
    } else {
      console.error('❌ Failed to save assignment:', result?.error);
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
      {/* Debug Info Banner */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: '#f0f0f0' }}>
        <Typography variant="body2">
          <strong>Debug:</strong> 
          Class ID from URL: {classId || 'undefined'} | 
          Edit Mode: {isEditMode ? '✅' : '❌'} | 
          Assignment ID: {id || 'none'}
        </Typography>
        <Typography variant="body2" color="primary">
          URL: {window.location.href}
        </Typography>
      </Paper>

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