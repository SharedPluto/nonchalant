export function getShopifyImageUrl(url: string, width: number): string {
  if (!url.includes('cdn.shopify.com')) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('width', String(width));
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getShopifySrcSet(url: string, widths: number[]): string {
  return widths.map(width => `${getShopifyImageUrl(url, width)} ${width}w`).join(', ');
}
