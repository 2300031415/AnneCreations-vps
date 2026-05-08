'use client';

import React, { useState } from 'react';
import {
  TableCell,
  TableRow,
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from '@mui/material';
import Image from 'next/image';
import PropTypes from 'prop-types';
import useCartStore from '@/Store/cartStore';
import { API_URL } from '@/Store/authStore';
import { useRouter } from 'next/navigation';
import useWishlist from '@/hook/useWishlist';

const CartItemRow = ({ item, checkout = false }) => {
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const router = useRouter();
  const { addToWishlist } = useWishlist();
  const [openModal, setOpenModal] = useState(false);

  const isMobile = useMediaQuery('(max-width:640px)');

  const productData = item.product;

  const goToProductPage = () => {
    if (item.product?._id) router.push(`/product/${item.product.productModel}`);
  };

  const optionsTotal = Array.isArray(item.options)
    ? item.options.reduce((sum, opt) => sum + (opt.salePrice !== undefined ? opt.salePrice : (opt.price || 0)), 0)
    : 0;

  const itemPrice = item.subtotal ?? optionsTotal;

  const handleRemove = () => {
    removeFromCart(item.product?._id);
    setOpenModal(false);
  };

  const handleAddToWishlist = () => {
    if (item.product) {
      addToWishlist(item.product);
    }
    setOpenModal(false);
  };

  const renderDescription = (desc) => {
    if (!desc) return null;
    // Check if it's a structured description with **
    if (desc.includes('**')) {
      const parts = desc.split('**').filter(p => p.trim());
      const lines = [];
      for (let i = 0; i < parts.length; i += 2) {
        if (parts[i] && parts[i + 1]) {
          lines.push(
            <Typography key={i} variant="caption" display="block" sx={{ color: 'var(--secondary)', fontSize: '0.75rem', lineHeight: 1.4 }}>
              <strong>{parts[i]}</strong> {parts[i + 1]}
            </Typography>
          );
        } else if (parts[i]) {
          lines.push(
            <Typography key={i} variant="caption" display="block" sx={{ color: 'var(--secondary)', fontSize: '0.75rem', lineHeight: 1.4 }}>
              {parts[i]}
            </Typography>
          );
        }
      }
      return <Box sx={{ mt: 1 }}>{lines}</Box>;
    }
    return <Typography variant="caption" display="block">{desc}</Typography>;
  };

  return (
    <>
      {/* ------------------------
          MOBILE: card layout
        ------------------------ */}
      {isMobile ? (
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          p={1}
          mb={1.5}
          border="1px solid var(--primary)"
          borderRadius={2}
          sx={{ flexDirection: 'row' }}
        >
          {/* Image */}
          <Box
            onClick={goToProductPage}
            sx={{
              cursor: item.product ? 'pointer' : 'default',
              width: 75,
              height: 75,
              borderRadius: 2,
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            {productData?.image ? (
              <Image
                src={`${API_URL}/${(productData.image || '').replace(/^(\/|image\/)+/, '')}`}
                alt={productData?.productModel || 'Item'}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <Box
                width="100%"
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor="#f5f5f5"
              >
                <Typography variant="caption" color="textSecondary">
                  No image
                </Typography>
              </Box>
            )}
          </Box>

          {/* Info */}
          <Box flex={1} textAlign="left">
            <Typography
              variant="body2"
              fontWeight="bold"
              color="secondary"
              onClick={goToProductPage}
              sx={{
                cursor: item.product ? 'pointer' : 'default',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {item.product?.productModel || 'Unknown Product'}
            </Typography>

            {Array.isArray(item.options) &&
              item.options.map((opt, index) => (
                <Typography
                  key={opt.option?._id || index}
                  variant="caption"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <span>{opt.option?.name || 'Option'} - </span>
                  {opt.salePrice !== undefined && opt.salePrice < opt.price ? (
                    <>
                      <span style={{ textDecoration: 'line-through !important', color: 'gray', fontSize: '0.7rem' }}>₹{opt.price}</span>
                      <span style={{ fontWeight: 'bold', color: '#99aa55' }}>₹{opt.salePrice}</span>
                    </>
                  ) : (
                    <span>₹{opt.price || 0}</span>
                  )}
                </Typography>
              ))}

            <Typography variant="body2" fontWeight={600} mt={0.5}>
              ₹{itemPrice.toFixed(2)}
            </Typography>

            {!checkout && (
              <Button
                onClick={() => setOpenModal(true)}
                variant="outlined"
                size="small"
                sx={{
                  mt: 0.5,
                  py: 0.3,
                  px: 2,
                  fontWeight: 600,
                  fontSize: 11,
                  color: '#311807',
                  borderColor: 'var(--primary)',
                  '&:hover': { backgroundColor: 'var(--primary)', color: '#fff' },
                }}
              >
                Remove
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        /* ------------------------
           DESKTOP: table row layout
         ------------------------ */
        <TableRow>
          <TableCell sx={{ width: 200, padding: '16px' }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{ cursor: item.product ? 'pointer' : 'default' }}
              onClick={goToProductPage}
            >
              {productData?.image ? (
                <Image
                  src={`${API_URL}/${(productData?.image || '').replace(/^(\/|image\/)+/, '')}`}
                  alt={productData?.productModel || 'Product image'}
                  width={180}
                  height={150}
                  style={{ objectFit: 'contain', borderRadius: '8px' }}
                />
              ) : (
                <Box
                  width={150}
                  height={150}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bgcolor="#f0f0f0"
                  borderRadius="8px"
                >
                  <Typography variant="caption" color="textSecondary">
                    No image
                  </Typography>
                </Box>
              )}
            </Box>
          </TableCell>

          <TableCell sx={{ verticalAlign: 'top', padding: '16px' }}>
            <Typography
              variant="body1"
              fontWeight="bold"
              color="secondary"
              sx={{ cursor: item.product ? 'pointer' : 'default' }}
              onClick={goToProductPage}
            >
              {item.product?.productModel || 'Unknown Product'}
            </Typography>

            {Array.isArray(item.options) && item.options.length > 0 && (
              <Box mt={1}>
                {item.options.map((opt, index) => (
                  <Typography key={opt.option?._id || index} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{opt.option?.name || 'Option'} - </span>
                    {opt.salePrice !== undefined && opt.salePrice < opt.price ? (
                      <>
                        <span style={{ textDecoration: 'line-through !important', color: 'gray', fontSize: '0.8rem' }}>₹{opt.price}</span>
                        <span style={{ fontWeight: 'bold', color: '#99aa55' }}>₹{opt.salePrice}</span>
                      </>
                    ) : (
                      <span>₹{opt.price || 0}</span>
                    )}
                  </Typography>
                ))}
              </Box>
            )}

            {!checkout && (
              <Button
                onClick={() => setOpenModal(true)}
                variant="outlined"
                size="small"
                sx={{
                  mt: 1,
                  px: 2,
                  py: 0.5,
                  borderColor: 'var(--primary)',
                  color: '#311807',
                  fontWeight: 600,
                  width: '50%',
                  fontSize: 14,
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'var(--primary)', color: '#fff' },
                }}
              >
                Remove
              </Button>
            )}
          </TableCell>

          <TableCell sx={{ verticalAlign: 'top', fontWeight: 600 }}>
            ₹{itemPrice.toFixed(2)}
          </TableCell>
        </TableRow>
      )}

      {/* ------------------------
          Shared Confirmation Modal
        ------------------------ */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Remove Item?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Do you want to remove{' '}
            <strong>{item.product?.productModel}</strong>{' '}
            from the cart?
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ flexDirection: 'row', gap: 1, px: 2, pb: 2 }}
        >
          <Button
            variant="outlined"
            onClick={handleAddToWishlist}
            fullWidth
            sx={{
              color: '#ccd88f',
              fontWeight: 600,
              border: '2px solid var(--primary)',
              fontSize: 12,
              '&:hover': { backgroundColor: '#ccd88f', color: 'white' },
            }}
          >
            Add to Wishlist
          </Button>
          <Box display="flex" gap={1} flexDirection="row" width="100%">
            <Button
              fullWidth
              onClick={() => setOpenModal(false)}
              sx={{ fontSize: 12 }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="error"
              onClick={handleRemove}
              sx={{ fontSize: 12 }}
            >
              Remove
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

 CartItemRow.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    productModel: PropTypes.string,
    sku: PropTypes.string,
    price: PropTypes.number,
    subtotal: PropTypes.number,
    product: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      image: PropTypes.string,
      description: PropTypes.string,
      productModel: PropTypes.string,
    }),
    options: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        option: PropTypes.shape({
          _id: PropTypes.string,
          name: PropTypes.string,
        }),
        price: PropTypes.number,
      })
    ),
  }).isRequired,
  checkout: PropTypes.bool,
};

export default CartItemRow;

