import ContactUsPage from './contactPage';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export const metadata = {
  title: 'Contact Us | Anne Creations',
  description:
    'Get in touch with Anne Creations. We’re here to help with product inquiries, orders, or customer support.',
  keywords: [
    'contact us',
    'customer support',
    'help center',
    'ecommerce support',
    'Anne Creations contact',
  ],
  openGraph: {
    title: 'Contact Us | Anne Creations',
    description:
      'Have questions? Reach out to our friendly support team at Anne Creations for assistance.',
    url: 'https://annecreationshb.com/Contactus',
    siteName: 'Anne Creations',
    images: [
      {
        url: 'https://annecreationshb.com/images/contact-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Us - Anne Creations',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Anne Creations',
    description:
      'Get in touch with our team for any support or product-related queries.',
    images: ['https://annecreationshb.com/images/contact-banner.jpg'],
  },
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <ContactUsPage />
    </Suspense>
  );
}

