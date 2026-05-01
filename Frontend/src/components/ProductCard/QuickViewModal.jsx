'use client';

import React, { useState, useMemo } from 'react';
import { Modal, Box, IconButton, Typography, Button, Divider } from '@mui/material';
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
        width: { xs: '95%', md: 800 },
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
                    sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500', zIndex: 10 }}
                >
                    <MdClose size={24} />
                </IconButton>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Image Section */}
                    <div className="w-full md:w-1/2">
                        <div className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden">
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
                                        className={`relative h-16 w-16 shrink-0 cursor-pointer rounded-md border-2 ${currentImage === img.image ? 'border-[#8B4513]' : 'border-transparent'
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
                            <Typography variant="h5" fontWeight="bold" sx={{ color: '#311807' }}>
                                {item.productModel}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                SKU: {item.sku}
                            </Typography>
                        </div>

                        {/* Price Block */}
                        <div className="flex items-center gap-3">
                             {(() => {
                                 const primaryOpt = item.options?.[0];
                                 if (!primaryOpt) return null;
                                 const hasSale = primaryOpt.salePrice !== undefined && primaryOpt.salePrice < primaryOpt.price;
                                 return (
                                     <>
                                         {hasSale && (
                                             <Typography sx={{ color: 'gray', textDecoration: 'line-through', fontSize: '1rem' }}>
                                                 ₹{primaryOpt.price}
                                             </Typography>
                                         )}
                                         <Typography variant="h5" sx={{ color: '#311807', fontWeight: 'bold' }}>
                                             ₹{hasSale ? primaryOpt.salePrice : primaryOpt.price}
                                         </Typography>
                                     </>
                                 );
                             })()}
                        </div>

                        {/* Options Selection Box (FIXED VISIBILITY) */}
                        <div className="border border-gray-300 rounded-lg p-2 bg-white shadow-inner max-h-48 overflow-y-auto">
                            {item.options?.length > 0 ? (
                                <div className="space-y-1">
                                    {item.options.map((opt) => {
                                        const isSelected = store.selectedAddons.includes(opt._id);
                                        return (
                                            <div 
                                                key={opt._id}
                                                onClick={() => !opt.purchased && store.handleAddonChange(opt._id, !isSelected)}
                                                className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer border transition-all ${
                                                    isSelected ? 'bg-[#8B4513] border-[#8B4513] text-white' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                                                } ${opt.purchased ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            >
                                                <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: isSelected ? '700' : 'normal' }}>
                                                    {opt.option?.name || 'Standard'} {opt.purchased ? '(Purchased)' : ''}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                    ₹{opt.salePrice || opt.price}
                                                </Typography>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Typography variant="caption" sx={{ p: 2, display: 'block', color: 'gray', textAlign: 'center' }}>No formats available</Typography>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 mt-auto">
                            <Button
                                variant="contained"
                                fullWidth
                                disabled={store.selectedAddons.length === 0}
                                startIcon={<MdOutlineShoppingCart />}
                                onClick={() => {
                                    store.addItemToCart();
                                    onClose();
                                }}
                                sx={{
                                    bgcolor: '#8B4513 !important',
                                    color: 'white !important',
                                    fontWeight: '800 !important',
                                    fontSize: '0.9rem',
                                    '&:hover': { bgcolor: '#5D2E0C !important' },
                                    '&.Mui-disabled': { 
                                        bgcolor: '#E2E8F0 !important', 
                                        color: '#94A3B8 !important',
                                        opacity: 0.8
                                    },
                                    py: 1.5,
                                    borderRadius: 2,
                                    textTransform: 'none'
                                }}
                            >
                                {store.selectedAddons.length > 0 ? 'Add to Cart' : 'Select a Format'}
                            </Button>
                            <Button
                                variant="outlined"
                                fullWidth
                                startIcon={<FaRegHeart />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    store.addItemToWishlist();
                                }}
                                sx={{
                                    color: '#8B4513',
                                    borderColor: '#E2E8F0',
                                    borderWidth: '2px',
                                    fontWeight: '700',
                                    '&:hover': { borderColor: '#8B4513', bgcolor: '#f9fafb' },
                                    py: 1.2,
                                    borderRadius: 2,
                                    textTransform: 'none'
                                }}
                            >
                                {store.alreadyInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stitches Area */}
                <Box sx={{ mt: 5, pt: 3, borderTop: '1px dotted #e0e0e0' }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#311807' }}>
                        <span>🔢</span> Production Calculator
                    </Typography>
                    <StitchDetails
                        backStitches={item.backStitches}
                        handStitches={item.handStitches}
                        stitches={item.totalStitchesVal || item.stitches}
                    />
                </Box>
            </Box>
        </Modal>
    );
};

export default QuickViewModal;

