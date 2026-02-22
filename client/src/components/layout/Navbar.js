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
  Settings as SettingsIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Correct path

const Navbar = () => {
  const { user, isAuthenticated, logout, isTeacher, isStudent } = useAuth();
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
                    <Badge badgeContent={3} color="error">
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

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Notifications
          </Typography>
          <Divider />
          <MenuItem>
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                New Assignment
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Mathematics 101 - Due in 2 days
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem>
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                Grade Posted
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Your assignment has been graded
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem>
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                New Discussion
              </Typography>
              <Typography variant="caption" color="text.secondary">
                John commented on your post
              </Typography>
            </Box>
          </MenuItem>
        </Box>
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