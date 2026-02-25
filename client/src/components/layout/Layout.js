import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';
import NavigationBreadcrumbs from '../common/NavigationBreadcrumbs';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar />
      <Container 
        component="main" 
        maxWidth="lg" 
        sx={{ 
          flex: 1,
          py: 4,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {isAuthenticated && <NavigationBreadcrumbs />}
        {children}
      </Container>
      <Footer />
    </Box>
  );
};

export default Layout;