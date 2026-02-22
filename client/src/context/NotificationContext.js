import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { assignmentAPI } from '../services/api';
import { classAPI } from '../services/api';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isTeacher, isStudent } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications based on user role
  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let teacherNotifications = [];
      let studentNotifications = [];

      if (isTeacher) {
        // Teacher notifications - pending grading, new enrollments, etc.
        const classes = await classAPI.getClasses();
        const pendingGrading = [];
        
        // Check each class for assignments that need grading
        for (const classItem of classes.data.data) {
          const assignments = await assignmentAPI.getClassAssignments(classItem._id);
          assignments.data.data?.forEach(assignment => {
            const ungraded = assignment.submissions?.filter(s => !s.grade) || [];
            if (ungraded.length > 0) {
              pendingGrading.push({
                id: `grade-${assignment._id}`,
                type: 'grading',
                title: 'Pending Grading',
                message: `${ungraded.length} submission(s) need grading for "${assignment.title}" in ${classItem.name}`,
                classId: classItem._id,
                assignmentId: assignment._id,
                timestamp: new Date(),
                read: false,
                action: `/assignments/${assignment._id}/grade`
              });
            }
          });
        }
        teacherNotifications = pendingGrading;
      }

      if (isStudent) {
        // Student notifications - new assignments, grades posted, etc.
        const classes = await classAPI.getClasses();
        const newAssignments = [];
        const newGrades = [];

        for (const classItem of classes.data.data) {
          const assignments = await assignmentAPI.getClassAssignments(classItem._id);
          assignments.data.data?.forEach(assignment => {
            // Check for new assignments (created in last 24 hours)
            const created = new Date(assignment.createdAt);
            const now = new Date();
            const hoursDiff = (now - created) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
              newAssignments.push({
                id: `new-${assignment._id}`,
                type: 'new_assignment',
                title: 'New Assignment',
                message: `New assignment: "${assignment.title}" in ${classItem.name} - Due ${new Date(assignment.dueDate).toLocaleDateString()}`,
                classId: classItem._id,
                assignmentId: assignment._id,
                timestamp: created,
                read: false,
                action: `/assignments/${assignment._id}`
              });
            }

            // Check for newly graded submissions
            const mySubmission = assignment.submissions?.find(s => s.student === user._id);
            if (mySubmission?.grade && !mySubmission.notified) {
              newGrades.push({
                id: `grade-${assignment._id}`,
                type: 'grade_posted',
                title: 'Grade Posted',
                message: `Your assignment "${assignment.title}" has been graded: ${mySubmission.grade}/${assignment.points}`,
                classId: classItem._id,
                assignmentId: assignment._id,
                timestamp: mySubmission.gradedAt || new Date(),
                read: false,
                action: `/assignments/${assignment._id}`
              });
            }
          });
        }
        studentNotifications = [...newAssignments, ...newGrades];
      }

      // Combine and sort by timestamp
      const allNotifications = [...teacherNotifications, ...studentNotifications]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Add a custom notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast for real-time notification
    toast.custom((t) => (
      <div
        onClick={() => {
          toast.dismiss(t.id);
          if (newNotification.action) {
            window.location.href = newNotification.action;
          }
        }}
        style={{
          backgroundColor: '#1976d2',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        <strong>{newNotification.title}</strong>
        <div style={{ fontSize: '14px', marginTop: '4px' }}>
          {newNotification.message}
        </div>
      </div>
    ));
  };

  // Refresh notifications periodically
  useEffect(() => {
    fetchNotifications();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};