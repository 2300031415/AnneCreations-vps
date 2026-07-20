'use client'
import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Drawer,
} from '@mui/material'
import ProfileMenu from './ProfileMenu'
import Logo from './Logo'
import GlobalCalculatorModal from './GlobalCalculatorModal'
import GlobalStitchViewerModal from './GlobalStitchViewerModal'
import LanguageSelector from './LanguageSelector'
import { FaBars, FaWallet, FaCalculator, FaEye } from 'react-icons/fa'
import { MdMenu } from 'react-icons/md'
import MobileDrawer from './MobileDrawer'
import { Tooltip, Badge } from '@mui/material'
import { useWalletStore } from '@/Store/walletStore';
import { useAuthStore } from '@/Store/authStore';
import { useEffect } from 'react';

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation';
import { useFilterStore } from '@/Store/filterStore';
import { useTranslation } from 'react-i18next';

const Header_links = () => {
  const { t } = useTranslation();
  const [profileAnchorEl, setProfileAnchorEl] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [stitchViewerOpen, setStitchViewerOpen] = useState(false)
  const pathname = usePathname();
  const router = useRouter();
  const resetFilters = useFilterStore(state => state.resetFilters);
  const { balance, fetchWallet } = useWalletStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWallet();
    }
  }, [isAuthenticated, fetchWallet]);

  const handleHomeClick = (e) => {
    resetFilters();
    if (pathname === '/') {
      e.preventDefault();
      router.refresh();
    }
  };

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget)
  }

  const handleProfileClose = () => {
    setProfileAnchorEl(null)
  }

  const isActive = (path) => pathname === path;
  const linkClass = (path) => `font-semibold no-underline text-base transition-all pb-1 ${isActive(path)
    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
    : 'text-[var(--secondary)] hover:text-[var(--primary)]'
    }`;

  return (
    <AppBar
      position="static"
      sx={{ bgcolor: 'var(--card-bg)', color: 'var(--text)', boxShadow: 'none' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: '0 !important', minHeight: { xs: '56px', sm: '64px' }, gap: 0.5 }}>
        {/* Left: Menu Button (Mobile) + Logo + Name + Nav Links (Desktop) */}
        <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1 }} sx={{ minWidth: 0, overflow: 'hidden' }}>
          {/* Mobile Menu Button */}
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            sx={{ display: { xs: 'flex', md: 'none' }, color: 'var(--secondary)', p: { xs: 0.5, sm: 1 } }}
          >
            <MdMenu size={24} />
          </IconButton>

          {/* Branding */}
          <Link href="/" onClick={handleHomeClick} className="flex items-center gap-1 sm:gap-2 no-underline min-w-0">
            <Box sx={{ flexShrink: 0, width: { xs: 32, sm: 50 }, height: { xs: 32, sm: 50 } }}>
              <Logo />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <span className="block text-base sm:text-2xl font-bold text-[var(--secondary)] leading-none truncate">
                Anne Creations
              </span>
              <span className="hidden md:block text-xs text-[var(--primary)] font-semibold tracking-wider uppercase mt-1">
                Embroidery Designs
              </span>
            </Box>
          </Link>

          {/* Nav Links - Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, ml: 4, alignItems: 'center' }}>
            <Link href="/" onClick={handleHomeClick} className={linkClass('/')}>
              {t('nav.home')}
            </Link>
            <Link href="/About" className={linkClass('/About')}>
              {t('nav.about_us')}
            </Link>
            <Link href="/Contactus" className={linkClass('/Contactus')}>
              {t('nav.contact_us')}
            </Link>
            <Link href="/Help" className={linkClass('/Help')}>
              {t('nav.help')}
            </Link>
            <a href={process.env.NEXT_PUBLIC_BROCHURE_URL || "https://annecreationshb.com/brouchure"} target="_blank" rel="noopener noreferrer" className={linkClass('/brochure')}>
              {t('nav.design')}
            </a>
            <span 
              onClick={() => setCalculatorOpen(true)} 
              style={{ cursor: 'pointer', display: 'inline-block', verticalAlign: 'middle' }}
              className={linkClass('/calculator')}
            >
              {t('nav.calculator')}
            </span>
            <span 
              onClick={() => setStitchViewerOpen(true)} 
              style={{ cursor: 'pointer', display: 'inline-block', verticalAlign: 'middle' }}
              className={linkClass('/stitch-viewer')}
            >
              {t('nav.stitch_viewer', 'Stitch Review')}
            </span>
          </Box>
        </Box>
        
        <GlobalCalculatorModal open={calculatorOpen} onClose={() => setCalculatorOpen(false)} />
        <GlobalStitchViewerModal open={stitchViewerOpen} onClose={() => setStitchViewerOpen(false)} />

        {/* Right: Language + Wallet + Profile */}
        <Box display="flex" alignItems="center" sx={{ flexShrink: 0 }}>
          {/* Language selector - hidden on very small screens, shown on sm+ */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <LanguageSelector />
          </Box>
          {/* Compact language icon for xs screens */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <LanguageSelector compact />
          </Box>
          <Tooltip title={isAuthenticated ? `Wallet: ₹${balance}` : 'My Wallet'}>
            <IconButton
              onClick={() => {
                if (isAuthenticated) {
                  router.push('/Profile?tab=wallet');
                } else {
                  useAuthStore.getState().setLoginPopupOpen(true);
                }
              }}
              aria-label={isAuthenticated ? `Wallet balance: ₹${balance}` : 'Open Wallet'}
              sx={{ color: 'var(--secondary)', display: { xs: 'none', sm: 'flex' }, ml: 0.5 }}
            >
              <Badge badgeContent={isAuthenticated && balance > 0 ? '₹' : null} color="success">
                <FaWallet size={18} />
              </Badge>
            </IconButton>
          </Tooltip>
          <ProfileMenu
            anchorEl={profileAnchorEl}
            handleClick={handleProfileClick}
            handleClose={handleProfileClose}
          />
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ sx: { width: '85%', maxWidth: 360 } }}
      >
        <MobileDrawer 
          onClose={() => setMobileMenuOpen(false)} 
          onOpenCalculator={() => {
            setMobileMenuOpen(false);
            setCalculatorOpen(true);
          }}
          onOpenStitchViewer={() => {
            setMobileMenuOpen(false);
            setStitchViewerOpen(true);
          }}
        />
      </Drawer>
    </AppBar>
  )
}

export default Header_links

