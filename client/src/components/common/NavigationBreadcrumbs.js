import React from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ForumIcon from '@mui/icons-material/Forum';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext';

const NavigationBreadcrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isStudent, isTeacher } = useAuth();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Map paths to display names and icons
  const getPathInfo = (path) => {
    const pathMap = {
      'student': { name: 'Student', icon: <PersonIcon fontSize="small" /> },
      'teacher': { name: 'Teacher', icon: <PersonIcon fontSize="small" /> },
      'dashboard': { name: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
      'classes': { name: 'Classes', icon: <ClassIcon fontSize="small" /> },
      'assignments': { name: 'Assignments', icon: <AssignmentIcon fontSize="small" /> },
      'discussions': { name: 'Discussions', icon: <ForumIcon fontSize="small" /> },
      'results': { name: 'My Results', icon: <AssignmentIcon fontSize="small" /> },
      'profile': { name: 'Profile', icon: <PersonIcon fontSize="small" /> }
    };
    return pathMap[path] || { name: path.charAt(0).toUpperCase() + path.slice(1), icon: null };
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs aria-label="breadcrumb">
        {/* Home link */}
        <Link
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>

        {/* Dashboard link for authenticated users */}
        {isStudent && location.pathname !== '/student/dashboard' && (
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/student/dashboard')}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <DashboardIcon sx={{ mr: 0.5 }} fontSize="small" />
            Dashboard
          </Link>
        )}

        {isTeacher && location.pathname !== '/teacher/dashboard' && (
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/teacher/dashboard')}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <DashboardIcon sx={{ mr: 0.5 }} fontSize="small" />
            Dashboard
          </Link>
        )}

        {/* Dynamic path segments */}
        {pathnames.map((value, index) => {
          const isLast = index === pathnames.length - 1;
          const pathInfo = getPathInfo(value);
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;

          return isLast ? (
            <Typography
              key={value}
              color="text.primary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {pathInfo.icon && <Box sx={{ mr: 0.5 }}>{pathInfo.icon}</Box>}
              {pathInfo.name}
            </Typography>
          ) : (
            <Link
              key={value}
              component="button"
              underline="hover"
              color="inherit"
              onClick={() => handleNavigate(routeTo)}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              {pathInfo.icon && <Box sx={{ mr: 0.5 }}>{pathInfo.icon}</Box>}
              {pathInfo.name}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default NavigationBreadcrumbs;