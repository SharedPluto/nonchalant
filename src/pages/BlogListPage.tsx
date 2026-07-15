import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import { useShopifyBlogPosts } from '@/hooks/useShopifyBlog';
import MetaTags from '@/components/seo/MetaTags';

export default function BlogListPage() {
  const { posts, loading, error } = useShopifyBlogPosts('news');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <MetaTags
        title="Journal"
        description="The latest from NonChalant — drops, culture, and stories from the world of streetwear."
        url="https://nonchalant.co/blog"
        type="website"
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[80px]">
        {/* Header */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-8 pb-12">
          <p className="text-eyebrow mb-3">NonChalant</p>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-[0.02em]">
            Journal
          </h1>
          <p className="text-[14px] text-[var(--nc-grey)] mt-3 max-w-[500px]">
            Drops, culture, and stories from the world of streetwear.
          </p>
        </div>

        {/* Content */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 pb-20">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-pulse text-[var(--nc-grey)] text-sm">Loading posts...</div>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <p className="text-[var(--nc-grey)] mb-2">{error}</p>
              <p className="text-[13px] text-[var(--nc-grey)]">
                Blog posts will appear here once you publish them in Shopify.
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-[var(--nc-grey)] mb-4">No posts yet.</p>
              <p className="text-[13px] text-[var(--nc-grey)] max-w-[400px] mx-auto">
                Publish your first blog post in Shopify Admin to see it here.
                Go to <strong>Shopify Admin → Content → Blog posts</strong> to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.handle}`}
                  className="group block"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-[var(--nc-offwhite)] overflow-hidden mb-4">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--nc-offwhite)]">
                        <span className="text-[var(--nc-grey)] text-[11px] uppercase tracking-wider">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--nc-grey)]">
                      <Calendar size={10} />
                      {formatDate(post.publishedAt)}
                    </span>
                    {post.tags.length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--nc-purple)]">
                        <Tag size={10} />
                        {post.tags[0]}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-[16px] font-medium text-[var(--nc-text)] leading-snug group-hover:text-[var(--nc-purple)] transition-colors mb-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-[13px] text-[var(--nc-grey)] leading-relaxed line-clamp-3 mb-3">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Read more */}
                  <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[var(--nc-text)] group-hover:text-[var(--nc-purple)] transition-colors">
                    Read More <ArrowRight size={12} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
