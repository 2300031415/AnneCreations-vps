import ProfilePage from './ProfilePage';

export const metadata = {
  title: 'My Account | Anne Creations',
  description:
    'Access and manage your profile, orders, and personal information securely in Anne Creations.',
  keywords: [
    'my account',
    'profile',
    'user dashboard',
    'order history',
    'account settings',
    'Anne Creations profile',
  ],
  openGraph: {
    title: 'My Account | Anne Creations',
    description:
      'Manage your orders, profile details, and saved addresses in Anne Creations.',
    url: 'https://annecreationshb.com/Profile',
    siteName: 'Anne Creations',
    images: [
      {
        url: 'https://annecreationshb.com/images/profile-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'My Account - Anne Creations',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Account | Anne Creations',
    description:
      'Securely manage your account, profile, and orders on Anne Creations.',
    images: ['https://annecreationshb.com/images/profile-banner.jpg'],
  },
};

// ✅ Add JSON-LD Structured Data for SEO

export default function Page() {
  return <ProfilePage />;
}

