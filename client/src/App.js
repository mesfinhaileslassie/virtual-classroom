import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { DiscussionProvider } from './context/DiscussionContext';
import { AssignmentProvider } from './context/AssignmentContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import Layout from './components/layout/Layout';

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

// Assignment Components
import AssignmentList from './components/assignments/AssignmentList';
import AssignmentDetail from './components/assignments/AssignmentDetail';
import AssignmentForm from './components/assignments/AssignmentForm';
import SubmissionForm from './components/assignments/SubmissionForm';
import GradingView from './components/assignments/GradingView';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff4081',
      dark: '#9a0036',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    info: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Content with Routes
function AppContent() {
  return (
    <Layout>
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

        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div>Admin Dashboard Coming Soon</div>
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

        {/* Settings Route */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <div>Settings Coming Soon</div>
          </ProtectedRoute>
        } />

        {/* Announcements Route */}
        <Route path="/announcements" element={
          <ProtectedRoute>
            <div>Announcements Coming Soon</div>
          </ProtectedRoute>
        } />

        {/* FAQ Route */}
        <Route path="/faq" element={<div>FAQ Coming Soon</div>} />
        <Route path="/help" element={<div>Help Center Coming Soon</div>} />
        <Route path="/privacy" element={<div>Privacy Policy Coming Soon</div>} />
        <Route path="/terms" element={<div>Terms of Service Coming Soon</div>} />
        <Route path="/cookies" element={<div>Cookie Policy Coming Soon</div>} />
        <Route path="/about" element={<div>About Us Coming Soon</div>} />
        <Route path="/contact" element={<div>Contact Us Coming Soon</div>} />

        {/* 404 Route */}
        <Route path="*" element={
          <div style={{ 
            textAlign: 'center', 
            padding: '50px',
            color: '#666'
          }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <button 
              onClick={() => window.location.href = '/'}
              style={{
                padding: '10px 20px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Go Home
            </button>
          </div>
        } />
      </Routes>
    </Layout>
  );
}

// Main App Component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <DiscussionProvider>
              <AssignmentProvider>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      borderRadius: '10px',
                      background: '#333',
                      color: '#fff',
                    },
                    success: {
                      style: {
                        background: '#4caf50',
                      },
                    },
                    error: {
                      style: {
                        background: '#f44336',
                      },
                    },
                    loading: {
                      style: {
                        background: '#ff9800',
                      },
                    },
                  }}
                />
                <AppContent />
              </AssignmentProvider>
            </DiscussionProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;