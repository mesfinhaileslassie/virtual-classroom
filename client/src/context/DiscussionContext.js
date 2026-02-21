import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const DiscussionContext = createContext();

export const useDiscussions = () => {
  const context = useContext(DiscussionContext);
  if (!context) {
    throw new Error('useDiscussions must be used within DiscussionProvider');
  }
  return context;
};

export const DiscussionProvider = ({ children }) => {
  const { token } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [currentDiscussion, setCurrentDiscussion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);

  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  // Get all discussions for a class
  const getClassDiscussions = async (classId) => {
    try {
      setLoading(true);
      const response = await api.get(`/discussions/class/${classId}`);
      setDiscussions(response.data.data);
      return response.data;
    } catch (error) {
      toast.error('Failed to load discussions');
      return { success: false, error: error.response?.data?.error };
    } finally {
      setLoading(false);
    }
  };

  // Get single discussion
  const getDiscussionById = async (discussionId) => {
    try {
      setLoading(true);
      const response = await api.get(`/discussions/${discussionId}`);
      setCurrentDiscussion(response.data.data);
      setComments(response.data.data.comments || []);
      return response.data;
    } catch (error) {
      toast.error('Failed to load discussion');
      return { success: false, error: error.response?.data?.error };
    } finally {
      setLoading(false);
    }
  };

  // Create new discussion
  const createDiscussion = async (discussionData) => {
    try {
      setLoading(true);
      const response = await api.post('/discussions', discussionData);
      setDiscussions(prev => [response.data.data, ...prev]);
      toast.success('Discussion created successfully!');
      return { success: true, data: response.data.data };
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create discussion');
      return { success: false, error: error.response?.data?.error };
    } finally {
      setLoading(false);
    }
  };

  // Add comment
  const addComment = async (discussionId, content) => {
    try {
      const response = await api.post(`/discussions/${discussionId}/comments`, { content });
      setComments(prev => [...prev, response.data.data]);
      
      // Update discussion in list
      setDiscussions(prev => prev.map(d => 
        d._id === discussionId 
          ? { ...d, commentCount: (d.commentCount || 0) + 1, lastActivity: new Date() }
          : d
      ));
      
      toast.success('Comment added!');
      return { success: true, data: response.data.data };
    } catch (error) {
      toast.error('Failed to add comment');
      return { success: false, error: error.response?.data?.error };
    }
  };

  // Toggle like
  const toggleLike = async (discussionId) => {
    try {
      const response = await api.put(`/discussions/${discussionId}/like`);
      
      // Update discussion likes in state
      setDiscussions(prev => prev.map(d => 
        d._id === discussionId 
          ? { ...d, likes: response.data.isLiked 
              ? [...(d.likes || []), { _id: 'temp' }] 
              : (d.likes || []).slice(0, -1) 
            }
          : d
      ));
      
      return { success: true, data: response.data };
    } catch (error) {
      toast.error('Failed to like discussion');
      return { success: false, error: error.response?.data?.error };
    }
  };

  // Delete discussion
  const deleteDiscussion = async (discussionId) => {
    try {
      await api.delete(`/discussions/${discussionId}`);
      setDiscussions(prev => prev.filter(d => d._id !== discussionId));
      toast.success('Discussion deleted');
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete discussion');
      return { success: false, error: error.response?.data?.error };
    }
  };

  const value = {
    discussions,
    currentDiscussion,
    comments,
    loading,
    getClassDiscussions,
    getDiscussionById,
    createDiscussion,
    addComment,
    toggleLike,
    deleteDiscussion
  };

  return (
    <DiscussionContext.Provider value={value}>
      {children}
    </DiscussionContext.Provider>
  );
};