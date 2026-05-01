'use client';
import { MdClose } from 'react-icons/md';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import PropTypes from 'prop-types';
import { FaRegHeart, FaShareAlt } from 'react-icons/fa';
import { MdOutlineShoppingCart } from 'react-icons/md';
import FullImageView from './FullImageView';
import { useProductCardStore } from './ProductCardStore';
import { IconButton } from '@mui/material';
import ImageMagnifier from '../ImageZoom/ImageMagnifier';

// ✅ MUI imports
import { Modal, Box, Typography } from '@mui/material';

const ProductCard = ({ item }) => {
  const store = useProductCardStore(item);
  const fallbackImage = '/no-image.png';

  const allImages = useMemo(() => {
    const mainImg = { _id: 'main', image: item.image || fallbackImage };
    const extras = item.additionalImages || [];
    return [mainImg, ...extras];
  }, [item, fallbackImage]);

  const [currentImage, setCurrentImage] = useState(allImages[0].image);

  return (
    <>
      <div className="bg-[var(--card-bg)] rounded-lg py-2 md:py-6 px-4 shadow-[0_0_10px_rgba(0,0,0,0.3)]">
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
                    className={`flex-shrink-0 cursor-pointer border-2 rounded-md ${currentImage === img.image ? 'border-[var(--primary)]' : 'border-transparent'
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
                    className="text-[var(--primary)] cursor-pointer hover:text-[#99aa55] transition"
                    title="Share"
                  >
                    <FaShareAlt />
                  </button>
                </p>
                <ul className="space-y-2 text-sm md:text-md text-[var(--secondary)]">
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

              {/* Addons View Mode (Simplified for brochure) */}
              <div className="flex-1 min-w-0">
                {item.options?.length > 0 ? (
                  <ul className="space-y-2">
                    {item.options.map((option) => {
                      return (
                        <li key={option._id} className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2 flex-wrap text-[var(--secondary)]">
                            <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                            <span className="flex-1 min-w-0">{option.option?.name || 'Standard'}</span>
                            <span className="text-nowrap ml-2 flex items-center gap-2 font-bold">
                              {option.salePrice !== undefined && option.salePrice < option.price ? (
                                <>
                                  <span className="line-through text-gray-400 text-xs">₹{option.price}</span>
                                  <span className="text-[#99aa55]">₹{option.salePrice}</span>
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
                  <p className="text-sm text-[var(--muted-text)] italic">No specific details available</p>
                )}
              </div>
            </div>

            {/* Simple View Area */}
            <div className="mt-4 p-4 border-t border-dashed border-[var(--primary)] text-center">
              <Typography variant="caption" sx={{ color: 'var(--brand-accent)', fontWeight: 800, letterSpacing: '2px' }}>
                 PREMIUM EMBROIDERY DESIGN
              </Typography>
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
    </>
  );
};

ProductCard.propTypes = {
  item: PropTypes.object.isRequired,
};

export default ProductCard;
