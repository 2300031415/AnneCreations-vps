'use client';

import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Button,
    List,
    ListItem,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Divider,
} from '@mui/material';
import { IoClose } from 'react-icons/io5';
import { FaTrashAlt } from 'react-icons/fa';
import { BsCart3 } from 'react-icons/bs';
import Image from 'next/image';
import useCartStore from '@/Store/cartStore';
import { useProductStore } from '@/Store/productStore';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '@/Store/authStore';
import useActiveCoupon from '@/hook/useActiveCoupon';

export default function CartDrawer() {
    const {
        cart,
        isCartOpen,
        setCartOpen,
        removeFromCart,
        subtotal,
        cartCount,
        pendingQuickAdd,
        setPendingQuickAdd,
        addToCart,
        updateCartItem
    } = useCartStore();

    const { products } = useProductStore();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();

    const { user, accessToken, setLoginPopupOpen } = useAuthStore();
    const isAuthenticated = !!accessToken;

    const handleClose = () => {
        setCartOpen(false);
        setPendingQuickAdd(null);
    };

    // Add the product to cart immediately when a checkbox is clicked in the configuration section
    const handleQuickAddOption = async (product, option) => {
        if (!isAuthenticated) {
            setLoginPopupOpen(true);
            return;
        }
        try {
            await addToCart({ productId: product._id, options: [option] });
            setPendingQuickAdd(null); // Move item to the main list
            enqueueSnackbar('Item added to cart!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to add item', { variant: 'error' });
        }
    };

    const handleUpdateItemOptions = async (productId, currentOptions, optionToToggle) => {
        if (!isAuthenticated) return;
        let newOptions;
        const isAlreadySelected = currentOptions.some(opt => (opt.option?._id || opt._id) === (optionToToggle.option?._id || optionToToggle._id));

        if (isAlreadySelected) {
            newOptions = currentOptions.filter(opt => (opt.option?._id || opt._id) !== (optionToToggle.option?._id || optionToToggle._id));
        } else {
            newOptions = [...currentOptions, optionToToggle];
        }

        if (newOptions.length === 0) {
            await removeFromCart(productId);
        } else {
            await updateCartItem(productId, newOptions);
        }
    };

    const { coupon: activeCoupon } = useActiveCoupon();

    let discount = 0;
    if (activeCoupon && subtotal >= activeCoupon.minAmount) {
        discount = activeCoupon.type === 'P'
            ? (subtotal * activeCoupon.discount) / 100
            : activeCoupon.discount;
    }
    const finalTotal = subtotal - discount;

    // Checkout is only allowed if there are items in the cart
    const isCheckoutDisabled = cart.length === 0;

    return (
        <Drawer
            anchor="right"
            open={isCartOpen}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 420 },
                    bgcolor: 'var(--background)',
                    boxShadow: '-4px 0 20px rgba(0,0,0,0.1)'
                },
            }}
        >
            {/* Header */}
            <Box sx={{
                bgcolor: 'var(--secondary)',
                color: 'white',
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <BsCart3 size={24} />
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem', fontFamily: 'Poppins !important' }}>
                        MY CART
                    </Typography>
                    <Box sx={{
                        bgcolor: 'var(--primary)',
                        color: 'var(--secondary)',
                        px: 1,
                        borderRadius: '50%',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        minWidth: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {cartCount}
                    </Box>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    <IoClose size={28} />
                </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2.5, py: 1 }}>
                {/* Configuration Section (For product just clicked but not yet in cart) */}
                {pendingQuickAdd && (
                    <Box sx={{
                        mb: 4,
                        border: '2px dashed var(--brand-accent)',
                        borderRadius: 3,
                        p: 2.5,
                        bgcolor: 'rgba(153, 110, 25, 0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'var(--secondary)', fontSize: '1rem' }}>
                            CONFIGURE DESIGN: {pendingQuickAdd.productModel}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2.5 }}>
                            <Box sx={{ width: 80, height: 80, position: 'relative', borderRadius: 2, overflow: 'hidden', flexShrink: 0, boxShadow: 2 }}>
                                <Image
                                    src={pendingQuickAdd.image ? `${process.env.NEXT_PUBLIC_API_URL}/${pendingQuickAdd.image.startsWith('image/') ? pendingQuickAdd.image : 'image/' + pendingQuickAdd.image}` : '/no-image.png'}
                                    alt={pendingQuickAdd.productModel}
                                    fill
                                    className="object-cover"
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" sx={{ color: 'var(--muted-text)', fontWeight: 600, mb: 1.5, display: 'block' }}>
                                    SELECT YOUR FORMAT:
                                </Typography>
                                <FormGroup>
                                    {pendingQuickAdd.options?.map((opt) => (
                                        <FormControlLabel
                                            key={opt._id}
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    onChange={() => handleQuickAddOption(pendingQuickAdd, opt)}
                                                    sx={{
                                                        color: 'var(--brand-accent)',
                                                        '&.Mui-checked': { color: 'var(--brand-accent)' },
                                                        p: 1
                                                    }}
                                                />
                                            }
                                            label={
                                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>
                                                    {opt.option?.name} <span style={{ color: 'var(--brand-accent)', marginLeft: '4px' }}>₹{opt.price}</span>
                                                </Typography>
                                            }
                                        />
                                    ))}
                                </FormGroup>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* Cart List */}
                {cart.length === 0 && !pendingQuickAdd ? (
                    <Box sx={{ textAlign: 'center', py: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <BsCart3 size={60} color="#ddd" />
                        <Typography sx={{ color: 'var(--muted-text)', fontWeight: 500 }}>Your cart is empty.</Typography>
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                            sx={{ color: 'var(--secondary)', borderColor: 'var(--secondary)', borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}
                        >
                            Return to Shop
                        </Button>
                    </Box>
                ) : (
                    <List disablePadding>
                        {cart.map((item) => {
                            const productData = item.product;
                            const fullProduct = products.find(p => p._id === item.product?._id);
                            const availableOptions = fullProduct?.options || item.product?.options || [];

                            return (
                                <ListItem key={item._id} disablePadding sx={{
                                    mb: 2.5,
                                    bgcolor: 'white',
                                    border: '1px solid #f0f0f0',
                                    borderRadius: 3,
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'scale(1.01)' }
                                }}>
                                    <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                                        <Box sx={{ width: 70, height: 70, position: 'relative', borderRadius: 2, overflow: 'hidden', flexShrink: 0, border: '1px solid #eee' }}>
                                            <Image
                                                src={productData?.image
                                                    ? `${process.env.NEXT_PUBLIC_API_URL}/${productData.image.startsWith('image/') ? productData.image : 'image/' + productData.image}`
                                                    : '/no-image.png'}
                                                alt={productData?.productModel || 'Product'}
                                                fill
                                                className="object-cover"
                                            />
                                        </Box>

                                        <Box sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Typography variant="body1" sx={{ fontWeight: 700, color: 'var(--secondary)', fontSize: '0.95rem' }}>
                                                    {item.product?.productModel}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => removeFromCart(item.product?._id)}
                                                    sx={{ color: '#ff4d4d', p: 0.5, '&:hover': { bgcolor: '#fff5f5' } }}
                                                >
                                                    <FaTrashAlt size={14} />
                                                </IconButton>
                                            </Box>

                                            <Box sx={{ mt: 1.5 }}>
                                                <Typography variant="caption" sx={{ color: 'var(--muted-text)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.7rem' }}>SELECTED FORMATS:</Typography>
                                                <FormGroup sx={{ ml: -0.5, mt: 0.5 }}>
                                                    {availableOptions.map((opt) => {
                                                        const isSelected = item.options?.some(o => (o.option?._id || o._id) === (opt.option?._id || opt._id));
                                                        return (
                                                            <FormControlLabel
                                                                key={opt._id}
                                                                control={
                                                                    <Checkbox
                                                                        size="small"
                                                                        checked={isSelected}
                                                                        onChange={() => handleUpdateItemOptions(item.product._id, item.options, opt)}
                                                                        sx={{
                                                                            p: 0.8,
                                                                            color: 'var(--brand-accent)',
                                                                            '&.Mui-checked': { color: 'var(--brand-accent)' }
                                                                        }}
                                                                    />
                                                                }
                                                                label={<Typography variant="caption" sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)' }}>{opt.option?.name} (₹{opt.price})</Typography>}
                                                                sx={{ mb: -1 }}
                                                            />
                                                        );
                                                    })}
                                                </FormGroup>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Divider sx={{ width: '100%', borderStyle: 'dashed' }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-text)' }}>SUBTOTAL</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 800, color: 'var(--brand-accent)' }}>
                                            ₹{item.subtotal}
                                        </Typography>
                                    </Box>
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </Box>

            {/* Footer */}
            <Box sx={{
                bgcolor: 'white',
                p: 3,
                borderTop: '1px solid #eee',
                boxShadow: '0 -4px 15px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: 'var(--muted-text)', fontWeight: 600 }}>BAG TOTAL</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--secondary)', fontWeight: 700 }}>₹{subtotal.toFixed(2)}</Typography>
                </Box>

                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '1.2rem' }}>TO PAY</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '1.2rem' }}>₹{finalTotal.toFixed(2)}</Typography>
                </Box>

                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isCheckoutDisabled}
                    onClick={() => {
                        handleClose();
                        router.push('/Cart');
                    }}
                    sx={{
                        bgcolor: 'var(--secondary)',
                        '&:hover': { bgcolor: '#45210a' },
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        letterSpacing: '1px',
                        py: 1.8,
                        mt: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        px: 3,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(49, 24, 7, 0.2)',
                        '&.Mui-disabled': {
                            bgcolor: '#f0f0f0',
                            color: '#ccc'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontWeight: 800 }}>{isCheckoutDisabled ? 'SELECT A FORMAT' : 'PROCEED TO CHECKOUT'}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 800 }}>₹{finalTotal.toFixed(2)} ›</Typography>
                </Button>
            </Box>
        </Drawer>
    );
}
