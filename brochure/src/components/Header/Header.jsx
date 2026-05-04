'use client';
import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import Logo from './Logo';
import Link from 'next/link';
import DesktopNav from './DesktopNav';

const Header = () => {
  return (
    <Box 
      component="header" 
      sx={{ 
        width: '100%', 
        bgcolor: 'white', 
        borderBottom: '1px solid #f0ebe3',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', height: 80, gap: 4 }}>
          {/* Logo & Branding */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box sx={{ width: { xs: 35, md: 45 }, height: { xs: 35, md: 45 } }}>
                <Logo />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  sx={{ 
                    fontFamily: "'Playfair Display', serif", 
                    fontSize: { xs: '1.1rem', md: '1.6rem' }, 
                    fontWeight: 800,
                    color: '#311807',
                    lineHeight: 1,
                  }}
                >
                  Anne Creations
                </Typography>
                <Typography 
                  sx={{ 
                    fontSize: '0.6rem', 
                    color: '#8B4513', 
                    fontWeight: 800, 
                    letterSpacing: '1px', 
                    textTransform: 'uppercase',
                  }}
                >
                  Digital Brochure
                </Typography>
            </Box>
          </Link>

          {/* Navigation Links - Desktop Only */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 2 }}>
            <DesktopNav />
          </Box>
          
          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />
        </Box>
      </Container>
    </Box>
  );
};

export default Header;
