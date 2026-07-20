'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Collapse,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/Store/authStore';
import Logo from './Logo';
import { useTranslation } from 'react-i18next';
import {
  MdExpandMore,
  MdChevronRight,
  MdCategory,
  MdHome,
  MdInfo,
  MdContactSupport,
  MdHelp,
  MdClose,
  MdPalette,
  MdPerson,
  MdCloudDownload,
  MdLogout,
  MdLogin,
  MdPersonAdd,
  MdFavorite,
  MdHistory,
} from 'react-icons/md';
import { FaFacebook, FaInstagram, FaWhatsapp, FaYoutube, FaWallet, FaCalculator, FaEye } from 'react-icons/fa';
import { BsCart3 } from 'react-icons/bs';
import { useWalletStore } from '@/Store/walletStore';
import useWishlistStore from '@/Store/wishlistStore';
import useCartStore from '@/Store/cartStore';

const MobileDrawer = ({ onClose, onOpenCalculator, onOpenStitchViewer }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const { user, accessToken, logout, setAccessToken } = useAuthStore();
  const isAuthenticated = Boolean(accessToken);
  const [mounted, setMounted] = useState(false);
  const { balance } = useWalletStore();
  const wishlistCount = useWishlistStore((s) => s.wishlist?.length || 0);
  const cartCount = useCartStore((s) => s.cart?.length || 0);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && !accessToken) {
      setAccessToken(token);
    }
    setMounted(true);
  }, [accessToken, setAccessToken]);

  const handleNavigate = (path) => {
    router.push(path);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    if (onClose) onClose();
  };

  if (!mounted) return null;

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box',
        bgcolor: 'var(--card-bg)',
      }}
    >
      {/* ── 1. Header: Close + Logo ── */}
      <Box sx={{
        px: 1.5, py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <IconButton onClick={onClose} sx={{ color: 'var(--secondary)', p: 0.5 }}>
          <MdClose size={22} />
        </IconButton>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', pr: 4 }}>
          <Box sx={{ width: 40, height: 40 }}>
            <Logo />
          </Box>
        </Box>
      </Box>

      {/* ── 2. Greeting + Quick Actions (Wallet / Wishlist / Cart) ── */}
      <Box sx={{
        px: 2, py: 1.5,
        bgcolor: 'rgba(49, 24, 7, 0.03)',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'var(--secondary)', mb: 0.5 }}>
          👋 {t('sidebar.hello', 'Hello')}, {isAuthenticated ? user?.lastName || 'User' : 'Guest'}!
        </Typography>

        {/* Social Media - Moved up for better visibility */}
        <Box sx={{ display: 'flex', gap: 2, mb: 1, mt: 0.5 }}>
          <a href="https://www.facebook.com/AnneCreations.HB" target="_blank" rel="noopener noreferrer" className="text-[var(--secondary)] hover:text-[var(--primary)] transition-colors opacity-70">
            <FaFacebook size={18} />
          </a>
          <a href="https://www.instagram.com/annecreations.hb" target="_blank" rel="noopener noreferrer" className="text-[var(--secondary)] hover:text-[var(--primary)] transition-colors opacity-70">
            <FaInstagram size={18} />
          </a>
          <a href="https://wa.me/919951916767" target="_blank" rel="noopener noreferrer" className="text-[var(--secondary)] hover:text-[var(--primary)] transition-colors opacity-70">
            <FaWhatsapp size={18} />
          </a>
          <a href="https://www.youtube.com/@annecreationHB" target="_blank" rel="noopener noreferrer" className="text-[var(--secondary)] hover:text-[var(--primary)] transition-colors opacity-70">
            <FaYoutube size={18} />
          </a>
        </Box>

        {/* Quick action icons row */}
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Box
            onClick={() => handleNavigate('/Profile?tab=wallet')}
            sx={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
              py: 0.8, px: 1,
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              bgcolor: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'var(--primary)', bgcolor: 'rgba(255,183,41,0.05)' }
            }}
          >
            <FaWallet size={14} color="var(--secondary)" />
            <Typography variant="caption" fontWeight={700} color="var(--secondary)">
              {isAuthenticated ? `₹${balance || 0}` : 'Wallet'}
            </Typography>
          </Box>

          <Box
            onClick={() => handleNavigate('/WishList')}
            sx={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
              py: 0.8, px: 1,
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              bgcolor: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'var(--primary)', bgcolor: 'rgba(255,183,41,0.05)' }
            }}
          >
            <MdFavorite size={14} color="var(--secondary)" />
            <Typography variant="caption" fontWeight={700} color="var(--secondary)">
              {wishlistCount > 0 ? `${wishlistCount}` : ''} Wishlist
            </Typography>
          </Box>

          <Box
            onClick={() => {
               useCartStore.getState().setCartOpen(true);
               if (onClose) onClose();
            }}
            sx={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5,
              py: 0.8, px: 1,
              borderRadius: 2,
              border: '1px solid #e0e0e0',
              bgcolor: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { borderColor: 'var(--primary)', bgcolor: 'rgba(255,183,41,0.05)' }
            }}
          >
            <BsCart3 size={14} color="var(--secondary)" />
            <Typography variant="caption" fontWeight={700} color="var(--secondary)">
              {cartCount > 0 ? `${cartCount}` : ''} Cart
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── 3. Scrollable Navigation ── */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List sx={{ p: 0 }} dense>
          {/* Main Nav */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/')} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--secondary)' }}><MdHome size={20} /></ListItemIcon>
              <ListItemText primary={t('nav.home', 'Home')} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>

          {/* Categories Dropdown (Consolidated) */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => setCategoriesOpen(!categoriesOpen)} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--secondary)' }}><MdCategory size={20} /></ListItemIcon>
              <ListItemText primary={t('nav.categories', 'Categories')} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
              {categoriesOpen ? <MdExpandMore size={18} /> : <MdChevronRight size={18} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={categoriesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.01)' }}>
              {[
                { id: 'all', name: t('tabs.all', 'All'), link: '/?tab=all' },
                { id: 'categories', name: t('nav.categories', 'Categories'), link: '/Category' },
                { id: 'deals', name: t('tabs.todays_deals', "Today's Deals"), link: '/?tab=deals' },
                { id: 'new', name: t('tabs.new_releases', 'New Releases'), link: '/?tab=new' },
                { id: 'free', name: t('tabs.free_designs', 'Free Designs'), link: '/?tab=free' },
              ].map((item) => (
                <ListItemButton
                  key={item.id}
                  sx={{ pl: 6.5, py: 0.5 }}
                  onClick={() => handleNavigate(item.link)}
                >
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{ fontSize: '0.85rem', color: 'text.secondary' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>

          <Divider sx={{ my: 0.5 }} />

          {/* Bottom Nav */}
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/About')} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--secondary)' }}><MdInfo size={20} /></ListItemIcon>
              <ListItemText primary={t('nav.about_us', 'About Us')} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/Contactus')} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--secondary)' }}><MdContactSupport size={20} /></ListItemIcon>
              <ListItemText primary={t('nav.contact_us', 'Contact Us')} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/Help')} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--secondary)' }}><MdHelp size={20} /></ListItemIcon>
              <ListItemText primary={t('nav.help', 'Help')} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component="a" href={process.env.NEXT_PUBLIC_BROCHURE_URL || "https://annecreationshb.com/brouchure"} target="_blank" rel="noopener noreferrer" sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--secondary)' }}><MdPalette size={20} /></ListItemIcon>
              <ListItemText primary={t('nav.design', 'Design')} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={onOpenCalculator} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--secondary)' }}><FaCalculator size={18} /></ListItemIcon>
              <ListItemText primary={t('nav.calculator', 'Calculator')} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={onOpenStitchViewer} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--secondary)' }}><FaEye size={18} /></ListItemIcon>
              <ListItemText primary={t('nav.stitch_viewer', 'Stitch Review')} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* ── 4. Auth Section (pinned to bottom) ── */}
      <Divider />
      <Box sx={{ px: 1.5, py: 1, bgcolor: '#fff' }}>
        {isAuthenticated ? (
          <List disablePadding dense>
            <ListItemButton
              sx={{ borderRadius: 1.5, py: 0.5 }}
              onClick={() => handleNavigate('/Profile?tab=profile')}
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'var(--secondary)' }}><MdPerson size={18} /></ListItemIcon>
              <ListItemText primary={t('profile.my_profile', 'My Profile')} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
            </ListItemButton>

            <ListItemButton
              sx={{ borderRadius: 1.5, py: 0.5 }}
              onClick={() => handleNavigate('/Profile?tab=downloads')}
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'var(--secondary)' }}><MdCloudDownload size={18} /></ListItemIcon>
              <ListItemText primary={t('profile.downloads', 'Downloads')} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
            </ListItemButton>

            <ListItemButton
              sx={{ borderRadius: 1.5, py: 0.5, color: 'error.main' }}
              onClick={handleLogout}
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}><MdLogout size={18} /></ListItemIcon>
              <ListItemText primary={t('auth.logout', 'Logout')} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
            </ListItemButton>
          </List>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box
              onClick={() => handleNavigate('/Auth/Login')}
              sx={{
                flex: 1, textAlign: 'center',
                py: 1, borderRadius: 2,
                bgcolor: 'var(--primary)', color: 'var(--secondary)',
                fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 }
              }}
            >
              {t('auth.login', 'Login')}
            </Box>
            <Box
              onClick={() => handleNavigate('/Auth/Register')}
              sx={{
                flex: 1, textAlign: 'center',
                py: 1, borderRadius: 2,
                border: '1.5px solid var(--secondary)', color: 'var(--secondary)',
                fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(49,24,7,0.05)' }
              }}
            >
              {t('auth.register', 'Register')}
            </Box>
          </Box>
        )}
      </Box>

      {/* ── 5. Social Media Footer (always visible) ── */}
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'center', bgcolor: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
        <Typography variant="caption" color="text.secondary">
          {t('footer.rights_reserved', '© 2025 Anne Creations')}
        </Typography>
      </Box>
    </Box>
  );
};

export default MobileDrawer;

