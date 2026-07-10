import { HashRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ScrollProgress from '@/components/ScrollProgress';
import SitemapGenerator from '@/components/seo/SitemapGenerator';
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import AboutPage from '@/pages/AboutPage';
import SizeGuidePage from '@/pages/SizeGuidePage';
import ShippingPage from '@/pages/ShippingPage';
import ReturnsPage from '@/pages/ReturnsPage';
import FAQPage from '@/pages/FAQPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import AuthenticityPage from '@/pages/AuthenticityPage';
import AdminWaitlistPage from '@/pages/AdminWaitlistPage';
import WaitlistModal from '@/components/WaitlistModal';
import ToastNotification from '@/components/ToastNotification';

function App() {
  return (
    <HelmetProvider>
      <HashRouter>
        <ScrollProgress />
        <SitemapGenerator />
        <Header />
        <CartDrawer />
        <WaitlistModal />
        <ToastNotification />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:handle" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/size-guide" element={<SizeGuidePage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/authenticity" element={<AuthenticityPage />} />
          <Route path="/admin/waitlist" element={<AdminWaitlistPage />} />
        </Routes>
        <Footer />
      </HashRouter>
    </HelmetProvider>
  );
}

export default App;
