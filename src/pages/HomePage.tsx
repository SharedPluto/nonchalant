import { lazy, Suspense } from 'react';
import MetaTags from '@/components/seo/MetaTags';
import HeroSection from '@/sections/HeroSection';
import NewDropsSection from '@/sections/NewDropsSection';
import BrandShowcase from '@/sections/BrandShowcase';
import CategoryGrid from '@/sections/CategoryGrid';

const AestheticPanels = lazy(() => import('@/sections/AestheticPanels'));

export default function HomePage() {
  return (
    <>
      <MetaTags
        title="Nonchalant | Style On Your Own Terms"
        description="Shop authenticated streetwear and sneakers in Singapore. Discover Nike, Jordan, Palace, KITH, and other curated brands at NonChalant."
        url="https://nonchalantstore.com/"
        type="website"
      />
      <main>
        <h1 className="sr-only">Streetwear & Sneakers in Singapore</h1>
        <HeroSection />
        <NewDropsSection />
        <Suspense fallback={<section className="h-[80vh] md:h-screen bg-[var(--nc-black)]" aria-hidden="true" />}>
          <AestheticPanels />
        </Suspense>
        <BrandShowcase />
        <CategoryGrid />
      </main>
    </>
  );
}
