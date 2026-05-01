// app/forgotpassword/page.tsx
import MobileSender from "./EmailSender";
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// ✅ SEO metadata
export const metadata = {
  title: 'Forgot Password | Anne Creations',
  description:
    'Reset your Anne Creations account password easily. Enter your mobile number to receive a secure password reset link via SMS.',
  keywords: [
    'Anne Creations',
    'forgot password',
    'reset password',
    'mobile reset link',
    'embroidery designs login',
  ],
  openGraph: {
    title: 'Forgot Password | Anne Creations',
    description:
      'Reset your account password and regain access to your Anne Creations account.',
    url: 'https://www.annecreationshb.com/Auth/forgotpassword',
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
};

// ✅ Correct function definition for the page component
export default function Page() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <MobileSender />
    </Suspense>
  );
}

