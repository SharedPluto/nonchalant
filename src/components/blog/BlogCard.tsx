import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BlogArticle } from '@/lib/blog';
import { formatArticleDate } from '@/lib/blog/date';
import { getShopifyImageUrl, getShopifySrcSet } from '@/lib/shopify/image';

interface BlogCardProps {
  article: BlogArticle;
  eager?: boolean;
}

export default function BlogCard({ article, eager = false }: BlogCardProps) {
  return (
    <article className="group">
      <Link to={`/blog/${article.slug}`} className="block" aria-label={`Read ${article.title}`}>
        <div className="aspect-[3/2] overflow-hidden bg-[var(--nc-offwhite)] mb-5">
          <img
            src={getShopifyImageUrl(article.heroImage, 768)}
            srcSet={getShopifySrcSet(article.heroImage, [480, 768, 960, 1200])}
            sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) calc(50vw - 56px), 360px"
            alt={article.heroAlt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            decoding="async"
          />
        </div>
        <div className="flex items-center justify-between gap-4 mb-3 text-[10px] uppercase tracking-[0.12em]">
          <span className="text-[var(--nc-purple)]">{article.tags[0] || 'Journal'}</span>
          <span className="text-[var(--nc-grey)]">{article.readTime}</span>
        </div>
        <h2 className="font-display text-xl md:text-2xl uppercase leading-tight tracking-[0.02em] group-hover:text-[var(--nc-purple)] transition-colors">
          {article.title}
        </h2>
        <p className="text-sm text-[var(--nc-grey)] leading-relaxed mt-3 mb-4">
          {article.standfirst}
        </p>
        <div className="flex items-center justify-between gap-4 text-[11px] text-[var(--nc-grey)]">
          <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
          <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-[var(--nc-text)] group-hover:text-[var(--nc-purple)] transition-colors">
            Read story <ArrowUpRight size={13} />
          </span>
        </div>
      </Link>
    </article>
  );
}
