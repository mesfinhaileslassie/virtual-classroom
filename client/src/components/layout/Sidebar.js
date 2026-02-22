import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Avatar,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  Forum as ForumIcon,
  Announcement as AnnouncementIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Correct path

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user, logout, isTeacher, isStudent } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: isTeacher ? '/teacher/dashboard' : '/student/dashboard' },
    { text: 'My Classes', icon: <ClassIcon />, path: '/classes' },
    { text: 'Assignments', icon: <AssignmentIcon />, path: '/assignments' },
    { text: 'Discussions', icon: <ForumIcon />, path: '/discussions' },
    { text: 'Announcements', icon: <AnnouncementIcon />, path: '/announcements' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawerContent = (
    <Box sx={{ width: 250 }}>
      {/* User Info */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar
          src={user?.profilePicture}
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 1,
            bgcolor: 'secondary.main'
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="bold">
          {user?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
        </Typography>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleNavigation(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={logout} sx={{ color: 'error.main' }}>
            <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant={isMobile ? 'temporary' : variant}
      sx={{
        width: 250,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 250,
          boxSizing: 'border-box',
          top: ['48px', '56px', '64px'],
          height: 'auto',
          bottom: 0,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;