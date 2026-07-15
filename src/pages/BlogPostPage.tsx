import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import { useShopifyBlogPost } from '@/hooks/useShopifyBlog';
import MetaTags from '@/components/seo/MetaTags';

export default function BlogPostPage() {
  const { handle } = useParams<{ handle: string }>();
  const { post, loading, error } = useShopifyBlogPost('news', handle || '');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[80px] flex items-center justify-center">
        <div className="animate-pulse text-[var(--nc-grey)] text-sm">Loading post...</div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[80px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--nc-grey)] mb-4">{error || 'Post not found'}</p>
          <Link to="/blog" className="text-[11px] uppercase tracking-wider text-[var(--nc-purple)] hover:underline">
            Back to Journal
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <MetaTags
        title={post.title}
        description={post.excerpt || post.content.slice(0, 160)}
        url={`https://nonchalant.co/blog/${post.handle}`}
        image={post.image || undefined}
        type="article"
        publishedAt={post.publishedAt}
        author={post.author}
      />
      <main className="min-h-screen bg-[var(--nc-bg)] pt-[80px]">
        {/* Header Image */}
        {post.image && (
          <div className="w-full aspect-[21/9] bg-[var(--nc-offwhite)] overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="max-w-[800px] mx-auto px-6 md:px-12 py-10">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-[var(--nc-grey)] hover:text-[var(--nc-purple)] transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Journal
          </Link>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--nc-purple)] bg-[var(--nc-purple)]/5 px-2 py-1"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-display text-2xl md:text-4xl uppercase tracking-[0.02em] leading-tight mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 pb-8 mb-8 border-b border-[var(--nc-border)]">
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--nc-grey)]">
              <User size={12} />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--nc-grey)]">
              <Calendar size={12} />
              {formatDate(post.publishedAt)}
            </span>
          </div>

          {/* Content */}
          <article
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </div>
      </main>
    </>
  );
}
