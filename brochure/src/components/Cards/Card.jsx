'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FullImageViewer from '@/components/ProductCard/FullImageView';

const ArrivalCard = ({ item }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const [viewerOpen, setViewerOpen] = useState(false);

  // Ensure image path is correctly absolute
  const imageSrc = item.image 
    ? (item.image.startsWith('http') ? item.image : `${API_URL}/${item.image}`)
    : null;

  return (
    <>
      <div
        className="group relative flex flex-col bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border border-gray-100 cursor-pointer"
        onClick={() => imageSrc && setViewerOpen(true)}
      >
        {/* Product Image Area */}
        <div className="relative aspect-square w-full bg-[#fdfaf5] flex items-center justify-center">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={item.productModel || 'Embroidery Design'}
              className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <span className="text-sm font-bold opacity-50">DESIGN IMAGE</span>
              <span className="text-[10px] uppercase tracking-widest mt-1">N/A</span>
            </div>
          )}

          {/* Floating Model Badge in corner */}
          <div className="absolute top-2 right-2 bg-[var(--brand-accent)] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
             {item.productModel}
          </div>

          {/* Zoom hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">
              🔍 Click to view
            </span>
          </div>
        </div>

        {/* Product Footer */}
        <div className="p-3 bg-white border-t border-gray-50">
          <h3 className="text-[11px] font-black uppercase text-[#311807] tracking-tight truncate">
             ID: {item.productModel}
          </h3>
          <p className="text-[10px] font-extrabold text-[#8B4513] opacity-80 mt-1 uppercase tracking-tighter">
             Premium Embroidery
          </p>
        </div>

        {/* Subtle Overlay on hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Full Image Viewer */}
      {imageSrc && (
        <FullImageViewer
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          src={imageSrc}
          alt={item.productModel || 'Embroidery Design'}
        />
      )}
    </>
  );
};

ArrivalCard.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    productModel: PropTypes.string,
    image: PropTypes.string,
  }).isRequired,
};

export default ArrivalCard;
