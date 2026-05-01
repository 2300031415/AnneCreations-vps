'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Box, IconButton, Typography, Button, Rating, Divider } from '@mui/material';
import { MdClose, MdOutlineShoppingCart } from 'react-icons/md';
import { FaRegHeart } from 'react-icons/fa';
import Image from 'next/image';
import { useProductCardStore } from './ProductCardStore';
import { useTranslation } from 'react-i18next';

import StitchDetails from '@/components/Cards/StitchDetails';
import ImageMagnifier from '../ImageZoom/ImageMagnifier';

const QuickViewModal = ({ open, onClose, item }) => {
    const { t } = useTranslation();
    const store = useProductCardStore(item);
    const fallbackImage = '/no-image.png';

    const allImages = useMemo(() => {
        const mainImg = { _id: 'main', image: item.image || fallbackImage };
        const extras = item.additionalImages || [];
        return [mainImg, ...extras];
    }, [item, fallbackImage]);

    const [currentImage, setCurrentImage] = useState(allImages[0].image);

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', md: 800 },
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: { xs: 2, md: 4 },
        borderRadius: 2,
        overflowY: 'auto',
    };

    return (
        <Modal open={open} onClose={onClose} aria-labelledby="quick-view-title">
            <Box sx={style}>
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
                >
                    <MdClose size={24} />
                </IconButton>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Image Section */}
                    <div className="w-full md:w-1/2">
                        <div className="relative aspect-square rounded-lg border border-gray-200 cursor-zoom-in">
                            <ImageMagnifier
                                src={
                                    (currentImage || fallbackImage).startsWith('http')
                                        ? (currentImage || fallbackImage)
                                        : `${store.API_URL}/${currentImage || fallbackImage}`
                                }
                                alt={item.productModel}
                            />
                        </div>
                        {allImages.length > 1 && (
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                {allImages.map((img, idx) => (
                                    <div
                                        key={img._id || idx}
                                        className={`relative h-16 w-16 flex-shrink-0 cursor-pointer rounded-md border-2 ${currentImage === img.image ? 'border-[var(--primary)]' : 'border-transparent'
                                            }`}
                                        onClick={() => setCurrentImage(img.image)}
                                    >
                                        <Image
                                            src={`${store.API_URL}/${img.image || fallbackImage}`}
                                            alt={`${item.productModel} ${idx}`}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="w-full md:w-1/2 flex flex-col gap-4">
                        <div>
                            <Typography variant="h5" component="h2" id="quick-view-title" fontWeight="bold">
                                {item.productModel}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                SKU: {item.sku}
                            </Typography>
                        </div>

                        {/* Rating block removed as per user request */}

                        <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
                            {item.options?.length > 0 && item.options[0].salePrice !== undefined && item.options[0].salePrice < item.options[0].price ? (
                                <>
                                    <Typography
                                        variant="h6"
                                        sx={{ color: 'text.secondary', textDecoration: 'line-through !important', fontSize: '1rem' }}
                                    >
                                        ₹{item.options[0].price}
                                    </Typography>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        ₹{item.options[0].salePrice}
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                    ₹{item.options?.[0]?.price || '0'}
                                </Typography>
                            )}
                        </Box>

                        <Typography variant="body2" color="text.secondary" className="line-clamp-4">
                            {item.description || 'No description available.'}
                        </Typography>

                        <div className="flex flex-col gap-3 mt-auto">
                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<MdOutlineShoppingCart />}
                                onClick={() => {
                                    store.addItemToCart();
                                    onClose();
                                }}
                                sx={{
                                    bgcolor: 'var(--primary)',
                                    '&:hover': { bgcolor: 'var(--primary-dark)' },
                                    py: 1.5,
                                }}
                            >
                                {t('buttons.add_to_cart')}
                            </Button>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<FaRegHeart />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    store.addItemToWishlist();
                                    // Optional: Keep modal open or close based on UX. User said "change it correctly"
                                    // Most apps close on "Add to Cart" but keep open for "Wishlist" or show a toast.
                                    // I'll keep it open for wishlist so they can continue viewing.
                                }}
                                sx={{
                                    mt: 1,
                                    color: 'var(--secondary)',
                                    borderColor: 'var(--primary)',
                                    borderWidth: '2px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        borderColor: 'var(--secondary)',
                                        bgcolor: 'var(--primary)',
                                        color: 'var(--secondary)'
                                    },
                                    py: 1.5,
                                    textTransform: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {t('buttons.add_to_wishlist')}
                            </Button>
                        </div>
                    </div>
                </div>

                <Box sx={{ mt: 6 }}>
                    <Divider sx={{ mb: 4, borderColor: 'rgba(0,0,0,0.1)' }} />
                    <StitchDetails
                        backStitches={item.backStitches}
                        handStitches={item.handStitches}
                        stitches={item.stitches || item.totalStitchesVal}
                    />
                </Box>
            </Box>
        </Modal>
    );
};

export default QuickViewModal;
