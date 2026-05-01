'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import Logo from './Logo';
import Link from 'next/link';

const Header = () => {
  return (
    <Box 
      component="header" 
      sx={{ 
        width: '100%', 
        py: 1, 
        bgcolor: 'white', 
        borderBottom: '1px solid #f0ebe3',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box sx={{ width: 40, height: 40 }}>
                <Logo />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  sx={{ 
                    fontFamily: "'Playfair Display', serif", 
                    fontSize: { xs: '1.2rem', md: '1.5rem' }, 
                    fontWeight: 800,
                    color: '#311807',
                    lineHeight: 1,
                    letterSpacing: '0.5px',
                  }}
                >
                  Anne Creations
                </Typography>
                <Typography 
                  sx={{ 
                    fontSize: '0.65rem', 
                    color: '#8B4513', 
                    fontWeight: 800, 
                    letterSpacing: '1px', 
                    textTransform: 'uppercase',
                    mt: -0.5
                  }}
                >
                  Premium Embroidery Series
                </Typography>
            </Box>
          </Link>
      </Container>
    </Box>
  );
};

export default Header;
