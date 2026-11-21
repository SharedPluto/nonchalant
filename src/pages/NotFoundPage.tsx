import { Link } from 'react-router-dom';
import MetaTags from '@/components/seo/MetaTags';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[var(--nc-bg)] pt-[100px] px-6 text-center">
      <MetaTags
        title="Page Not Found"
        description="The requested NonChalant page could not be found."
        noindex
      />
      <h1 className="font-display text-3xl uppercase">Page not found</h1>
      <p className="mt-4 text-sm text-[var(--nc-grey)]">
        The page may have moved, or the product is no longer available.
      </p>
      <Link to="/shop" className="btn-primary inline-block mt-8 px-6 py-3">
        Browse the shop
      </Link>
    </main>
  );
}
