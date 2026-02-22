import React, { createContext, useContext, useState } from 'react';
import { assignmentAPI } from '../services/api';
import toast from 'react-hot-toast';

const AssignmentContext = createContext();

export const useAssignments = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignments must be used within AssignmentProvider');
  }
  return context;
};

export const AssignmentProvider = ({ children }) => {
  const [assignments, setAssignments] = useState([]);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Get all assignments for a class
  const getClassAssignments = async (classId) => {
    try {
      setLoading(true);
      console.log('📚 Fetching assignments for class:', classId);
      const response = await assignmentAPI.getClassAssignments(classId);
      console.log('✅ Assignments received:', response.data);
      setAssignments(response.data.data || []);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to load assignments:', error);
      toast.error('Failed to load assignments');
      return { success: false, error: error.response?.data?.error };
    } finally {
      setLoading(false);
    }
  };

  // Get single assignment
  const getAssignmentById = async (assignmentId) => {
    try {
      setLoading(true);
      console.log('📖 Fetching assignment:', assignmentId);
      const response = await assignmentAPI.getAssignmentById(assignmentId);
      console.log('✅ Assignment received:', response.data);
      setCurrentAssignment(response.data.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to load assignment:', error);
      toast.error('Failed to load assignment');
      return { success: false, error: error.response?.data?.error };
    } finally {
      setLoading(false);
    }
  };

  // Create assignment
  const createAssignment = async (assignmentData) => {
    try {
      setLoading(true);
      console.log('📝 Creating assignment:', assignmentData);
      const response = await assignmentAPI.createAssignment(assignmentData);
      console.log('✅ Assignment created:', response.data);
      setAssignments(prev => [response.data.data, ...prev]);
      toast.success('Assignment created successfully!');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('❌ Assignment creation failed:', error);
      toast.error(error.response?.data?.error || 'Failed to create assignment');
      return { success: false, error: error.response?.data?.error };
    } finally {
      setLoading(false);
    }
  };

  // Submit assignment - FIXED VERSION
  const submitAssignment = async (assignmentId, submissionData) => {
    console.log('📤 AssignmentContext.submitAssignment called with:', { 
      assignmentId, 
      submissionData 
    });
    
    try {
      console.log('📡 Sending POST request to:', `/assignments/${assignmentId}/submit`);
      const response = await assignmentAPI.submitAssignment(assignmentId, submissionData);
      console.log('✅ Submit response:', response.data);
      
      // Refresh the current assignment to show the new submission
      if (currentAssignment?._id === assignmentId) {
        await getAssignmentById(assignmentId);
      }
      
      toast.success('Assignment submitted successfully!');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('❌ Submit error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.error || 'Failed to submit assignment';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Grade submission
  const gradeSubmission = async (assignmentId, studentId, gradeData) => {
    try {
      console.log('📝 Grading submission:', { assignmentId, studentId, gradeData });
      const response = await assignmentAPI.gradeSubmission(assignmentId, studentId, gradeData);
      console.log('✅ Grade submitted:', response.data);
      toast.success('Grade submitted successfully!');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('❌ Grade submission failed:', error);
      toast.error(error.response?.data?.error || 'Failed to grade submission');
      return { success: false, error: error.response?.data?.error };
    }
  };

  // Get my submissions for a class
  const getMySubmissions = async (classId) => {
    try {
      console.log('📚 Fetching my submissions for class:', classId);
      const response = await assignmentAPI.getMySubmissions(classId);
      console.log('✅ Submissions received:', response.data);
      setSubmissions(response.data.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to load submissions:', error);
      toast.error('Failed to load submissions');
      return { success: false, error: error.response?.data?.error };
    }
  };

  // Get assignment stats
  const getAssignmentStats = async (assignmentId) => {
    try {
      console.log('📊 Fetching stats for assignment:', assignmentId);
      const response = await assignmentAPI.getAssignmentStats(assignmentId);
      console.log('✅ Stats received:', response.data);
      setStats(response.data.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to load statistics:', error);
      toast.error('Failed to load statistics');
      return { success: false, error: error.response?.data?.error };
    }
  };

  // Delete assignment
  const deleteAssignment = async (assignmentId) => {
    try {
      console.log('🗑️ Deleting assignment:', assignmentId);
      await assignmentAPI.deleteAssignment(assignmentId);
      console.log('✅ Assignment deleted');
      setAssignments(prev => prev.filter(a => a._id !== assignmentId));
      toast.success('Assignment deleted');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete assignment:', error);
      toast.error('Failed to delete assignment');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const value = {
    assignments,
    currentAssignment,
    submissions,
    loading,
    stats,
    getClassAssignments,
    getAssignmentById,
    createAssignment,
    submitAssignment,
    gradeSubmission,
    getMySubmissions,
    getAssignmentStats,
    deleteAssignment
  };

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
};