'use client';

import React from 'react';
import PropTypes from 'prop-types';
// Using plain img instead of next/image to avoid domain restriction issues
import Link from 'next/link';
import {
  Card,
  CardContent,
  Box,
  IconButton,
  Typography,
  Rating,
} from '@mui/material';
import { FaHeart, FaRegHeart, FaEye } from 'react-icons/fa';
import { MdPictureAsPdf } from 'react-icons/md';
import ProductPreviewModal from './productdetails';
import { useArrivalCardLogic } from './CardLogic';
import QuickViewModal from '../ProductCard/QuickViewModal';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BsCart3 } from 'react-icons/bs';
import useCartStore from '@/Store/cartStore';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
`;

const ArrivalCard = ({ item, showQuickView = false }) => {
  const { t } = useTranslation();
  const {
    hover,
    setHover,
    loading,
    modalOpen,
    setModalOpen,
    previewOpen,
    setPreviewOpen,
    liked,
    handleToggleWishlist,
    isAuthenticated,
  } = useArrivalCardLogic(item);

  const { addToCart, setCartOpen, setPendingQuickAdd } = useCartStore();

  const [quickViewOpen, setQuickViewOpen] = React.useState(false);

  // Determine display price
  let displayPrice = "N/A";
  let hasSale = false;
  let originalPriceDisplay = null;

  if (Array.isArray(item.options) && item.options.length > 0) {
    const validOptions = item.options.filter(opt => typeof opt.price === 'number' && !isNaN(opt.price));
    if (validOptions.length > 0) {
      // Find the option with the lowest effective price
      const minPriceOpt = validOptions.reduce((min, opt) => {
        const optEffective = opt.salePrice !== undefined ? opt.salePrice : opt.price;
        const minEffective = min.salePrice !== undefined ? min.salePrice : min.price;
        return optEffective < minEffective ? opt : min;
      }, validOptions[0]);

      if (minPriceOpt.salePrice !== undefined && minPriceOpt.salePrice < minPriceOpt.price) {
        hasSale = true;
        displayPrice = minPriceOpt.salePrice > 0 ? `₹${minPriceOpt.salePrice}` : "Free";
        originalPriceDisplay = `₹${minPriceOpt.price}`;
      } else {
        const minPrice = minPriceOpt.price;
        if (minPrice > 0) {
          displayPrice = `₹${minPrice}`;
        } else {
          displayPrice = "Free";
        }
      }
    }
  }

  return (
    <>
      <Card
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: 2,
          borderRadius: 2,
          cursor: 'pointer',
          overflow: 'hidden',
          m: 1,
          backgroundColor: 'var(--primary)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-12px) scale(1.03)',
            boxShadow: 10,
          },
        }}
      >
        <Link href={`/product/${item.productModel}`} passHref>

          {/* Product Image */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingTop: '100%', // maintains square aspect ratio
              backgroundColor: 'black',
            }}
          >
            {item.image ? (
              <img
                src={item.image.startsWith('http')
                  ? item.image
                  : `${process.env.NEXT_PUBLIC_API_URL}/${item.image}`
                }
                alt={item.design || 'Product image'}
                style={{ objectFit: 'contain', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                onError={(e) => { 
                  e.target.style.display = 'none';
                  if (e.target.parentElement && e.target.parentElement.lastChild === e.target) {
                    const el = document.createElement('div');
                    el.style.color = 'white';
                    el.style.wordBreak = 'break-all';
                    el.style.padding = '10px';
                    el.innerText = "Err: " + e.target.src;
                    e.target.parentElement.appendChild(el);
                  }
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                No Image Available
              </Box>
            )}

            {/* Today's Deal Badge */}
            {item.todayDeal && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  bgcolor: '#ff4d4d',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  zIndex: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  textTransform: 'uppercase',
                  animation: 'pulse 2s infinite'
                }}
              >
                Today's Deal
              </Box>
            )}

            {/* Product Info - Appears on Hover */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                bgcolor: 'var(--primary)', // Green background
                color: 'white',
                p: '12px',
                transform: hover ? 'translateY(0)' : 'translateY(100%)', // Slide up effect
                transition: 'transform 0.3s ease-out',
                zIndex: 10,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                <Typography variant="body2" fontWeight={600} fontSize={16} noWrap sx={{ color: 'white' }}>
                  {item.productModel}
                </Typography>

                <Box display="flex" alignItems="center" gap={1}>
                  {hasSale && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'line-through !important', fontSize: '0.8rem' }}
                    >
                      {originalPriceDisplay}
                    </Typography>
                  )}
                  <Typography variant="body2" fontWeight={700} sx={{ color: hasSale ? '#ffeb3b' : 'white' }}>
                    {displayPrice}
                  </Typography>
                </Box>
              </Box>

              {/* Stars removed as per request */}
            </Box>

            {/* Hover Actions */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: hover ? 'rgba(0,0,0,0.05)' : 'transparent',
                opacity: 1,
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start', // Align to top
                zIndex: 2,
                pointerEvents: 'none',
              }}
            >
              <Box 
                className="flex m-2 flex-col items-end gap-1.5" 
                sx={{ 
                  pointerEvents: 'auto',
                  opacity: { xs: 1, md: hover ? 1 : 0 },
                  transition: 'opacity 0.3s ease'
                }}
              >
                {/* ❤️ Wishlist Button */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleToggleWishlist();
                  }}
                  disabled={loading}
                  sx={{
                    backgroundColor: 'white',
                    color: '#8B4513',
                    boxShadow: 2,
                    p: 0.8,
                    '&:hover': {
                      backgroundColor: '#8B4513',
                      color: 'white',
                    },
                  }}
                >
                  {liked ? (
                    <FaHeart size={16} color="red" />
                  ) : (
                    <FaRegHeart size={16} />
                  )}
                </IconButton>

                {/* 👁️ Preview Button */}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setPreviewOpen(true);
                  }}
                  sx={{
                    backgroundColor: 'white',
                    color: '#8B4513',
                    boxShadow: 2,
                    p: 0.8,
                    '&:hover': {
                      backgroundColor: '#8B4513',
                      color: 'white',
                    },
                  }}
                >
                  <FaEye size={16} />
                </IconButton>

                {/* 📄 PDF Download Button */}
                {process.env.NEXT_PUBLIC_API_URL && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${item._id}/pdf`, '_blank');
                    }}
                    sx={{
                      backgroundColor: 'white',
                      color: '#8B4513',
                      boxShadow: 2,
                      p: 0.8,
                      '&:hover': {
                        backgroundColor: '#8B4513',
                        color: 'white',
                      },
                    }}
                  >
                    <MdPictureAsPdf size={16} />
                  </IconButton>
                )}

                {/* ⚡ Quick View & Cart Buttons */}
                {showQuickView && (
                  <>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!isAuthenticated) {
                          setModalOpen(true);
                          return;
                        }
                        setPendingQuickAdd(item);
                        setCartOpen(true);
                      }}
                      sx={{
                        backgroundColor: 'white',
                        color: '#8B4513',
                        boxShadow: 2,
                        p: 0.8,
                        '&:hover': {
                          backgroundColor: '#8B4513',
                          color: 'white',
                        },
                      }}
                    >
                      <BsCart3 size={16} />
                    </IconButton>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setQuickViewOpen(true);
                      }}
                      variant="contained"
                      sx={{
                        backgroundColor: 'white',
                        color: '#8B4513',
                        fontSize: '9px',
                        fontWeight: 700,
                        borderRadius: '20px', // Pill shape as requested
                        boxShadow: 3,
                        minWidth: '70px',
                        py: 0.5,
                        px: 1.2,
                        '&:hover': {
                          backgroundColor: '#8B4513',
                          color: 'white',
                        },
                        border: '1px solid #8B4513',
                      }}
                    >
                      QUICK VIEW
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Link>
      </Card>

      {/* Modals */}
      <ProductPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        product={item}
      />
      {showQuickView && (
        <QuickViewModal
          open={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          item={item}
        />
      )}
    </>
  );
};

ArrivalCard.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    productModel: PropTypes.string,
    design: PropTypes.string,
    image: PropTypes.string,
    price: PropTypes.number,
    sku: PropTypes.string,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        option: PropTypes.shape({
          _id: PropTypes.string.isRequired,
        }),
        price: PropTypes.number,
      })
    ),
  }).isRequired,
};

export default ArrivalCard;

