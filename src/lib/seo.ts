export const SITE_NAME = 'NonChalant';
export const SITE_URL = 'https://nonchalantstore.com';
export const DEFAULT_IMAGE = `${SITE_URL}/assets/logo-wide.png`;
export const DEFAULT_DESCRIPTION = 'Shop curated streetwear, sneakers, and accessories in Singapore from NonChalant. Style on your own terms.';

export type Breadcrumb = {
  name: string;
  path: string;
};

export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function cleanDescription(value: string, maxLength = 160): string {
  const text = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, '')}…`;
}
