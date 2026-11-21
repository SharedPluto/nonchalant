# Rollback procedure

## Safety points

- Pre-change branch: `main`
- Pre-change tag: `rollback/before-seo-foundation-2026-11-21`
- Implementation branch: `fix/seo-foundation`
- The preview is isolated and does not modify production, DNS, Shopify, Search Console, or GA4.

## Fast rollback after a Git-based deployment

1. In the deployment dashboard, select the deployment built from `rollback/before-seo-foundation-2026-11-21` and promote/redeploy it.
2. Confirm `/`, `/shop`, a product, `/robots.txt`, and `/sitemap.xml` on production.
3. Do not alter Shopify DNS during rollback.

## Git rollback

To restore the repository exactly to the pre-change state:

```bash
git switch main
git reset --hard rollback/before-seo-foundation-2026-11-21
```

If the implementation branch has already been merged and `main` must retain later history, revert the merge/commit instead of force-resetting a shared branch:

```bash
git revert <implementation-commit-sha>
```

The generated HTML, sitemap, robots file, redirects, routing changes, and metadata are all contained in the same reversible change set. There is no database migration and no external state to unwind.

## Preview rollback

The verified SEO preview snapshot is `27ce5d7`. It is isolated from production. To compare with the original site, check out the rollback tag, run a clean install/build, and save that as a separate preview version. Do not overwrite the only known-good preview until the replacement has been verified.

```bash
git switch --detach rollback/before-seo-foundation-2026-11-21
npm ci
npm run build
```

Generated files can be reproduced with `npm run build`; no manual generated-file edits are required. Returning to the implementation branch afterwards:

```bash
git switch fix/seo-foundation
```

## Rollback verification

- Repository status is clean on the intended ref.
- Production build succeeds.
- The homepage, shop, product navigation, and cart entry points load.
- The previous deployment's expected routing and SEO files are restored.
