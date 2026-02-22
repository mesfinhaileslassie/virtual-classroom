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
      const response = await assignmentAPI.getClassAssignments(classId);
      setAssignments(response.data.data);
      return response.data;
    } catch (error) {
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
      const response = await assignmentAPI.getAssignmentById(assignmentId);
      setCurrentAssignment(response.data.data);
      return response.data;
    } catch (error) {
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
      const response = await assignmentAPI.createAssignment(assignmentData);
      setAssignments(prev => [response.data.data, ...prev]);
      toast.success('Assignment created successfully!');
      return { success: true, data: response.data.data };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create assignment');
      return { success: false, error: error.response?.data?.error };
    } finally {
      setLoading(false);
    }
  };

  // Submit assignment
  const submitAssignment = async (assignmentId, submissionData) => {
    try {
      const response = await assignmentAPI.submitAssignment(assignmentId, submissionData);
      toast.success('Assignment submitted successfully!');
      return { success: true, data: response.data.data };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit assignment');
      return { success: false, error: error.response?.data?.error };
    }
  };

  // Grade submission
  const gradeSubmission = async (assignmentId, studentId, gradeData) => {
    try {
      const response = await assignmentAPI.gradeSubmission(assignmentId, studentId, gradeData);
      toast.success('Grade submitted successfully!');
      return { success: true, data: response.data.data };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to grade submission');
      return { success: false, error: error.response?.data?.error };
    }
  };

  // Get my submissions for a class
  const getMySubmissions = async (classId) => {
    try {
      const response = await assignmentAPI.getMySubmissions(classId);
      setSubmissions(response.data.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to load submissions');
      return { success: false, error: error.response?.data?.error };
    }
  };

  // Get assignment stats
  const getAssignmentStats = async (assignmentId) => {
    try {
      const response = await assignmentAPI.getAssignmentStats(assignmentId);
      setStats(response.data.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to load statistics');
      return { success: false, error: error.response?.data?.error };
    }
  };

  // Delete assignment
  const deleteAssignment = async (assignmentId) => {
    try {
      await assignmentAPI.deleteAssignment(assignmentId);
      setAssignments(prev => prev.filter(a => a._id !== assignmentId));
      toast.success('Assignment deleted');
      return { success: true };
    } catch (error) {
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