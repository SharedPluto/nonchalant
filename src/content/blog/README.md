# NonChalant Journal content

Articles are Markdown files in this folder. Published stories appear automatically on `/blog`, receive their own `/blog/<slug>` page, and are added to the sitemap during the next site build. Newest-first ordering uses the frontmatter `date`.

## Add an article

1. Copy `_template.md` to a lowercase, hyphenated filename such as `my-story.md`.
2. Fill in every frontmatter field. `slug` must be unique and should match the filename.
3. Add the article copy below the second `---`. The renderer supports paragraphs, H2/H3 headings, lists, blockquotes, links, and captioned images.
4. Add landscape editorial images to `public/assets/blog/` and reference them as `/assets/blog/image-name.jpg`, or use an existing Shopify CDN image URL. Hero images should be at least 1600px wide. Do not use plain product flats as heroes.
5. Add related products by their live Shopify handles in `relatedProducts`. The article renders them with the site's standard product cards.
6. Set `published: true`, then run `npm run build` and `npm run test:seo`. Review the preview before merging.

Only files with `published: true` are public. Drafts are not rendered or added to the sitemap. A published file with unfinished bracketed notes fails the build rather than going live accidentally.

## Jordan 1 sizing guide

`jordan-1-sizing-guide.md` is the reserved, unpublished slot for Guide 1. Paste the approved copy, complete both fit notes, add its hero and metadata, then change `published` to `true`. Its two fit notes were not available when this template was added, so it must remain unpublished until Bryan supplies them.
