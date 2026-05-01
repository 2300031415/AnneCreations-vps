import CategoryPage from "./CategoryPage";
import { Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";

// ✅ SEO Metadata
export const metadata = {
  title: 'All Categories | Anne Creations',
  description:
    'Explore a wide range of embroidery design categories at Anne Creations. Find the perfect digital embroidery design for every project and occasion.',
  keywords: [
    'embroidery designs',
    'digital embroidery',
    'machine embroidery',
    'embroidery patterns',
    'Anne Creations',
    'shop by category',
  ],
  openGraph: {
    title: 'All Categories | Anne Creations',
    description:
      'Discover our embroidery design categories — floral, festive, abstract, alphabets, and more. Download premium embroidery files instantly.',
    url: 'https://annecreationshb.com/Category',
    siteName: 'Anne Creations',
    images: [
      {
        url: 'https://annecreationshb.com/images/category-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Embroidery Design Categories - Anne Creations',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Categories | Anne Creations',
    description:
      'Browse embroidery design categories and download your favorite designs instantly from Anne Creations.',
    images: ['https://annecreationshb.com/images/category-banner.jpg'],
  },
};

// ✅ Default Export
export default function Page() {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <CategoryPage />
    </Suspense>
  );
}

