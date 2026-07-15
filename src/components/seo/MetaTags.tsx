import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  brand?: string;
  availability?: 'InStock' | 'OutOfStock';
  sku?: string;
  publishedAt?: string;
  author?: string;
}

const SITE_NAME = 'NonChalant';
const DEFAULT_DESCRIPTION = 'NonChalant is a premium streetwear marketplace. Browse curated aesthetics, brands, and categories. Style Without The Effort.';
const DEFAULT_IMAGE = 'https://nonchalant.co/og-image.jpg';
const SITE_URL = 'https://nonchalant.co';

export default function MetaTags({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = 'website',
  price,
  currency = 'USD',
  brand,
  availability = 'InStock',
  sku,
  publishedAt,
  author,
}: MetaTagsProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article meta tags */}
      {type === 'article' && (
        <>
          {publishedAt && <meta property="article:published_time" content={publishedAt} />}
          {author && <meta property="article:author" content={author} />}
        </>
      )}

      {/* Product Schema (if product page) */}
      {type === 'product' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: title,
            description,
            image,
            brand: brand ? {
              '@type': 'Brand',
              name: brand,
            } : undefined,
            sku,
            offers: price ? {
              '@type': 'Offer',
              price: price.toString(),
              priceCurrency: currency,
              availability: `https://schema.org/${availability}`,
              url,
            } : undefined,
          })}
        </script>
      )}

      {/* Website Schema (if homepage) */}
      {type === 'website' && !title && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${SITE_URL}/shop?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          })}
        </script>
      )}

      {/* Organization Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/logo.png`,
          sameAs: [
            'https://instagram.com/nonchalant',
            'https://twitter.com/nonchalant',
            'https://tiktok.com/@nonchalant',
          ],
        })}
      </script>
    </Helmet>
  );
}
