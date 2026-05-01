// app/Register/page.tsx
import React, { Suspense } from 'react';
import { Container, Box, CircularProgress } from '@mui/material';
import BreadCrum from '@/components/BreadCrum/BreadCrum';
import RegisterForm from './RegisterForm';

// ✅ Add SEO Metadata
export const metadata = {
  title: 'Create Account | Anne Creations',
  description:
    'Register your Anne Creations account to access beautiful embroidery designs, manage your profile, and download creative patterns easily.',
  keywords: [
    'Anne Creations',
    'register',
    'sign up',
    'create account',
    'embroidery designs',
    'digital embroidery patterns',
  ],
  openGraph: {
    title: 'Create Account | Anne Creations',
    description:
      'Join Anne Creations to explore creative embroidery designs and start your digital design journey today.',
    url: 'https://www.annecreationshb.com/Register',
    siteName: 'Anne Creations',
    images: [
      {
        url: 'https://www.annecreationshb.com/images/logo.png',
        width: 800,
        height: 600,
        alt: 'Anne Creations Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Create Account | Anne Creations',
    description:
      'Sign up with Anne Creations to access and download unique embroidery designs.',
    images: ['https://www.annecreationshb.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://www.annecreationshb.com/Register',
  },
};

const RegisterPage = () => {
  return (
    <>
      <BreadCrum
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Register', href: '/Register' },
        ]}
      />
      <Container maxWidth="md" sx={{ my: 10 }}>
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress color="primary" />
            </Box>
          }
        >
          <RegisterForm />
        </Suspense>
      </Container>
    </>
  );
};

export default RegisterPage;

