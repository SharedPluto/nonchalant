import MetaTags from '@/components/seo/MetaTags';
import HeroSection from '@/sections/HeroSection';
import AestheticPanels from '@/sections/AestheticPanels';
import BrandShowcase from '@/sections/BrandShowcase';
import CategoryGrid from '@/sections/CategoryGrid';

export default function HomePage() {
  return (
    <>
      <MetaTags
        title=""
        description="NonChalant is a premium streetwear marketplace. Browse curated aesthetics including Minimalist, Skater, Tech, and Hypebeast. Shop top brands like Nike, Adidas, Stone Island, Supreme. Style Without The Effort."
        url="https://nonchalant.co/"
        type="website"
      />
      <main>
        <HeroSection />
        <AestheticPanels />
        <BrandShowcase />
        <CategoryGrid />
      </main>
    </>
  );
}
