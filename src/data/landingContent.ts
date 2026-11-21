export const categoryLandingContent: Record<string, { name: string; intro: string }> = {
  shoes: {
    name: 'Shoes',
    intro: 'Explore sneakers and footwear available from NonChalant in Singapore. The selection brings together everyday pairs, archival designs, collaborations, and statement releases across the brands in the current catalogue. Use the product links to compare available sizes, variant pricing, and availability.',
  },
  tops: {
    name: 'Tops',
    intro: 'Browse T-shirts, jerseys, and other tops curated by NonChalant for Singapore. This collection covers graphic pieces, understated staples, sportswear, and collaborative designs. Each product page provides the current description, sizing options, price in SGD, and stock information.',
  },
  bottoms: {
    name: 'Bottoms',
    intro: 'Shop pants and shorts in the NonChalant bottoms collection. The range is selected to work with the store’s sneakers, tops, and outerwear, with options for relaxed everyday outfits and more directional streetwear looks. Open each product for size-specific availability and pricing.',
  },
  jackets: {
    name: 'Jackets',
    intro: 'Discover jackets and outerwear at NonChalant Singapore. The collection includes track tops and layers drawn from the current streetwear and sportswear catalogue. Product pages provide the available sizes, current SGD pricing, descriptions, and related pieces from the same brand or category.',
  },
  bags: {
    name: 'Bags',
    intro: 'Browse bags and carry accessories at NonChalant. The current selection connects functional everyday pieces with the brands and aesthetics represented across the store. Visit each product page for dimensions and details supplied in the catalogue, current availability, and Singapore delivery information.',
  },
  accessories: {
    name: 'Accessories',
    intro: 'Complete your rotation with accessories from NonChalant Singapore. This collection includes socks, collectibles, and smaller pieces from the catalogue’s streetwear and creative brands. Each listing links to current pricing, product details, availability, and related items for further exploration.',
  },
};

export function getBrandLandingIntro(brand: string, categories: string[]): string {
  const categoryText = categories.length > 0
    ? ` Browse ${categories.join(', ').toLowerCase()} currently listed from ${brand}.`
    : '';
  return `Shop ${brand} at NonChalant in Singapore.${categoryText} Every product page includes current SGD pricing, available options, catalogue details, and stock status, with related products and categories to help you continue browsing.`;
}
