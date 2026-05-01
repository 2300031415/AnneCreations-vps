'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import Banner_img from '../../../public/assets/Banner_images/anne-creations-banner.jpeg';
import axiosClient from "@/lib/axiosClient"

const Carousel = dynamic(
  () => import('react-responsive-carousel').then((mod) => mod.Carousel),
  { ssr: false }
);
import { useTranslation } from 'react-i18next';

const Banner = () => {
  const { t } = useTranslation();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        const res = await axiosClient.get(`/api/banners`);
        if (isMounted) {
          // The backend sendResponse helper returns { data: { data: [...], count: ... } }
          // So res.data is the body, res.data.data is the object with the list
          const responseData = res.data?.data;
          const bannerList = responseData?.data || [];

          let extractedImages = [];
          if (Array.isArray(bannerList)) {
            bannerList.forEach(banner => {
              if (banner.status !== false && banner.images && Array.isArray(banner.images)) {
                banner.images.forEach((imgUrl, idx) => {
                  extractedImages.push({
                    id: `${banner._id}-${idx}`,
                    image: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${imgUrl}`,
                    alt: banner.title || 'Banner'
                  });
                });
              }
            });
          }

          console.log('Extracted Banners:', extractedImages);

          if (extractedImages.length > 0) {
            setBanners(extractedImages);
          } else {
            setBanners([]);
          }
        }
      } catch (err) {
        console.error('❌ Error fetching banners:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBanners();

    const handleFocus = () => {
      fetchBanners();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false; // cleanup function
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // ✅ fallback banner if API empty or failed
  const list =
    banners.length > 0
      ? banners
      : [{ id: 1, image: Banner_img, alt: 'Welcome to Anne Creations' }];

  // ✅ Optional: show loader while fetching
  /* eslint-disable react/prop-types */
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center h-[600px] bg-[var(--card-bg)]">
        <p className="text-[var(--muted-text)] text-lg">{t('common.loading_banners', 'Loading banners...')}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Carousel
        showThumbs={false}
        showStatus={false}
        infiniteLoop
        autoPlay
        interval={3000}
        transitionTime={800}
        swipeable
        emulateTouch
        stopOnHover
        showIndicators={list.length > 1}
      >
        {list.map((item) => (
          <div key={item.id} className="relative w-full">
            <Image
              src={item.image?.url || item.image}
              alt={item.alt || 'Banner'}
              width={1920}
              height={600}
              className="object-cover w-full h-auto"
              priority
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Banner;
