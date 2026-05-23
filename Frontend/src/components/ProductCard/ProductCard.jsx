'use client';
import { MdClose } from 'react-icons/md';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';
import { FaEye, FaRegHeart, FaShareAlt } from 'react-icons/fa';
import { MdOutlineShoppingCart } from 'react-icons/md';
import FullImageView from './FullImageView';
import { useProductCardStore } from './ProductCardStore';
import { IconButton } from '@mui/material';
import ImageMagnifier from '../ImageZoom/ImageMagnifier';
import LoginForm from '@/app/Auth/Login/LoginForm';
import PreviewDesignModal from './PreviewDesignModal';
import { loadAndParseZip } from '../../lib/zipLoader';

// ✅ MUI imports
import { Modal, Box, Typography, Rating } from '@mui/material';

const ProductCard = ({ item }) => {
  const store = useProductCardStore(item);
  const fallbackImage = '/no-image.png';

  const allImages = useMemo(() => {
    const mainImg = { _id: 'main', image: item.image || fallbackImage };
    const extras = item.additionalImages || [];
    return [mainImg, ...extras];
  }, [item, fallbackImage]);

  const [currentImage, setCurrentImage] = useState(allImages[0].image);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [previewVariantName, setPreviewVariantName] = useState('');

  const handleOpenPreview = async () => {
    const selectedOption = item.options?.find(opt => store.selectedAddons.includes(opt._id)) || item.options?.[0];
    if (!selectedOption) return;

    const zipUrl = `${store.API_URL}/${selectedOption.uploadedFilePath}`;
    setPreviewVariantName(selectedOption.option?.name || 'Standard Package');
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewFiles([]);

    try {
      const files = await loadAndParseZip(zipUrl);
      setPreviewFiles(files);
    } catch (err) {
      console.error("Failed to parse design preview zip:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg py-2 md:py-6 px-4 shadow-[0_0_10px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Image section */}
          <div className="w-full lg:w-1/3 flex flex-col justify-center rounded-md cursor-pointer">
            <div className="relative aspect-square rounded-md">
              <ImageMagnifier
                src={
                  (currentImage || fallbackImage).startsWith('http')
                    ? (currentImage || fallbackImage)
                    : `${store.API_URL}/${currentImage || fallbackImage}`
                }
                alt={item.design ?? 'Design Image'}
                onClick={() => store.setOpen(true)}
              />
            </div>

            {allImages.length > 1 && (
              <div className="mt-4 overflow-x-auto flex gap-3 pb-2">
                {allImages.map((img, index) => (
                  <div
                    key={img._id || index}
                    className={`flex-shrink-0 cursor-pointer border-2 rounded-md ${currentImage === img.image ? 'border-(--primary)' : 'border-transparent'
                      }`}
                    onClick={() => setCurrentImage(img.image || fallbackImage)}
                  >
                    <Image
                      src={`${store.API_URL}/${img.image || fallbackImage}`}
                      alt={`Image ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="w-full lg:w-2/3 flex flex-col gap-5">
            <div className="flex flex-col md:flex-row gap-2 md:gap-8">
              <div className="flex-1 min-w-0">
                <p className="text-lg mb-3 flex items-center gap-3 flex-wrap">
                  <span className="text-[#99aa55] font-bold">{item.sku ?? 'SKU N/A'}</span>
                  <button
                    onClick={() => store.handleShare(item?.sku ?? 'Design')}
                    className="text-(--secondary) cursor-pointer hover:text-[#99aa55] transition"
                    title="Share"
                  >
                    <FaShareAlt />
                  </button>
                </p>
                <ul className="space-y-2 text-sm md:text-md text-(--secondary)">
                  <li><strong>Design Code:</strong> {item.productModel}</li>
                  <li><strong>Stitches:</strong> {
                    item.backStitches || item.handStitches
                      ? `Back: ${(item.backStitches || 0).toLocaleString()}, Hand: ${(item.handStitches || 0).toLocaleString()}`
                      : (item.stitches || item.totalStitchesVal || 'N/A')
                  }</li>
                  <li><strong>Area / Width / Height:</strong> {item?.dimensions ?? 'N/A'}</li>
                  <li><strong>Color / Needles:</strong> {item.colourNeedles}</li>
                </ul>
              </div>

              {/* Addons */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                {item.options?.length > 0 ? (
                  <ul className="space-y-2">
                    {item.options.map((option) => {
                      const isChecked = store.selectedAddons.includes(option._id);
                      const isPurchased = option.purchased;

                      return (
                        <li key={option._id} className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="checkbox"
                              id={`addon-${option._id}`}
                              name="addons"
                              checked={isPurchased || isChecked}
                              className="cursor-pointer"
                              onChange={(e) => store.handleAddonChange(option._id, e.target.checked)}
                              disabled={isPurchased}
                            />
                            <label
                              htmlFor={`addon-${option._id}`}
                              className={`flex-1 min-w-0 ${isPurchased ? 'cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            >
                              {option.option?.name || 'Standard'}
                            </label>
                            <span className="text-nowrap ml-2 flex items-center gap-2">
                              {option.salePrice !== undefined && option.salePrice < option.price ? (
                                <>
                                  <span className="line-through text-gray-500 text-xs" style={{ textDecoration: 'line-through !important' }}>₹{option.price}</span>
                                  <span className="text-[#99aa55] font-bold">₹{option.salePrice}</span>
                                </>
                              ) : (
                                <span>{option.price ? `₹${option.price}` : 'Included'}</span>
                              )}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-(--secondary) italic">No add-ons available</p>
                )}

                {item.options?.length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenPreview}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '4px',
                      width: '100%',
                      padding: '8px 12px',
                      marginTop: '12px',
                      border: '1.2px dashed #ccd88f',
                      borderRadius: '8px',
                      background: '#fff',
                      color: '#311807',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    className="hover:bg-[#f0f4e8]"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaEye style={{ color: '#ccd88f', flexShrink: 0 }} size={14} />
                      <span>Preview Design Files</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#888' }}>⚡ Preview</span>
                  </button>
                )}
              </div>
            </div>

            {/* Wishlist & Cart buttons */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col-reverse mt-2 md:flex-row justify-around gap-1 md:gap-4">
                <div className="w-full md:w-1/2">
                  <button
                    onClick={() => store.addItemToWishlist()}
                    className="cursor-pointer font-semibold flex items-center justify-center gap-2 px-4 py-2 rounded-md transition border-2 border-(--primary) bg-(--primary) text-(--secondary) hover:bg-(--primary) hover:text-(--secondary) w-full"
                  >
                    <FaRegHeart />
                    {store.alreadyInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>

                <div className="w-full md:w-1/2">
                  <button
                    onClick={() => store.addItemToCart()}
                    className="cursor-pointer font-semibold flex items-center justify-center gap-2 px-4 py-2 rounded-md transition border-2 border-(--primary) bg-(--primary) text-(--secondary) hover:bg-(--primary) hover:text-(--secondary) w-full"
                  >
                    <MdOutlineShoppingCart />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full image modal */}
      {store.open && (
        <FullImageView
          open={store.open}
          onClose={() => store.setOpen(false)}
          src={`${store.API_URL}/${currentImage || fallbackImage}`}
          alt={item.design ?? 'Design Image'}
        />
      )}

      {/* ✅ MUI Login Modal */}
      <Modal
        open={store.modalOpen}
        onClose={() => store.setModalOpen(false)}
        aria-labelledby="login-modal-title"
        aria-describedby="login-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            position: 'relative',
          }}
        >
          {/* Close button */}
          <IconButton
            aria-label="close"
            onClick={() => store.setModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <MdClose size={24} />
          </IconButton>

          <Typography id="login-modal-title" variant="h6" component="h2" mb={2}>
            Login to continue
          </Typography>
          <LoginForm />
        </Box>
      </Modal>

      <PreviewDesignModal
        open={previewOpen}
        loading={previewLoading}
        productTitle={item.productModel}
        variantName={previewVariantName}
        files={previewFiles}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
};

ProductCard.propTypes = {
  item: PropTypes.object.isRequired,
};

export default ProductCard;
