// One-off backfill: publish each blog post as an es.joeinn.blog.post record
// (the rich, island-aware source of truth). The portable site.standard.document
// half is already handled by the standard-site sync (postsSource); this adds the
// owned-lexicon half.
//
//   node --env-file-if-exists=.env scripts/backfill-blog-posts.mjs --dry-run
//   node --env-file-if-exists=.env scripts/backfill-blog-posts.mjs
//
// rkey = the post slug, so /blog/<slug> URLs stay byte-identical and re-runs
// upsert (never duplicate). Drafts, future-dated posts, and any post whose body
// still contains un-migratable JSX (unknown or paired components) are skipped —
// those keep rendering from MDX via the page's fallback until hand-migrated.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { AtpAgent } from "@atproto/api";
import { convertMdxToIslands, unmigratableReasons } from "../src/lib/mdxToIslands.ts";

const HANDLE = "joeinn.es";
const SERVICE = "https://bsky.social";
const COLLECTION = "es.joeinn.blog.post";
const DIR = "src/content/posts";
const PUBLIC_DIR = "public";

const dry = process.argv.includes("--dry-run");
const password = process.env.ATPROTO_APP_PASSWORD;
const now = new Date();

const slugOf = (f) => f.replace(/\.mdx?$/, "");

const posts = readdirSync(DIR)
  .filter((f) => /\.mdx?$/.test(f))
  .map((file) => {
    const { data, content } = matter(readFileSync(join(DIR, file), "utf8"));
    return { slug: slugOf(file), data, body: content };
  });

const publishable = posts.filter(
  (p) => !p.data.draft && p.data.date && new Date(p.data.date) <= now && p.data.title,
);

// A post is ready only if its body converts to pure Markdown + ::island (no
// leftover JSX or TODO markers the renderer can't handle).
const ready = [];
const skipped = [];
for (const p of publishable) {
  const richBody = convertMdxToIslands(p.body);
  const reasons = unmigratableReasons(richBody);
  if (reasons.length) skipped.push(`${p.slug} (${reasons.join(", ")})`);
  else ready.push({ ...p, richBody });
}

console.log(
  `posts ${posts.length} · publishable ${publishable.length} · ready ${ready.length} · ` +
    `skipped (hand-migrate) ${skipped.length}`,
);
if (skipped.length) console.log("  skipped:", skipped.join(", "));

// Featured image bytes, from a local /public path or a remote URL.
async function imageBytes(ref) {
  try {
    if (/^https?:\/\//.test(ref)) {
      const res = await fetch(ref);
      if (!res.ok) return null;
      return { bytes: Buffer.from(await res.arrayBuffer()), mime: res.headers.get("content-type") || "image/jpeg" };
    }
    const path = join(PUBLIC_DIR, ref.replace(/^\//, ""));
    if (!existsSync(path)) return null;
    const ext = (ref.split(".").pop() || "").toLowerCase();
    const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "gif" ? "image/gif" : "image/jpeg";
    return { bytes: readFileSync(path), mime };
  } catch {
    return null;
  }
}

function baseRecord(p, featuredImage) {
  return {
    $type: COLLECTION,
    title: p.data.title,
    createdAt: new Date(p.data.date).toISOString(),
    richBody: p.richBody,
    ...(p.data.date_updated ? { updatedAt: new Date(p.data.date_updated).toISOString() } : {}),
    ...(p.data.excerpt ? { excerpt: p.data.excerpt } : {}),
    ...(p.data.page_bg ? { pageBg: p.data.page_bg } : {}),
    ...(featuredImage ? { featuredImage } : {}),
  };
}

if (dry) {
  const withImg = ready.filter((p) => p.data.featured_image).length;
  console.log(`\nDRY RUN — would upsert ${ready.length} records (${withImg} with a featured image). No writes.`);
  const sample = ready.find((p) => /::island/.test(p.richBody));
  if (sample) {
    console.log(`\nsample converted post "${sample.slug}":`);
    console.log(sample.richBody.slice(0, 400));
  }
  process.exit(0);
}

if (!password) {
  console.error("No ATPROTO_APP_PASSWORD set — aborting (nothing written).");
  process.exit(1);
}

const agent = new AtpAgent({ service: SERVICE });
await agent.login({ identifier: HANDLE, password });
const did = agent.session?.did;
console.log(`logged in as ${did}`);

let ok = 0;
let imgUp = 0;
let imgFail = 0;
const failures = [];
for (const p of ready) {
  try {
    let featuredImage;
    if (p.data.featured_image) {
      const img = await imageBytes(p.data.featured_image);
      if (img) {
        const up = await agent.uploadBlob(img.bytes, { encoding: img.mime });
        featuredImage = up.data.blob;
        imgUp += 1;
      } else {
        imgFail += 1;
      }
    }
    await agent.com.atproto.repo.putRecord({
      repo: did,
      collection: COLLECTION,
      rkey: p.slug,
      record: baseRecord(p, featuredImage),
    });
    ok += 1;
    if (ok % 20 === 0) console.log(`  … ${ok}/${ready.length}`);
  } catch (err) {
    failures.push(`${p.slug}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

console.log(`\nupserted ${ok}/${ready.length} · images ${imgUp} ok, ${imgFail} unresolved`);
if (failures.length) {
  console.log(`\n${failures.length} failed:`);
  for (const f of failures) console.log("  ✗", f);
}
