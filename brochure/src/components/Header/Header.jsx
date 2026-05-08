'use client';
import React from 'react';
import { Box, Container, Typography, IconButton, Drawer } from '@mui/material';
import Logo from './Logo';
import Link from 'next/link';
import { MdMenu } from 'react-icons/md';
import DesktopNav from './DesktopNav';
import MobileDrawer from './MobileDrawer';
import SearchBar from './SearchBar';

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  return (
    <header
      style={{ 
        width: '100%', 
        backgroundColor: 'white', 
        borderBottom: '1px solid #f0ebe3',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', height: { xs: 70, md: 80 }, gap: { xs: 1, md: 4 } }}>
          {/* Mobile Menu Toggle */}
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#311807' }}
            onClick={() => setIsDrawerOpen(true)}
          >
            <MdMenu size={28} />
          </IconButton>

          {/* Logo & Branding */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box sx={{ width: { xs: 30, md: 45 }, height: { xs: 30, md: 45 } }}>
                <Logo />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography 
                  sx={{ 
                    fontFamily: "'Playfair Display', serif", 
                    fontSize: { xs: '1rem', md: '1.6rem' }, 
                    fontWeight: 800,
                    color: '#311807',
                    lineHeight: 1,
                  }}
                >
                  Anne Creations
                </Typography>
                <Typography 
                  sx={{ 
                    fontSize: { xs: '0.5rem', md: '0.6rem' }, 
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
          
          {/* Search Bar - Center/Right */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mx: { xs: 1, md: 4 } }}>
            <SearchBar />
          </Box>
        </Box>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: { width: '280px', bgcolor: 'white' }
        }}
      >
        <MobileDrawer onClose={() => setIsDrawerOpen(false)} />
      </Drawer>
    </header>
  );
};

export default Header;
