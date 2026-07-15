import { useState, useEffect } from 'react';
import { getShopifyClient } from '@/lib/shopify/client';

const client = getShopifyClient();

export interface ShopifyBlogPost {
  id: string;
  title: string;
  handle: string;
  excerpt: string;
  content: string;
  contentHtml: string;
  image: string | null;
  publishedAt: string;
  tags: string[];
  author: string;
}

const BLOGS_QUERY = `
  query GetBlogs {
    blogs(first: 5) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

const ARTICLES_QUERY = `
  query GetArticles($blogHandle: String!) {
    blog(handle: $blogHandle) {
      articles(first: 20, sortKey: PUBLISHED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            excerpt
            content
            contentHtml
            publishedAt
            tags
            author {
              name
            }
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

const ARTICLE_QUERY = `
  query GetArticle($blogHandle: String!, $articleHandle: String!) {
    blog(handle: $blogHandle) {
      articleByHandle(handle: $articleHandle) {
        id
        title
        handle
        excerpt
        content
        contentHtml
        publishedAt
        tags
        author {
          name
        }
        image {
          url
          altText
        }
      }
    }
  }
`;

function mapArticle(node: any): ShopifyBlogPost {
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    excerpt: node.excerpt || '',
    content: node.content || '',
    contentHtml: node.contentHtml || '',
    image: node.image?.url || null,
    publishedAt: node.publishedAt,
    tags: node.tags || [],
    author: node.author?.name || 'NonChalant',
  };
}

export function useShopifyBlogPosts(blogHandle: string = 'news') {
  const [posts, setPosts] = useState<ShopifyBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const result = await client.request(ARTICLES_QUERY, {
          variables: { blogHandle },
        });
        const articles = result.data?.blog?.articles?.edges || [];
        setPosts(articles.map((e: any) => mapArticle(e.node)));
      } catch (err) {
        setError('Failed to load blog posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [blogHandle]);

  return { posts, loading, error };
}

export function useShopifyBlogPost(blogHandle: string, articleHandle: string) {
  const [post, setPost] = useState<ShopifyBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      if (!articleHandle) return;
      setLoading(true);
      setError(null);
      try {
        const result = await client.request(ARTICLE_QUERY, {
          variables: { blogHandle, articleHandle },
        });
        const article = result.data?.blog?.articleByHandle;
        if (article) {
          setPost(mapArticle(article));
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError('Failed to load blog post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [blogHandle, articleHandle]);

  return { post, loading, error };
}

export function useShopifyBlogHandles() {
  const [handles, setHandles] = useState<string[]>([]);

  useEffect(() => {
    async function fetch() {
      try {
        const result = await client.request(BLOGS_QUERY);
        const blogs = result.data?.blogs?.edges || [];
        setHandles(blogs.map((e: any) => e.node.handle));
      } catch (err) {
        console.error('Failed to fetch blog handles:', err);
      }
    }
    fetch();
  }, []);

  return handles;
}
