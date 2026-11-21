import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ScrollProgress from '@/components/ScrollProgress';
import ScrollToTop from '@/components/ScrollToTop';
import Analytics from '@/components/Analytics';
import HomePage from '@/pages/HomePage';

const ShopPage = lazy(() => import('@/pages/ShopPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ShippingPage = lazy(() => import('@/pages/ShippingPage'));
const ReturnsPage = lazy(() => import('@/pages/ReturnsPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const AuthenticityPage = lazy(() => import('@/pages/AuthenticityPage'));
const SizeGuidePage = lazy(() => import('@/pages/SizeGuidePage'));
const AdminWaitlistPage = lazy(() => import('@/pages/AdminWaitlistPage'));
const BlogListPage = lazy(() => import('@/pages/BlogListPage'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'));
const CollectionPage = lazy(() => import('@/pages/CollectionPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
import WaitlistModal from '@/components/WaitlistModal';
import ToastNotification from '@/components/ToastNotification';

function LegacyHashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#/')) return;
    const target = hash.slice(1);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    navigate(target, { replace: true });
  }, [navigate]);

  return null;
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <LegacyHashRedirect />
        <Analytics />
        <ScrollProgress />
        <ScrollToTop />
        <Header />
        <CartDrawer />
        <WaitlistModal />
        <ToastNotification />
        <Suspense fallback={<div className="min-h-screen bg-[var(--nc-bg)] pt-[100px] text-center text-sm text-[var(--nc-grey)]">Loading page…</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:handle" element={<ProductDetailPage />} />
          <Route path="/brands/:brandSlug" element={<CollectionPage type="brand" />} />
          <Route path="/categories/:categorySlug" element={<CollectionPage type="category" />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/returns" element={<ReturnsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/authenticity" element={<AuthenticityPage />} />
          <Route path="/size-guide" element={<SizeGuidePage />} />
          <Route path="/admin/waitlist" element={<AdminWaitlistPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:handle" element={<BlogPostPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
        <Footer />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
