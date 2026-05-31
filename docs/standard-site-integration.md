# standard.site ATProto integration — design

Status: draft for review. Nothing here is built yet.

## Goal

Federate joeinn.es into the AT Protocol "Atmosphere" using the
[standard.site](https://standard.site) lexicons, so that:

1. Blog posts are published as `site.standard.document` records and become
   discoverable/indexable by readers such as docs.surf, Pckt and Leaflet,
   without a central gatekeeper.
2. Replies to a Bluesky announcement post render as a federated comment thread
   under each blog post.
3. Posts you author elsewhere on the network (Leaflet, WhiteWind) can be pulled
   back into the site.

We start with the `posts` collection only, but the publishing layer is built as
a registry of "publishable sources" so `smidgeons` and `iShipped` can be added
later by registering one adapter each (see [Extensibility](#extensibility)).

## Decisions locked in

| Decision | Choice |
|----------|--------|
| Capabilities | Publish + federated comments + pull-in loader |
| Implementation | [`@bryanguffey/astro-standard-site`](https://www.npmjs.com/package/@bryanguffey/astro-standard-site) (v1.0.4) |
| Publish trigger | GitHub Action on merge to `main` |
| Collections (phase 1) | Blog `posts` only, extensible to smidgeons + i-shipped |
| MDX components | Replace unrenderable blocks with a "view on my blog" notice + canonical link |
| Announcements | None automated — you post to Bluesky manually |
| First run | Backfill all existing posts |
| Comments | Opt-in per post via a `bskyPostUri` frontmatter field |

## Your identity (already on the network)

You already read ATProto directly in `NowPlaying.svelte`, so this slots into
existing patterns.

- Handle: `joeinn.es`
- DID: `did:plc:me4kozmcrc74z2wgkvqvkbfd`
- PDS entryway: `https://bsky.social`

The publisher authenticates with a Bluesky [app password](https://bsky.app/settings/app-passwords)
(never your main password).

## How standard.site works (the bits that constrain the design)

Two record types live in your PDS:

- `site.standard.publication` — one record describing the blog (name, url,
  description, optional theme colours). Created once.
- `site.standard.document` — one record per post (title, `path`, `publishedAt`,
  `description`, `content` as an open union, `textContent` for search indexing,
  `tags`).

Documents do not store their own canonical URL — a reader resolves it by joining
the document `path` to the `url` on the referenced publication record.

Verification is a two-way handshake an indexer checks:

1. Your site serves `/.well-known/site.standard.publication` returning the
   AT-URI of your publication record. (site → record)
2. Each post's HTML carries a `<link>` tag pointing back to that post's
   `site.standard.document` AT-URI. (record → post)

There is a deliberate race condition: you create the record first (to obtain the
AT-URI), then deploy the site with the matching `<link>` tag. Indexers expect a
gap and re-verify on a schedule, so we do not need to solve it synchronously —
but our publish-then-deploy ordering must respect it.

### Longform vs microblog — answering the smidgeons question

standard.site is explicitly longform-only. The microblog primitive on ATProto is
`app.bsky.feed.post`; the two interlock — a Bluesky post that links a
`site.standard.document` gets an enhanced preview in the Bluesky app. So:

- `posts` → `site.standard.document` (longform). Phase 1.
- `smidgeons` → `app.bsky.feed.post` (a real Bluesky post). There is no
  "microblog via standard.site" prior art because that is not what the schema is
  for. Smidgeons should become Bluesky posts and cross-link, not documents.
- `iShipped` → either a small `site.standard.document` or a Bluesky post. Lowest
  priority; decide when we get there.

This also unifies with comments: the announcement Bluesky post we create for each
longform document is itself the `app.bsky.feed.post`, and its replies are the
comment thread.

## Architecture

```
Keystatic edit / PR ──merge──▶ main
                                 │
                                 ▼
              .github/workflows/standard-site.yml
                                 │
            ┌────────────────────┴─────────────────────┐
            │  scripts/standard-site/sync.ts            │
            │  1. read src/content/posts/*.mdx          │
            │  2. diff each post vs manifest (hash)     │
            │  3. new/changed → publishDocument()       │
            │     (backfills everything on first run)   │
            │  4. write standard-site.manifest.json     │
            │     (slug → {docUri, docCid, hash})       │
            └────────────────────┬─────────────────────┘
                                 │ commits manifest back
                                 ▼
                         records live in PDS
                                 │
        Vercel build reads manifest ──▶ injects per-post:
            • <link> tag → docUri              (verification)
            • <Comments/> when frontmatter     (opt-in replies)
              bskyPostUri is set
                                 │
                                 ▼
          /.well-known/site.standard.publication  (verification)

You share posts to Bluesky manually; doing so produces the enhanced preview on its
own, because the page already carries the <link> tag. There is no automated posting.
```

Publishing (writes to your PDS) happens in CI. Verification surface (`.well-known`
+ `<link>` tags + comments) is plain build-time output driven by the committed
manifest, so the site stays a normal Astro build with no secrets at build time.

## Component 1 — publication record + `.well-known`

One-time setup script (`scripts/standard-site/create-publication.ts`) calls
`publishPublication({ name, url, description, basicTheme })` and prints the AT-URI.
We record the publication rkey (the last path segment) in repo config.

The well-known endpoint is an Astro route so the content-type is correct:

```ts
// src/pages/.well-known/site.standard.publication.ts
import type { APIRoute } from "astro";
import { generatePublicationWellKnown } from "@bryanguffey/astro-standard-site";

export const GET: APIRoute = () =>
  new Response(
    generatePublicationWellKnown({
      did: "did:plc:me4kozmcrc74z2wgkvqvkbfd",
      publicationRkey: "<rkey-from-create-publication>",
    }),
    { headers: { "Content-Type": "text/plain" } },
  );
```

(Works with the Vercel adapter. A static `public/.well-known/...` file is the
alternative but risks the wrong content-type.)

## Component 2 — publishing pipeline (GitHub Action)

`scripts/standard-site/sync.ts` is the heart of it. Design points:

- Reads post sources directly with `gray-matter` (no full Astro build needed in
  CI). Slug = filename; `path` = `/blog/<slug>`; `site` = `https://joeinn.es`.
- Transforms the MDX body via the package's `transformContent(body, { baseUrl })`
  to produce `content.text` (markdown) and `textContent` (plain text + word count
  / reading time). See the [MDX caveat](#mdx-caveat).
- Idempotency via a committed manifest, `standard-site.manifest.json`:

  ```jsonc
  {
    "version": 1,
    "documents": {
      "my-post-slug": {
        "docUri": "at://did:plc:.../site.standard.document/3l...",
        "docCid": "bafy...",
        "contentHash": "sha256:..."
      }
    }
  }
  ```

  - Slug absent from manifest → `publishDocument()` (create) → add entry. On the
    first run this backfills every existing post.
  - `contentHash` changed → update the existing record (see gap below).
  - Unchanged → skip.

- Ordering respects the race condition: the Action publishes records and commits
  the manifest first; the subsequent Vercel deploy then ships the `<link>` tags.
- Secrets: `ATPROTO_APP_PASSWORD` as a GitHub Actions secret; DID and publication
  rkey as repo-level config (non-secret).

Update semantics (confirmed): the publisher exposes `updateDocument(rkey, input)`
(via `putRecord`) and `deleteDocument(rkey)` (via `deleteRecord`), plus
`listDocuments()`. So changed posts update in place using the stored rkey, and
unpublishing is a delete — no recreate-on-change workaround needed.

## Component 3 — federated comments (opt-in, manual)

No automated posting. When you want comments on a post, you share it on Bluesky
yourself, copy that post's AT-URI, and paste it into the post's frontmatter. The
component renders only when the field is present, so comments are opt-in per post
and the publishing pipeline is not involved at all.

Add the field to the `posts` schema:

```ts
// src/content/config.ts — posts schema
bskyPostUri: z.string().optional(),
```

Then in `src/pages/blog/[slug].astro`:

```astro
---
import Comments from "@bryanguffey/astro-standard-site/components/Comments.astro";
---
{post.data.bskyPostUri && (
  <Comments bskyPostUri={post.data.bskyPostUri} canonicalUrl={Astro.url.href} maxDepth={3} />
)}
```

No auth, no client secrets — it reads public replies. The manifest is not
involved. Styling hooks into existing CSS custom properties (the component exposes
`--color-*` / `--space-*` variables we can map to `styles.css`).

Because the page already carries the standard.site `<link>` tag, manually sharing
the canonical URL on Bluesky gives you the enhanced preview too — so one manual
post yields both the rich preview and the comment thread, with no automation.

## Component 4 — pull-in loader (posts written elsewhere)

A new content collection backed by the package's content-layer loader, excluding
anything originating from this site so we never double-list our own posts:

```ts
// src/content/config.ts
import { standardSiteLoader } from "@bryanguffey/astro-standard-site";

const federated = defineCollection({
  loader: standardSiteLoader({
    repo: "joeinn.es",
    excludeSite: "https://joeinn.es",
  }),
});
export const collections = { posts, smidgeons, iShipped, federated };
```

Rendered on a small page (e.g. `/elsewhere` or folded into `/blog`) linking out to
the canonical platform. Phase 3 — lowest priority.

## Extensibility

The sync engine iterates a registry of adapters rather than hard-coding `posts`:

```ts
interface PublishableSource {
  collection: string;                       // "posts" | "smidgeons" | "iShipped"
  target: "site.standard.document" | "app.bsky.feed.post";
  glob: string;                             // e.g. "src/content/posts/*.mdx"
  shouldPublish(entry): boolean;            // skip drafts etc.
  pathFor(entry): string;                   // canonical path on the site
  toRecord(entry): Record<string, unknown>; // map frontmatter+body → lexicon
}
```

Phase 1 registers only the `posts` adapter (→ document). Adding smidgeons later is
"register one adapter targeting `app.bsky.feed.post`"; i-shipped likewise. The
manifest keys by `collection:slug` so the three never collide.

## File-by-file change list

New:
- `scripts/standard-site/create-publication.mjs` — one-time publication record (done)
- `scripts/standard-site/sync.mjs` — the sync engine + `posts` adapter
- `scripts/standard-site/sources.mjs` — the `PublishableSource` registry
- `src/pages/.well-known/site.standard.publication.ts` — verification endpoint
- `.github/workflows/standard-site.yml` — runs sync on merge to `main`
- `standard-site.manifest.json` — committed slug → record map

Modified:
- `src/pages/blog/[slug].astro` — add the `<link>` verification tag + opt-in `<Comments/>`
- `src/content/config.ts` — add `bskyPostUri` to the posts schema (comments); add
  the `federated` collection (phase 3)
- `package.json` — add `@bryanguffey/astro-standard-site` (deps), `gray-matter`,
  `tsx` (devDeps); add an npm script for the manual sync

Config / secrets:
- GitHub secret `ATPROTO_APP_PASSWORD`
- Non-secret config: DID + publication rkey (a small `standard-site.config.json`
  or env in the workflow)

## Risks and gotchas

<a id="mdx-caveat"></a>
- MDX content (decided). Posts are MDX and can import Svelte/React widgets, which
  external readers cannot render. The posts adapter pre-processes the body before
  `transformContent`: ESM `import`/`export` lines are stripped, and each JSX
  component block is replaced with a short notice linking to the canonical post,
  e.g. `> This post includes an interactive component — [view it on joeinn.es](<canonical-url>)`.
  Prose-only posts pass through unchanged, and the notice text flows into
  `textContent` too. The detection heuristic (JSX element + import-line matching)
  is firmed up during the spike.
- `<link>` tag exact shape (confirmed). The package's `generateDocumentLinkTag({ did, documentRkey })`
  emits `<link rel="site.standard.document" href="at://<did>/site.standard.document/<rkey>">`.
  That is the tag we inject into `[slug].astro`.
- Update semantics (confirmed). `updateDocument`/`deleteDocument` exist — see
  Component 2.
- Deletions / unpublishing. Removing a post should `deleteRecord` and prune the
  manifest. Phase 1 can defer this, but the manifest makes it tractable.
- Slug/path stability. The canonical `path` is the verification anchor; renaming a
  post slug changes its URL and breaks verification until re-published. Treat slug
  as stable once published.
- CI write-back loop. The Action commits the manifest back to `main`; guard the
  workflow against retriggering itself (path filter / `[skip ci]` / bot-author
  check).

## Suggested rollout

1. Setup (done / pending your run): the package is installed and
   `scripts/standard-site/create-publication.mjs` is written. Run it once with your
   app password to create the publication record and obtain its rkey. The earlier
   unknowns (`<link>` shape, update semantics) are already settled from the package
   source, so no investigative spike is needed.
2. Phase 1: manifest + `posts` adapter (incl. MDX component-notice rule) + backfill
   + `<link>` tag + well-known + the Action.
3. Phase 2: opt-in `<Comments/>` via the `bskyPostUri` frontmatter field.
4. Phase 3: pull-in loader; then optionally smidgeons (→ `app.bsky.feed.post`).

## Decisions resolved

These were the open questions; all now settled and folded into the design above.

1. MDX: replace unrenderable component blocks with a "view on my blog" notice +
   canonical link; prose-only posts pass through. (See the MDX item under Risks.)
2. Announcements: none automated — you post to Bluesky manually. The Action only
   publishes `site.standard.document` records.
3. First run: backfill all existing posts.
4. Comments: opt-in per post via a `bskyPostUri` frontmatter field.

## Sources

- [Indexing Standard Site — atproto.com](https://atproto.com/blog/indexing-standard-site)
- [standard.site](https://standard.site)
- [@bryanguffey/astro-standard-site — npm](https://www.npmjs.com/package/@bryanguffey/astro-standard-site)
- [astro-standard-site — GitHub](https://github.com/musicjunkieg/astro-standard-site)
- [Standard.site: the Publishing Gateway — Steve Simkins](https://stevedylan.dev/posts/standard-site-the-publishing-gateway/)
- [Integrating Standard Site into Bluesky — discussion #4978](https://github.com/bluesky-social/atproto/discussions/4978)
