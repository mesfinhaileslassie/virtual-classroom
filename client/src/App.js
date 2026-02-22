import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { DiscussionProvider } from './context/DiscussionContext';
import { AssignmentProvider } from './context/AssignmentContext'; // Add this

// Layout
import Navbar from './components/layout/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Classes from './pages/Classes';
import ClassDetail from './pages/ClassDetail';
import Profile from './pages/Profile';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Discussion Components
import DiscussionThread from './components/discussions/DiscussionThread';

// Assignment Components (we'll create these next)
import AssignmentList from './components/assignments/AssignmentList';
import AssignmentDetail from './components/assignments/AssignmentDetail';
import AssignmentForm from './components/assignments/AssignmentForm';
import SubmissionForm from './components/assignments/SubmissionForm';
import GradingView from './components/assignments/GradingView';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes - Classes */}
        <Route path="/classes" element={
          <ProtectedRoute>
            <Classes />
          </ProtectedRoute>
        } />
        
        <Route path="/classes/:id" element={
          <ProtectedRoute>
            <ClassDetail />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes - Profile */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes - Dashboards */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        {/* Protected Routes - Discussions */}
        <Route path="/discussions/:id" element={
          <ProtectedRoute>
            <DiscussionThread />
          </ProtectedRoute>
        } />

        {/* Protected Routes - Assignments */}
        <Route path="/assignments" element={
          <ProtectedRoute>
            <AssignmentList />
          </ProtectedRoute>
        } />
        
        <Route path="/assignments/:id" element={
          <ProtectedRoute>
            <AssignmentDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/assignments/:id/submit" element={
          <ProtectedRoute allowedRoles={['student']}>
            <SubmissionForm />
          </ProtectedRoute>
        } />
        
        <Route path="/assignments/:id/grade" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <GradingView />
          </ProtectedRoute>
        } />
        
        <Route path="/assignments/create/:classId" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <AssignmentForm />
          </ProtectedRoute>
        } />
        
        <Route path="/assignments/edit/:id" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <AssignmentForm />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <DiscussionProvider>
            <AssignmentProvider>  {/* Add AssignmentProvider here */}
              <Toaster position="top-right" />
              <AppContent />
            </AssignmentProvider>  {/* Close AssignmentProvider */}
          </DiscussionProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;