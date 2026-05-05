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
import { FaFacebook, FaInstagram, FaWhatsapp, FaYoutube, FaWallet } from 'react-icons/fa';
import { BsCart3 } from 'react-icons/bs';
import { useWalletStore } from '@/Store/walletStore';
import useWishlistStore from '@/Store/wishlistStore';
import useCartStore from '@/Store/cartStore';

import useCategory from '@/hook/useCategory';

const MobileDrawer = ({ onClose }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { categories } = useCategory();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigate = (path) => {
    router.push(path);
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

      {/* ── 2. Greeting ── */}
      <Box sx={{
        px: 2, py: 1.5,
        bgcolor: 'rgba(49, 24, 7, 0.03)',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'var(--secondary)', mb: 0.5 }}>
          👋 Hello, Guest!
        </Typography>

        {/* Social Media */}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
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
      </Box>

      {/* ── 3. Navigation ── */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List sx={{ p: 0 }} dense>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/')} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--secondary)' }}><MdHome size={20} /></ListItemIcon>
              <ListItemText primary={t('nav.home', 'Home')} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => setCategoriesOpen(!categoriesOpen)} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36, color: 'var(--secondary)' }}><MdCategory size={20} /></ListItemIcon>
              <ListItemText primary={t('nav.categories', 'Categories')} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
              {categoriesOpen ? <MdExpandMore size={18} /> : <MdChevronRight size={18} />}
            </ListItemButton>
          </ListItem>

          <Collapse in={categoriesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.01)' }}>
              {/* List Categories from API */}
              {(categories || [])
                .filter(c => c.name && c.name !== 'All')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((cat) => (
                  <ListItemButton
                    key={cat._id}
                    sx={{ pl: 6.5, py: 0.5 }}
                    onClick={() => handleNavigate(`/category/${cat._id}?name=${encodeURIComponent(cat.name)}`)}
                  >
                    <ListItemText
                      primary={cat.name}
                      primaryTypographyProps={{ fontSize: '0.85rem', color: 'text.secondary' }}
                    />
                  </ListItemButton>
                ))}
            </List>
          </Collapse>
        </List>
      </Box>

      {/* ── 4. Footer ── */}
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'center', bgcolor: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
        <Typography variant="caption" color="text.secondary">
          {t('footer.rights_reserved', '© 2025 Anne Creations')}
        </Typography>
      </Box>
    </Box>
  );
};

export default MobileDrawer;
