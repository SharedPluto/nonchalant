import BlogCard from '@/components/blog/BlogCard';
import MetaTags from '@/components/seo/MetaTags';
import { articles } from '@/lib/blog';

export default function BlogListPage() {
  return (
    <>
      <MetaTags
        title="NonChalant Journal | Streetwear Stories from Singapore"
        description="Read the NonChalant Journal for streetwear collaborations, product guides, cultural context, and stories from Singapore."
        url="https://nonchalantstore.com/blog"
        type="website"
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[100px]">
        <header className="max-w-[1200px] mx-auto px-6 md:px-12 pt-8 pb-12 md:pb-16">
          <p className="text-eyebrow mb-3">NonChalant</p>
          <h1 className="font-display text-4xl md:text-6xl uppercase tracking-[0.02em]">
            Journal
          </h1>
          <p className="text-base text-[var(--nc-grey)] leading-relaxed mt-4 max-w-[560px]">
            Collaborations, cultural context, and practical guides from the world of streetwear.
          </p>
        </header>

        <div className="max-w-[1200px] mx-auto px-6 md:px-12 pb-24">
          {articles.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {articles.map((article, index) => (
                <BlogCard key={article.slug} article={article} eager={index === 0} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--nc-grey)] py-20 text-center">
              New Journal stories are coming soon.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
