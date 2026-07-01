// Lexicon docs shipped with the dashboard. These are the custom es.joeinn.*
// records that back the site's own collections, so schema-driven forms light up
// out of the box for every user — no manual paste into localStorage needed.
//
// Third-party lexicons (app.bsky.*, ...) are deliberately NOT bundled: their
// records reference other lexicons (strongRef, selfLabels, ...) that would also
// need bundling, and partial copies would break validation. Register those in
// the UI instead (persisted to localStorage).
//
// Each doc is a LexiconDoc-shaped object with a string `id` (the NSID). The
// registry (registry.ts) consumes this array via buildLexicons([...bundledDocs,
// ...customDocs]); docs without a string `id` are skipped rather than throwing.
import blogPost from "../../../../lexicons/es/joeinn/blog/post.json";
import now from "../../../../lexicons/es/joeinn/now.json";
import shipped from "../../../../lexicons/es/joeinn/shipped.json";
import shippedDigest from "../../../../lexicons/es/joeinn/shippedDigest.json";
import smidgeon from "../../../../lexicons/es/joeinn/smidgeon.json";

export const bundledDocs: unknown[] = [
  blogPost,
  smidgeon,
  now,
  shipped,
  shippedDigest,
];
