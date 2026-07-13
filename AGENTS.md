# Agent guidance

This is the canonical guidance for coding agents working in this repository. Keep changes scoped to the task, preserve unrelated working-tree changes, and follow the repository's existing conventions.

## Project overview

`joeinn.es` is Joe Innes's personal website and blog. It is an Astro 5 site with MDX content, Keystatic CMS, React and Svelte islands, and a Vercel adapter. It includes long-form blog posts, short-form smidgeons, an open-source contributions log, shipped-work digests, a CV, a contact form, and a `/now` page. The site also reads and publishes selected content through AT Protocol records.

Important top-level files and directories include:

- `src/pages/` — Astro routes and route handlers.
- `src/components/` — Astro, Svelte, and React/Keystatic components.
- `src/layouts/` — `Default.astro` for the current custom CSS layout and `Layout.astro` for the older Tailwind-based layout.
- `src/content/` — MDX, YAML, and content-collection data.
- `src/content/config.ts` — Astro content schemas.
- `keystatic.config.tsx` — Keystatic collections and singleton configuration, using the GitHub storage backend.
- `src/lib/` — shared application and ATProto/PDS helpers.
- `scripts/standard-site/` — publishing and sync scripts for standard.site and owned ATProto records.
- `lexicons/` — local definitions for the `es.joeinn.*` ATProto records.
- `public/` — static assets, including images and site icons.
- `astro.config.mjs` — Astro integrations, sitemap filtering, remote image configuration, and the Vercel adapter.
- `src/styles.css` — current custom CSS; `src/styles/global.css` — legacy Tailwind CSS used by the older layout.

## Package manager and commands

Use pnpm for this repository. `pnpm-lock.yaml` is tracked and is the lockfile to update when dependencies change. Do not add or regenerate `package-lock.json`.

```bash
pnpm install
pnpm run dev       # Start Astro at http://localhost:4321
pnpm run build     # Build the production site
pnpm run preview   # Preview the production build locally
pnpm test          # Run the Vitest suite once
pnpm test -- path/to/test.ts  # Run a focused Vitest test file when useful
```

The Keystatic admin UI is available at `/keystatic` while the development server is running. The standard-site sync is dry-run safe without credentials:

```bash
pnpm run standard-site:sync -- --dry-run
```

Set `ATPROTO_APP_PASSWORD` only when a live sync is intended. A live sync can update ATProto records and the standard-site manifest, so inspect its plan first.

## Routes

The main routes are:

- `/` — landing page and recent shipped work.
- `/blog` and `/blog/[slug]` — searchable blog listing and individual posts.
- `/smidgeons/[...page]` — paginated short-form notes.
- `/i-shipped/[...page]` — paginated merged open-source contributions, grouped by merge date.
- `/cv` — CV content with a print/save-as-PDF control.
- `/contact` — Formspree contact form.
- `/now` — current-status content and recent listening information.
- `/privacy` — privacy page.

Other generated or supporting routes include `/rss.xml`, `/404`, `/admin`, `/admin/post-preview`, `/client-metadata.json`, and `/.well-known/site.standard.publication`. The sitemap excludes `/admin`.

The `/i-shipped` page prefers `es.joeinn.shipped` records from the PDS and falls back to local MDX entries when the PDS is unavailable or empty. Shipped digests use the same PDS-then-local pattern, but are currently hidden from the page behind a feature flag.

## Content model

Astro schemas live in `src/content/config.ts`; Keystatic editing fields live in `keystatic.config.tsx`.

### Collections

- `posts` in `src/content/posts/` — MDX blog posts with `title`, `date`, optional `date_updated`, `draft`, `excerpt`, `featured_image`, `page_bg`, and `bskyPostUri` for optional Bluesky comments.
- `smidgeons` in `src/content/smidgeons/` — MDX short-form notes with `summary` and `created`.
- `i-shipped` entries in `src/content/i-shipped/` — MDX contribution records with `summary`, `repo`, `mergeDate`, and `prNumber`.
- `shipped-digests` in `src/content/shipped-digests/` — hand-authored digest records with optional `title`, `start`, `end`, and `created`; their body is the digest summary.

### Keystatic singletons

- `now` at `src/content/now/` — the `/now` page MDX and date field.
- `cv` at `src/content/cv/` — the CV MDX content.

When adding or changing content, keep frontmatter compatible with the Astro schema and Keystatic field definitions. Dates use `YYYY-MM-DD` in frontmatter and are displayed with the `en-GB` locale.

## Rules for `i-shipped` entries

An entry represents a merged pull request by Joe Innes in a public GitHub repository. Before adding one:

1. Verify that the repository is public, the pull request is merged, and the canonical repository is in `owner/repository` form.
2. Identify an entry by the pair `(repo, PR number)`, not by its filename, summary, or title. Check every existing `src/content/i-shipped/*.mdx` entry for that pair before creating a new file; the same PR number in a different repository is a different entry.
3. Preserve all existing entries unchanged. Do not rewrite, rename, delete, or “clean up” an existing entry while adding another.
4. Create one `src/content/i-shipped/<slug>.mdx` file with this shape:

   ```mdx
   ---
   summary: a natural description that completes “I shipped...”
   repo: owner/repository
   mergeDate: YYYY-MM-DD
   prNumber: '1234'
   ---
   A 1–4 sentence first-person explanation of the problem and the fix, written in clear ELI5-style language.
   ```

Use the merged date, keep `prNumber` as a quoted string, and write a conversational description rather than copying a PR title verbatim. The local MDX is the authoring source; `standard-site:sync` mirrors it to `es.joeinn.shipped`.

## Coding conventions and workflow

- Use TypeScript strict mode and the existing Astro, Svelte 5, React, and MDX patterns.
- Keep Astro component styles scoped in the component unless a global style is intentional.
- Use Svelte 5 runes in Svelte components and the existing React JSX configuration for Keystatic code.
- Prefer the current `Default.astro`/`src/styles.css` layout and styling system for new pages and components. Touch the legacy layout only when the task concerns it.
- Keep public-facing content and route behaviour consistent with the relevant schema, page, and component. Check both the local content fallback and PDS-backed path when changing shipped content or ATProto helpers.
- Before editing, inspect `git status --short`; do not reset, discard, or overwrite unrelated user changes.
- After editing, review the complete diff, run focused tests where applicable, run `pnpm run build` for site/config changes, and run `git diff --check` before handoff.
- Do not create branches, commits, or pull requests unless the task explicitly requests them. When a task does request a commit, follow its specified branch and commit-message instructions exactly.
