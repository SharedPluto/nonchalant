import { Helmet } from 'react-helmet-async';
import {
  absoluteUrl,
  cleanDescription,
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  SITE_NAME,
  SITE_URL,
  type Breadcrumb,
} from '@/lib/seo';

interface MetaTagsProps {
  title?: string;
  headline?: string;
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
  noindex?: boolean;
  breadcrumbs?: Breadcrumb[];
}

export default function MetaTags({
  title,
  headline,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = 'website',
  price,
  currency = 'SGD',
  brand,
  availability = 'InStock',
  sku,
  publishedAt,
  author,
  noindex = false,
  breadcrumbs,
}: MetaTagsProps) {
  const fullTitle = title
    ? title.toLowerCase().includes(SITE_NAME.toLowerCase()) ? title : `${title} | ${SITE_NAME}`
    : 'NonChalant — Style on your own terms';
  const metaDescription = cleanDescription(description);
  const canonical = absoluteUrl(url);
  const socialImage = absoluteUrl(image);

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo.png`,
    sameAs: ['https://www.instagram.com/thenonchalantstore'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@nonchalantstore.com',
      telephone: '+65 94898482',
      areaServed: 'SG',
    },
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content={noindex ? 'noindex,follow' : 'index,follow'} />
      <link rel="canonical" href={canonical} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={socialImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      {type === 'product' && price !== undefined && (
        <>
          <meta property="product:price:amount" content={price.toFixed(2)} />
          <meta property="product:price:currency" content={currency} />
        </>
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={socialImage} />

      {type === 'article' && (
        <>
          {publishedAt && <meta property="article:published_time" content={publishedAt} />}
          {author && <meta property="article:author" content={author} />}
        </>
      )}

      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: headline || title,
            description: metaDescription,
            image: [socialImage],
            datePublished: publishedAt,
            author: { '@type': 'Person', name: author || SITE_NAME },
            mainEntityOfPage: canonical,
          })}
        </script>
      )}

      {type === 'product' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: title?.replace(/\s*\|\s*Buy in Singapore\s*$/, ''),
            description: metaDescription,
            image: [socialImage],
            brand: brand ? { '@type': 'Brand', name: brand } : undefined,
            sku,
            offers: price !== undefined ? {
              '@type': 'Offer',
              price: price.toFixed(2),
              priceCurrency: currency,
              availability: `https://schema.org/${availability}`,
              url: canonical,
              itemCondition: 'https://schema.org/NewCondition',
            } : undefined,
          })}
        </script>
      )}

      {type === 'website' && (canonical === SITE_URL || canonical === `${SITE_URL}/`) && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: SITE_URL,
          })}
        </script>
      )}

      {breadcrumbs && breadcrumbs.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((breadcrumb, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: breadcrumb.name,
              item: absoluteUrl(breadcrumb.path),
            })),
          })}
        </script>
      )}

      <script type="application/ld+json">{JSON.stringify(organization)}</script>
    </Helmet>
  );
}
