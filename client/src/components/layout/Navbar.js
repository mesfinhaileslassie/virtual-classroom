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
  Tooltip,
  ListItemAvatar
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
  Settings as SettingsIcon,
  Home as HomeIcon,
  Grade as GradeIcon,
  NewReleases as NewIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isTeacher, isStudent } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotifications();
  
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.action) {
      navigate(notification.action);
    }
    handleNotificationsClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleClose();
  };

  const getDashboardLink = () => {
    if (isTeacher) return '/teacher/dashboard';
    if (isStudent) return '/student/dashboard';
    return '/admin/dashboard';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/', public: true },
    { text: 'Classes', icon: <ClassIcon />, path: '/classes', protected: true },
    { text: 'Assignments', icon: <AssignmentIcon />, path: '/assignments', protected: true },
    { text: 'Discussions', icon: <ForumIcon />, path: '/discussions', protected: true },
  ];

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'grading':
        return <GradeIcon color="warning" />;
      case 'new_assignment':
        return <NewIcon color="info" />;
      case 'grade_posted':
        return <CheckCircleIcon color="success" />;
      default:
        return <ScheduleIcon color="action" />;
    }
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleMobileMenu}>
      <List>
        {menuItems.map((item) => {
          if (item.public || (item.protected && isAuthenticated)) {
            return (
              <ListItem button key={item.text} component={Link} to={item.path}>
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
      <AppBar position="sticky" sx={{ mb: 4 }}>
        <Toolbar>
          {/* Mobile Menu Icon */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleMobileMenu}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <SchoolIcon sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
              letterSpacing: 1
            }}
          >
            Virtual Classroom
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, alignItems: 'center' }}>
            {menuItems.map((item) => {
              if (item.public || (item.protected && isAuthenticated)) {
                return (
                  <Button
                    key={item.text}
                    color="inherit"
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                  >
                    {item.text}
                  </Button>
                );
              }
              return null;
            })}

            {isAuthenticated && (
              <>
                {/* Notifications */}
                <Tooltip title="Notifications">
                  <IconButton color="inherit" onClick={handleNotificationsOpen}>
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* User Menu */}
                <Tooltip title={user?.name}>
                  <IconButton
                    onClick={handleMenu}
                    color="inherit"
                    sx={{ ml: 1 }}
                  >
                    <Avatar
                      src={user?.profilePicture}
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'secondary.main',
                        border: '2px solid white'
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                    <PersonIcon sx={{ mr: 1 }} /> Profile
                  </MenuItem>
                  <MenuItem onClick={() => { navigate(getDashboardLink()); handleClose(); }}>
                    <DashboardIcon sx={{ mr: 1 }} /> Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { navigate('/settings'); handleClose(); }}>
                    <SettingsIcon sx={{ mr: 1 }} /> Settings
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <LogoutIcon sx={{ mr: 1 }} /> Logout
                  </MenuItem>
                </Menu>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  startIcon={<LoginIcon />}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/register"
                  startIcon={<PersonAddIcon />}
                  variant="outlined"
                  sx={{ borderColor: 'white', '&:hover': { borderColor: 'white' } }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notifications Menu - Role Based */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: { 
            width: 400, 
            maxHeight: 500,
            overflow: 'auto'
          }
        }}
      >
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Notifications {isTeacher ? '👨‍🏫' : '👩‍🎓'}
            </Typography>
            <Box>
              {notifications.length > 0 && (
                <>
                  <Button 
                    size="small" 
                    sx={{ color: 'white', mr: 1 }}
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                  <Button 
                    size="small" 
                    sx={{ color: 'white' }}
                    onClick={clearAll}
                  >
                    Clear all
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>
        
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.05)',
                borderLeft: notification.read ? 'none' : '4px solid #1976d2',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'transparent' }}>
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemAvatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(notification.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}

        {isTeacher && notifications.filter(n => n.type === 'grading').length > 0 && (
          <Box sx={{ p: 2, bgcolor: '#fff3e0' }}>
            <Typography variant="body2" color="warning.dark">
              ⚠️ You have pending assignments to grade
            </Typography>
          </Box>
        )}

        {isStudent && notifications.filter(n => n.type === 'new_assignment').length > 0 && (
          <Box sx={{ p: 2, bgcolor: '#e3f2fd' }}>
            <Typography variant="body2" color="info.dark">
              📚 New assignments available
            </Typography>
          </Box>
        )}
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navbar;