import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  School as SchoolIcon,
  Dashboard as DashboardIcon,
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  Forum as ForumIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  PersonAdd as PersonAddIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const getDashboardLink = () => {
    if (isTeacher) return '/teacher/dashboard';
    if (isStudent) return '/student/dashboard';
    return '/';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Menu items based on auth status
  const getMenuItems = () => {
    const items = [
      { text: 'Home', icon: <HomeIcon />, path: '/', show: true },
    ];

    if (isAuthenticated) {
      items.push({ 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        path: getDashboardLink(), 
        show: true 
      });
      items.push({ text: 'Classes', icon: <ClassIcon />, path: '/classes', show: true });
      items.push({ text: 'Assignments', icon: <AssignmentIcon />, path: '/assignments', show: true });
      items.push({ text: 'Discussions', icon: <ForumIcon />, path: '/discussions', show: true });
      
      if (isStudent) {
        items.push({ text: 'Results', icon: <GradeIcon />, path: '/student/results', show: true });
      }
    }

    return items;
  };

  const menuItems = getMenuItems();

  const drawerContent = (
    <Box sx={{ width: 250 }} onClick={toggleMobileMenu}>
      <List>
        {menuItems.map((item) => {
          if (item.show) {
            return (
              <ListItem 
                button 
                key={item.text} 
                component={Link} 
                to={item.path}
                selected={isActive(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            );
          }
          return null;
        })}
      </List>
      <Divider />
      {!isAuthenticated ? (
        <List>
          <ListItem button component={Link} to="/login">
            <ListItemIcon><LoginIcon /></ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
          <ListItem button component={Link} to="/register">
            <ListItemIcon><PersonAddIcon /></ListItemIcon>
            <ListItemText primary="Register" />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem button component={Link} to="/profile">
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          {/* Mobile Menu */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleMobileMenu}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <SchoolIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold'
            }}
          >
            Virtual Classroom
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
            {menuItems.map((item) => {
              if (item.show) {
                return (
                  <Button
                    key={item.text}
                    color="inherit"
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      fontWeight: isActive(item.path) ? 'bold' : 'normal',
                      borderBottom: isActive(item.path) ? '3px solid white' : 'none',
                      borderRadius: 0,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                );
              }
              return null;
            })}
          </Box>

          {/* User Menu */}
          {isAuthenticated ? (
            <Box>
              <Tooltip title={user?.name}>
                <IconButton onClick={handleMenu} color="inherit">
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                  <PersonIcon sx={{ mr: 1 }} /> Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate(getDashboardLink()); handleClose(); }}>
                  <DashboardIcon sx={{ mr: 1 }} /> Dashboard
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileMenuOpen} onClose={toggleMobileMenu}>
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;