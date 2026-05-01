import CartPage from './CartPage';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

export const metadata = {
  title: 'Your Shopping Cart | Anne Creations',
  description: 'Review your selected items, adjust quantities, and proceed to checkout on Anne Creations.',
  keywords: ['Anne Creations', 'shopping cart', 'checkout', 'embroidery designs'],
  openGraph: {
    title: 'Your Shopping Cart | Anne Creations',
    description: 'View and manage your cart items before checkout.',
    url: 'https://annecreationshb.com/Cart',
    siteName: 'Anne Creations',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Shopping Cart | Anne Creations',
    description: 'Manage your cart items easily on Anne Creations.',
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
      <CartPage />
    </Suspense>
  );
}

