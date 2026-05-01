import ResetPasswordPage from './FrogotPasswordPage';

export const metadata = {
  title: 'Reset Your Password | Anne Creations',
  description:
    'Forgot your password? Easily reset your Anne Creations account credentials securely and regain access.',
  keywords: [
    'reset password',
    'forgot password',
    'account recovery',
    'Anne Creations login',
  ],
  openGraph: {
    title: 'Reset Your Password | Anne Creations',
    description:
      'Use this page to securely reset your Anne Creations account password.',
    url: 'https://annecreationshb.com/reset-password',
    siteName: 'Anne Creations',
    images: [
      {
        url: 'https://annecreationshb.com/images/reset-password-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Reset Password - Anne Creations',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reset Your Password | Anne Creations',
    description:
      'Quickly reset your password to regain access to your Anne Creations account.',
    images: ['https://annecreationshb.com/images/reset-password-banner.jpg'],
  },
};

// ✅ Add JSON-LD structured data for SEO

export default function Page() {
  return <ResetPasswordPage />;
}

