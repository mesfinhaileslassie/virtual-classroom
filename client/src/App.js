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
import StudentResults from './pages/StudentResults';
import LiveClassPage from './pages/LiveClassPage';

// Discussion Components
import DiscussionThread from './components/discussions/DiscussionThread';

// Assignment Components
import AssignmentList from './components/assignments/AssignmentList';
import AssignmentDetail from './components/assignments/AssignmentDetail';
import AssignmentForm from './components/assignments/AssignmentForm';
import SubmissionForm from './components/assignments/SubmissionForm';
import GradingView from './components/assignments/GradingView';

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

// Main App Content
function AppContent() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/student/results" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentResults />
          </ProtectedRoute>
        } />
        
        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute allowedRoles={['teacher', 'admin']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        {/* Common Protected Routes */}
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
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* Live Class Route */}
        <Route path="/live/:id" element={
          <ProtectedRoute>
            <LiveClassPage />
          </ProtectedRoute>
        } />
        
        {/* Assignment Routes */}
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
        
        {/* Discussion Routes */}
        <Route path="/discussions/:id" element={
          <ProtectedRoute>
            <DiscussionThread />
          </ProtectedRoute>
        } />

        {/* Settings Route */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <div style={{ padding: 20, textAlign: 'center' }}>
              <h2>Settings Coming Soon</h2>
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
          </ProtectedRoute>
        } />

        {/* Announcements Route */}
        <Route path="/announcements" element={
          <ProtectedRoute>
            <div style={{ padding: 20, textAlign: 'center' }}>
              <h2>Announcements Coming Soon</h2>
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
          </ProtectedRoute>
        } />

        {/* Public Info Routes */}
        <Route path="/faq" element={
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h2>FAQ Coming Soon</h2>
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
        
        <Route path="/help" element={
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h2>Help Center Coming Soon</h2>
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
        
        <Route path="/privacy" element={
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h2>Privacy Policy Coming Soon</h2>
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
        
        <Route path="/terms" element={
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h2>Terms of Service Coming Soon</h2>
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
        
        <Route path="/cookies" element={
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h2>Cookie Policy Coming Soon</h2>
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
        
        <Route path="/about" element={
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h2>About Us Coming Soon</h2>
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
        
        <Route path="/contact" element={
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h2>Contact Us Coming Soon</h2>
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