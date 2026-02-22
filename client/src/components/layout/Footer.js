import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  GitHub,
  School as SchoolIcon
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.dark',
        color: 'white',
        py: 6,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Virtual Classroom
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
              An online platform for teachers and students to connect, 
              learn, and grow together. Create classes, share assignments, 
              and collaborate in real-time.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="inherit" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" size="small">
                <LinkedIn />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" size="small">
                <GitHub />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                Home
              </Link>
              <Link href="/classes" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                Classes
              </Link>
              <Link href="/about" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                About Us
              </Link>
              <Link href="/contact" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                Contact
              </Link>
            </Box>
          </Grid>

          {/* Support */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/faq" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                FAQ
              </Link>
              <Link href="/help" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                Help Center
              </Link>
              <Link href="/privacy" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                Privacy Policy
              </Link>
              <Link href="/terms" color="inherit" underline="hover" sx={{ opacity: 0.8 }}>
                Terms of Service
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
              Email: support@virtualclassroom.com
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
              Phone: +1 (555) 123-4567
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Address: 123 Education Street, Learning City, ED 12345
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* Copyright */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} Virtual Classroom. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="/privacy" color="inherit" underline="hover" sx={{ opacity: 0.6, fontSize: '0.875rem' }}>
              Privacy
            </Link>
            <Link href="/terms" color="inherit" underline="hover" sx={{ opacity: 0.6, fontSize: '0.875rem' }}>
              Terms
            </Link>
            <Link href="/cookies" color="inherit" underline="hover" sx={{ opacity: 0.6, fontSize: '0.875rem' }}>
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;