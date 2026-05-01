'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/Store/authStore';

const CategoryCard = ({ item, shape = 'square' }) => {
  const router = useRouter();
  const isCircle = shape === 'circle';

  // Sizing scale
  const imageSize = isCircle ? 80 : 164;

  const handleClick = () => {
    // Navigate to the absolute category details page to fulfill the multi-page brochure requirement
    router.push(`/category/${item._id}?name=${encodeURIComponent(item.name)}`);
  };

  const imageSrc = item?.image ? (item.image.startsWith('http') ? item.image : `${API_URL}/${item.image}`) : '/assets/butterflyimg.png';

  return (
    <div
      className={`flex flex-col items-center text-center cursor-pointer mx-auto transition-all duration-500 hover:-translate-y-3 hover:scale-105
        ${!isCircle ? 'w-full max-w-[220px] sm:max-w-[200px] md:max-w-[220px]' : ''}`}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div
        className={`flex justify-center bg-[#fdfaf5] border border-[#8B45131A]
          ${isCircle ? 'rounded-2xl border-2 border-[var(--primary)]' : 'rounded-md shadow-md'}`}
        style={{
          width: imageSize,
          height: imageSize,
          overflow: 'hidden'
        }}
      >
        <Image
          src={imageSrc}
          alt={item?.description || item?.name || 'Category'}
          width={imageSize}
          height={imageSize}
          className="px-2 object-contain"
          unoptimized
        />
      </div>

      {/* Category Name - Bold & Minimal */}
      <p className="mt-4 font-black text-sm text-[#311807] uppercase tracking-tighter">
        {item?.name}
      </p>
    </div>
  );
};

export default CategoryCard;
