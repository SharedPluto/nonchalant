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

function App() {
  return (
    <HelmetProvider>
      <HashRouter>
        <ScrollProgress />
        <SitemapGenerator />
        <Header />
        <CartDrawer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:handle" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
        <Footer />
      </HashRouter>
    </HelmetProvider>
  );
}

export default App;
