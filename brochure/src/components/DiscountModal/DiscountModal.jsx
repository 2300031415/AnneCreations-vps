'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { IoClose, IoGift, IoBag, IoCopy } from 'react-icons/io5';
// import { useSnackbar } from 'notistack';

const DiscountModal = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [couponCode, setCouponCode] = useState('NEW');
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [discountType, setDiscountType] = useState('P');
  const [isActive, setIsActive] = useState(false); // To control if modal actually has content

  useEffect(() => {
    let timerId;
    const fetchCoupon = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/coupons/public/active`);
        if (!response.ok) return;

        const data = await response.json();

        if (data.success && data.data) {
          const fetchedCode = data.data.code;
          setCouponCode(fetchedCode);
          setDiscountPercentage(data.data.discount);
          setDiscountType(data.data.type || 'P');
          setIsActive(true);

          const shownCouponCode = sessionStorage.getItem('shownCouponCode');

          if (shownCouponCode !== fetchedCode) {
            // Auto popup disabled as per user request
            /*
            timerId = setTimeout(() => {
              setOpen(true);
              sessionStorage.setItem('shownCouponCode', fetchedCode);
            }, 2000);
            */
          }
        }
      } catch (error) {
        console.error("Failed to fetch active coupon:", error);
      }
    };

    fetchCoupon();

    const handleFocus = () => {
      fetchCoupon();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(couponCode);
      } else {
        // Fallback for HTTP environments
        const textArea = document.createElement("textarea");
        textArea.value = couponCode;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!successful) throw new Error('Fallback copying failed');
      }
      setCopied(true);
      // enqueueSnackbar('Coupon code copied to clipboard!', { variant: 'success' });
      alert('Coupon code copied to clipboard!');

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // enqueueSnackbar('Failed to copy coupon code', { variant: 'error' });
      alert('Failed to copy coupon code');
    }
  };

  const handleShopNow = () => {
    setOpen(false);
    window.location.href = '/';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs" // Reduced from sm
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '3px solid var(--primary)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          maxWidth: '420px', // Custom max width
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {/* Close Button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 12, // Reduced from 16
            right: 12, // Reduced from 16
            zIndex: 1,
            backgroundColor: 'rgba(255,255,255,0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,1)',
            },
          }}
        >
          <IoClose size={20} />
        </IconButton>

        <Card
          sx={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
            boxShadow: 'none',
            borderRadius: 0,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, textAlign: 'center' }}>
            {/* Header */}
            <Box sx={{ mb: 2.5 }}>
              <IoGift
                size={55} // Reduced from 80
                style={{
                  color: 'var(--primary)',
                  marginBottom: '12px',
                  animation: 'pulse 2s infinite',
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                  color: 'var(--secondary)',
                  mb: 0.5,
                  fontSize: { xs: '1.4rem', md: '1.9rem' }, // Reduced
                  background: 'linear-gradient(45deg, var(--secondary) 30%, var(--primary) 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Special Offer!
              </Typography>
              <Typography
                variant="h6" // Changed from h5
                sx={{
                  fontFamily: 'Poppins',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  mb: 1.5,
                  fontSize: '1.1rem',
                }}
              >
                Get {discountType === 'P' ? `${discountPercentage}%` : `₹${discountPercentage}`} OFF
              </Typography>
            </Box>

            {/* Coupon Code Section */}
            <Box
              sx={{
                p: 2, // Reduced from 3
                mb: 2.5, // Reduced from 4
                borderRadius: 3,
                background: 'linear-gradient(135deg, var(--primary) 0%, #FFC947 100%)',
                border: '2px solid var(--primary)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
                },
              }}
            >
              <Typography
                variant="body2" // Changed from body1
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  mb: 1.5,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Use this coupon code:
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.5,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Chip
                  label={couponCode}
                  sx={{
                    backgroundColor: 'white',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '1.1rem', // Reduced from 1.2
                    px: 1.5,
                    py: 0.5,
                    height: 'auto',
                    '& .MuiChip-label': {
                      px: 1.5,
                    },
                  }}
                />
                <IconButton
                  onClick={handleCopyCode}
                  size="small" // Added
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    p: 0.8,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  <IoCopy size={18} />
                </IconButton>
              </Box>

              {copied && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    mt: 0.5,
                    display: 'block',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  ✓ Copied!
                </Typography>
              )}
            </Box>

            {/* Description */}
            <Typography
              variant="body2" // Changed from body1
              sx={{
                color: '#666',
                mb: 3, // Reduced from 4
                fontSize: '0.95rem', // Reduced
                lineHeight: 1.5,
              }}
            >
              Get {discountType === 'P' ? `${discountPercentage}%` : `₹${discountPercentage}`} off on your order.
              Use code <strong>{couponCode}</strong> at checkout.
            </Typography>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1.5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Button
                variant="outlined"
                onClick={handleClose}
                size="small"
                sx={{
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  minWidth: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                  },
                }}
              >
                Maybe Later
              </Button>

              <Button
                variant="contained"
                startIcon={<IoBag size={18} />}
                onClick={handleShopNow}
                size="small"
                sx={{
                  background: 'linear-gradient(45deg, var(--primary) 30%, #FFC947 90%)',
                  color: 'white',
                  fontWeight: 700,
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  minWidth: { xs: '100%', sm: 'auto' },
                  boxShadow: '0 4px 15px rgba(255, 183, 41, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(255, 183, 41, 0.4)',
                  },
                }}
              >
                Shop Now
              </Button>
            </Box>

            {/* Footer */}
            <Typography
              variant="caption"
              sx={{
                color: '#999',
                mt: 3,
                display: 'block',
                fontSize: '0.8rem',
              }}
            >

            </Typography>
          </CardContent>
        </Card>
      </DialogContent>

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </Dialog>
  );
};

export default DiscountModal;
