'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import FullImageViewer from '@/components/ProductCard/FullImageView';

import { MdShare, MdPictureAsPdf } from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import jsPDF from 'jspdf';

const ArrivalCard = ({ item, categoryName = 'Premium Embroidery' }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Ensure image path is correctly absolute
  const imageSrc = item.image 
    ? (item.image.startsWith('http') ? item.image : `${API_URL}/${item.image}`)
    : null;

  const handleShare = (e) => {
    e.stopPropagation();
    const text = `Check out this beautiful design!\n\nProduct ID: ${item.productModel}\nCategory: ${categoryName}\n\nView it here: ${window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!imageSrc) return;
    
    setIsDownloading(true);
    try {
      // Create PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Fetch and process image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageSrc;
      });

      // PDF Layout constants
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      // Header branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(49, 24, 7); // #311807
      doc.text("ANNE CREATIONS", margin, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(139, 69, 19); // #8B4513
      doc.text("PREMIUM EMBROIDERY ARCHIVE", margin, 26);
      
      doc.setDrawColor(224, 224, 224);
      doc.line(margin, 30, pageWidth - margin, 30);

      // Image sizing to fit A4
      const imgRatio = img.height / img.width;
      const displayWidth = contentWidth;
      const displayHeight = displayWidth * imgRatio;
      
      // Center image
      doc.addImage(img, 'JPEG', margin, 40, displayWidth, displayHeight);

      // Footer info box
      const footerY = 40 + displayHeight + 15;
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, footerY, contentWidth, 30, 'F');
      
      doc.setFontSize(14);
      doc.setTextColor(49, 24, 7);
      doc.text(`PRODUCT ID: ${item.productModel}`, margin + 5, footerY + 12);
      
      doc.setFontSize(11);
      doc.setTextColor(139, 69, 19);
      doc.text(`CATEGORY: ${categoryName}`, margin + 5, footerY + 22);

      // Footer disclaimer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("* This is a digital catalogue preview from Anne Creations.", margin, 285);

      doc.save(`${item.productModel}_Brochure.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback: direct image download if PDF fails
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = `${item.productModel}.jpg`;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

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

          {/* Action Buttons Overlay */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between gap-2 translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
            <button 
              onClick={handleShare}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg flex items-center justify-center gap-1 shadow-md"
            >
              <FaWhatsapp size={16} />
              <span className="text-[10px] font-bold">SHARE</span>
            </button>
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg flex items-center justify-center gap-1 shadow-md disabled:opacity-50"
            >
              <MdPictureAsPdf size={16} />
              <span className="text-[10px] font-bold">{isDownloading ? '...' : 'PDF'}</span>
            </button>
          </div>

          {/* Zoom hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center pointer-events-none">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold bg-black/50 px-3 py-1 rounded-full">
               View Details
            </span>
          </div>
        </div>

        {/* Product Footer */}
        <div className="p-3 bg-white border-t border-gray-50">
          <h3 className="text-[11px] font-black uppercase text-[#311807] tracking-tight truncate">
             ID: {item.productModel}
          </h3>
          <p className="text-[10px] font-extrabold text-[#8B4513] opacity-80 mt-1 uppercase tracking-tighter">
             {categoryName}
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
  categoryName: PropTypes.string,
};

export default ArrivalCard;
