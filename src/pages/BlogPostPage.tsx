import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import BlogCard from '@/components/blog/BlogCard';
import ShopTheStory from '@/components/blog/ShopTheStory';
import MetaTags from '@/components/seo/MetaTags';
import { getArticle, getRelatedArticles } from '@/lib/blog';
import { formatArticleDate } from '@/lib/blog/date';
import { getShopifyImageUrl, getShopifySrcSet } from '@/lib/shopify/image';

export default function BlogPostPage() {
  const { handle = '' } = useParams<{ handle: string }>();
  const article = getArticle(handle);

  if (!article) {
    return (
      <>
        <MetaTags
          title="Journal Story Not Found"
          description="The requested NonChalant Journal story could not be found."
          url={`https://nonchalantstore.com/blog/${handle}`}
          noindex
        />
        <main className="min-h-screen bg-[var(--nc-bg)] pt-[140px] px-6 text-center">
          <h1 className="font-display text-3xl uppercase mb-4">Story not found</h1>
          <p className="text-sm text-[var(--nc-grey)] mb-6">This Journal story is unavailable or has not been published.</p>
          <Link to="/blog" className="text-[11px] uppercase tracking-wider text-[var(--nc-purple)] hover:underline">
            Back to Journal
          </Link>
        </main>
      </>
    );
  }

  const relatedArticles = getRelatedArticles(article);

  return (
    <>
      <MetaTags
        title={article.seoTitle}
        headline={article.title}
        description={article.seoDescription}
        url={`https://nonchalantstore.com/blog/${article.slug}`}
        image={article.heroImage}
        type="article"
        publishedAt={article.date}
        author={article.author}
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Journal', path: '/blog' },
          { name: article.title, path: `/blog/${article.slug}` },
        ]}
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[100px]">
        <article>
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-8">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--nc-grey)] hover:text-[var(--nc-purple)] transition-colors mb-6"
            >
              <ArrowLeft size={14} />
              Back to Journal
            </Link>
            <figure className="m-0">
              <div className="aspect-[3/2] overflow-hidden bg-[var(--nc-offwhite)]">
                <img
                  src={getShopifyImageUrl(article.heroImage, 1200)}
                  srcSet={getShopifySrcSet(article.heroImage, [768, 1200, 1600, 2000])}
                  sizes="(max-width: 1200px) calc(100vw - 48px), 1104px"
                  alt={article.heroAlt}
                  className="w-full h-full object-cover"
                  width="1600"
                  height="1067"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
              {article.heroCaption && (
                <figcaption className="text-xs text-[var(--nc-grey)] text-center mt-3">
                  {article.heroCaption}
                </figcaption>
              )}
            </figure>
          </div>

          <header className="max-w-[760px] mx-auto px-6 pt-10 md:pt-14 pb-10">
            <p className="text-eyebrow mb-4">{article.tags[0] || 'Journal'}</p>
            <h1 className="font-display text-3xl md:text-5xl uppercase tracking-[0.02em] leading-[1.08]">
              {article.title}
            </h1>
            <p className="text-lg text-[var(--nc-grey)] leading-relaxed mt-5">
              {article.standfirst}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-8 pt-6 border-t border-[var(--nc-border)] text-[11px] uppercase tracking-wider text-[var(--nc-grey)]">
              <span className="inline-flex items-center gap-1.5"><User size={13} />{article.author}</span>
              <time className="inline-flex items-center gap-1.5" dateTime={article.date}>
                <Calendar size={13} />{formatArticleDate(article.date)}
              </time>
              <span className="inline-flex items-center gap-1.5"><Clock size={13} />{article.readTime}</span>
            </div>
          </header>

          <div className="max-w-[680px] mx-auto px-6">
            <div className="prose-blog" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--nc-border)] mt-12 pt-6">
                {article.tags.map(tag => (
                  <span key={tag} className="text-[10px] uppercase tracking-[0.12em] text-[var(--nc-purple)]">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="max-w-[1200px] mx-auto px-6 md:px-12 pb-24">
            <ShopTheStory handles={article.relatedProducts} />
            {relatedArticles.length > 0 && (
              <section className="border-t border-[var(--nc-border)] mt-20 pt-12" aria-labelledby="related-stories">
                <h2 id="related-stories" className="font-display text-2xl md:text-3xl uppercase tracking-[0.02em] mb-8">
                  Related stories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedArticles.map(related => <BlogCard key={related.slug} article={related} />)}
                </div>
              </section>
            )}
          </div>
        </article>
      </main>
    </>
  );
}
