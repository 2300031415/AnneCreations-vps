'use client'
import React, { Suspense } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import BreadCrum from '@/components/BreadCrum/BreadCrum';
import englsh_icon from '../../../public/assets/helppage_images/english.png';
import Telugu_icon from '../../../public/assets/helppage_images/telugu.png';
import Hindi_icon from '../../../public/assets/helppage_images/hindi.png';
import Tamil_icon from '../../../public/assets/helppage_images/tamil.png';
import Kannada_icon from '../../../public/assets/helppage_images/kannda.png';
import youtube_img from '../../../public/assets/helppage_images/youtubeimage.png';
import Image from 'next/image';
import { Container, Box, CircularProgress } from '@mui/material';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useTranslation } from 'react-i18next';

const HelpContent = () => {
  const { t } = useTranslation();
  const langagebtn = [
    { id: 1, name: 'English', image: englsh_icon, bgcolor: '#008209' },
    { id: 2, name: 'Telugu', image: Telugu_icon, bgcolor: '#C35B00' },
    { id: 3, name: 'Hindi', image: Hindi_icon, bgcolor: '#6A0084' },
    { id: 4, name: 'Tamil', image: Tamil_icon, bgcolor: '#9D0003' },
    { id: 5, name: 'Kannada', image: Kannada_icon, bgcolor: '#F8A900' },
  ];

  const youtubeImages = Array(10).fill(youtube_img);

  return (
    <>
      <BreadCrum
        crumbs={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.help'), href: '/Help' },
        ]}
      />

      <AnimatedBackground>
        <Container className='my-20' sx={{ position: 'relative', zIndex: 1, py: 5 }}>

          <h1 className="text-3xl   my-10 text-center font-bold px-4">
            {t('help.title')}
          </h1>

          {/* ... existing commented tabs ... */}
          <h2 className='text-center text-3xl'>{t('help.coming_soon')}</h2>
        </Container>
      </AnimatedBackground>
    </>
  );
};

const HelpPage = () => {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <HelpContent />
    </Suspense>
  );
}

export default HelpPage;

