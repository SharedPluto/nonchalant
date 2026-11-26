import { parseArticle, type BlogArticle } from './markdown';

const sourceFiles = import.meta.glob('../../content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const allArticles = Object.entries(sourceFiles)
  .map(([file, source]) => {
    const fallbackSlug = file.split('/').pop()?.replace(/\.md$/, '').replace(/^_/, '') || '';
    return parseArticle(source, fallbackSlug);
  })
  .filter((article): article is BlogArticle => Boolean(article));

export const articles = allArticles
  .filter(article => article.published)
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

export function getArticle(slug: string): BlogArticle | undefined {
  return articles.find(article => article.slug === slug);
}

export function getRelatedArticles(article: BlogArticle, limit = 3): BlogArticle[] {
  return articles
    .filter(candidate => candidate.slug !== article.slug)
    .sort((a, b) => {
      const aSharedTags = a.tags.filter(tag => article.tags.includes(tag)).length;
      const bSharedTags = b.tags.filter(tag => article.tags.includes(tag)).length;
      return bSharedTags - aSharedTags || Date.parse(b.date) - Date.parse(a.date);
    })
    .slice(0, limit);
}

export type { BlogArticle } from './markdown';
