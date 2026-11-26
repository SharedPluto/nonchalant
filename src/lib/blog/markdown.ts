export interface BlogArticle {
  title: string;
  slug: string;
  date: string;
  author: string;
  standfirst: string;
  seoTitle: string;
  seoDescription: string;
  heroImage: string;
  heroAlt: string;
  heroCaption: string;
  tags: string[];
  relatedProducts: string[];
  published: boolean;
  readTime: string;
  contentHtml: string;
  plainContent: string;
}

function escapeHtml(value = ''): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseValue(value: string): string | boolean | string[] {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map(item => item.trim().replace(/^(['"])(.*)\1$/, '$2'))
      .filter(Boolean);
  }
  return trimmed.replace(/^(['"])(.*)\1$/, '$2');
}

function parseFrontmatter(source: string): { data: Record<string, string | boolean | string[]>; body: string } {
  const normalized = source.replaceAll('\r\n', '\n').trimStart();
  if (!normalized.startsWith('---\n')) return { data: {}, body: source };
  const end = normalized.indexOf('\n---', 4);
  if (end === -1) throw new Error('Unclosed Markdown frontmatter');
  const data: Record<string, string | boolean | string[]> = {};
  for (const line of normalized.slice(4, end).split('\n')) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (match) data[match[1]] = parseValue(match[2]);
  }
  return { data, body: normalized.slice(end + 4).trim() };
}

function inlineMarkup(value: string): string {
  let html = escapeHtml(value);
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_match, label, url) => (
    `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`
  ));
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  return html;
}

function shopifyImage(url: string, width: number): string {
  if (!url.includes('cdn.shopify.com')) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('width', String(width));
    return parsed.toString();
  } catch {
    return url;
  }
}

function imageFigure(match: RegExpMatchArray): string {
  const alt = escapeHtml(match[1]);
  const url = escapeHtml(match[2]);
  const caption = escapeHtml(match[3] || '');
  const fullWidth = Boolean(match[4]);
  const widths = fullWidth ? [680, 960, 1200, 1600] : [480, 680, 960, 1200];
  const srcset = widths.map(width => `${escapeHtml(shopifyImage(match[2], width))} ${width}w`).join(', ');
  const sizes = fullWidth ? '(max-width: 768px) 100vw, 1080px' : '(max-width: 768px) calc(100vw - 48px), 680px';
  return `<figure class="article-figure${fullWidth ? ' article-figure--full' : ''}"><img src="${url}" srcset="${srcset}" sizes="${sizes}" alt="${alt}" loading="lazy" decoding="async" />${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const html: string[] = [];
  let paragraph: string[] = [];
  let list: 'ul' | 'ol' | null = null;

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${inlineMarkup(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list) html.push(`</${list}>`);
    list = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const image = trimmed.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+["']([^"']+)["'])?\)(\{full\})?$/);
    if (image) {
      flushParagraph();
      flushList();
      html.push(imageFigure(image));
      continue;
    }

    const heading = trimmed.match(/^(##|###)\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkup(heading[2])}</h${level}>`);
      continue;
    }

    if (trimmed === '---') {
      flushParagraph();
      flushList();
      html.push('<hr />');
      continue;
    }

    if (trimmed.startsWith('> ')) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${inlineMarkup(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const requiredList = unordered ? 'ul' : 'ol';
      if (list !== requiredList) {
        flushList();
        list = requiredList;
        html.push(`<${list}>`);
      }
      html.push(`<li>${inlineMarkup((unordered || ordered)?.[1] || '')}</li>`);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return html.join('\n');
}

function requiredText(data: Record<string, string | boolean | string[]>, key: string): string {
  const value = data[key];
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing blog frontmatter: ${key}`);
  return value.trim();
}

export function parseArticle(source: string, fallbackSlug: string): BlogArticle | null {
  const { data, body } = parseFrontmatter(source);
  if (!Object.keys(data).length) return null;
  const published = data.published !== false;
  const title = requiredText(data, 'title');
  const slug = typeof data.slug === 'string' && data.slug ? data.slug : fallbackSlug;
  const plainContent = body
    .replace(/!\[[^\]]*\]\([^)]+\)(?:\{full\})?/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const minutes = Math.max(1, Math.ceil(plainContent.split(' ').filter(Boolean).length / 200));

  if (published) {
    for (const key of ['date', 'standfirst', 'heroImage', 'heroAlt']) requiredText(data, key);
    if (!body.trim()) throw new Error(`Published article has no body: ${slug}`);
    if (/\[[^\]]*(?:TODO|Bryan|fit note)[^\]]*\]/i.test(body)) {
      throw new Error(`Published article still contains an unfinished note: ${slug}`);
    }
  }

  return {
    title,
    slug,
    date: typeof data.date === 'string' ? data.date : '',
    author: typeof data.author === 'string' && data.author ? data.author : 'NonChalant',
    standfirst: typeof data.standfirst === 'string' ? data.standfirst : '',
    seoTitle: typeof data.seoTitle === 'string' && data.seoTitle ? data.seoTitle : `${title} | NonChalant Journal`,
    seoDescription: typeof data.seoDescription === 'string' && data.seoDescription ? data.seoDescription : (typeof data.standfirst === 'string' ? data.standfirst : ''),
    heroImage: typeof data.heroImage === 'string' ? data.heroImage : '',
    heroAlt: typeof data.heroAlt === 'string' ? data.heroAlt : '',
    heroCaption: typeof data.heroCaption === 'string' ? data.heroCaption : '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    relatedProducts: Array.isArray(data.relatedProducts) ? data.relatedProducts : [],
    published,
    readTime: typeof data.readTime === 'string' && data.readTime ? data.readTime : `${minutes} min read`,
    contentHtml: markdownToHtml(body),
    plainContent,
  };
}
