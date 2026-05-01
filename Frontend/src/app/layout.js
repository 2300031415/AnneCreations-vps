import './globals.css';
import Footer from '@/components/Footer';
import Header from '@/components/Header/Header';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ScrollToTop from '@/components/ScrollTotop';
import WhatsappIcon from '@/components/whatsapp_icon';
import AiChat from '@/components/AiChat/AiChat';
import { AnalyticsProvider } from '@/Provider/AnalyticsProvider';
import { NotistackProvider } from '@/Provider/NotiStackProvider';
import LoginPopup from '@/components/Auth/LoginPopup';
import CartDrawer from '@/components/Cart/CartDrawer';
import I18nProvider from '@/Provider/I18nProvider';
import DeploymentManager from '@/components/DeploymentManager';
import DiscountModal from '@/components/DiscountModal/DiscountModal';
import { Suspense } from 'react';

export const metadata = {
  title: 'Anne Creations - Premium Embroidery Designs',
  description: 'Download high-quality digital embroidery designs, patterns, and machine-ready files. Explore our collection of floral, festive, and modern embroidery designs.',
  icons: {
    icon: [{ url: '/assets/logo.svg', type: 'image/png', sizes: '32x32' }],
  },
};

const fontLinks = (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
  </>
);

// eslint-disable-next-line react/prop-types
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {fontLinks}
      </head>
      <body>
        <I18nProvider>
          <AnalyticsProvider>
            <Header />
            <NotistackProvider>
              <DeploymentManager />
              <main id="main-content" style={{ minHeight: '100vh' }}>
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
            </NotistackProvider>
            <WhatsappIcon />
            <AiChat />
            <ScrollToTop />
            <LoginPopup />
            <CartDrawer />
            <DiscountModal />
            <Footer />
          </AnalyticsProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

