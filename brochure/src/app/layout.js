import './globals.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header/Header';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import I18nProvider from '@/Provider/I18nProvider';
import { Suspense } from 'react';

export const metadata = {
  title: 'Anne Creations - Digital Brochure',
  description: 'Explore our premium embroidery designs. Luxury digital brochure with high-quality images.',
  icons: {
    icon: [{ url: '/assets/logo.svg', type: 'image/png', sizes: '32x32' }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <I18nProvider>
          {/* AnnouncementStrip removed as per user request */}
          <Header />
            <main id="main-content" style={{ minHeight: '100vh', background: 'var(--background)' }}>
              <Suspense
                fallback={
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#311807]"></div>
                  </div>
                }
              >
                {children}
              </Suspense>
            </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
