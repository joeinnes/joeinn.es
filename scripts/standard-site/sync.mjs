// Sync engine: diff each publishable source against the manifest and create,
// update or delete standard.site documents accordingly. Idempotent — only
// changed posts are touched.
//
//   node scripts/standard-site/sync.mjs            # publish (needs app password)
//   node scripts/standard-site/sync.mjs --dry-run  # report the plan only
//
// Auth: set ATPROTO_APP_PASSWORD (a Bluesky app password). With no password set,
// it falls back to a dry run so it is always safe to run.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { StandardSitePublisher } from "@bryanguffey/astro-standard-site/publisher";
import { transformContent } from "@bryanguffey/astro-standard-site/content";
import { SOURCES } from "./sources.mjs";

const CONFIG_PATH = "standard-site.config.json";
const MANIFEST_PATH = "standard-site.manifest.json";

const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
manifest.documents ??= {};

const password = process.env.ATPROTO_APP_PASSWORD;
const dryRun = process.argv.includes("--dry-run") || !password;

const sha256 = (s) => "sha256:" + createHash("sha256").update(s).digest("hex");
const rkeyOf = (uri) => uri.split("/").pop();

// Desired state across all sources.
const desired = new Map(); // key -> { source, entry }
for (const source of SOURCES) {
  for (const entry of source.list()) {
    if (source.shouldPublish(entry)) desired.set(`${source.collection}:${entry.slug}`, { source, entry });
  }
}

const actions = { create: [], update: [], delete: [], skip: 0 };

for (const [key, { source, entry }] of desired) {
  const hash = sha256(source.hashInput(entry));
  const existing = manifest.documents[key];
  if (!existing) actions.create.push({ key, source, entry, hash });
  else if (existing.contentHash !== hash)
    actions.update.push({ key, source, entry, hash, rkey: rkeyOf(existing.docUri) });
  else actions.skip += 1;
}

// Deletes: managed entries that are no longer desired (post removed / unpublished).
const managed = new Set(SOURCES.map((s) => s.collection));
for (const [key, record] of Object.entries(manifest.documents)) {
  if (managed.has(key.split(":")[0]) && !desired.has(key)) {
    actions.delete.push({ key, rkey: rkeyOf(record.docUri) });
  }
}

console.log(
  `Plan: ${actions.create.length} create, ${actions.update.length} update, ` +
    `${actions.delete.length} delete, ${actions.skip} unchanged` +
    (dryRun ? "   (dry run)" : ""),
);
for (const a of actions.create) console.log(`  + ${a.key}`);
for (const a of actions.update) console.log(`  ~ ${a.key}`);
for (const a of actions.delete) console.log(`  - ${a.key}`);

if (dryRun) {
  if (!password) console.log("\nNo ATPROTO_APP_PASSWORD set — dry run only, nothing published.");
  process.exit(0);
}

if (!actions.create.length && !actions.update.length && !actions.delete.length) {
  console.log("Nothing to do.");
  process.exit(0);
}

const publisher = new StandardSitePublisher({ identifier: config.handle, password });
await publisher.login();
console.log(`Logged in as ${publisher.getDid()} via ${publisher.getPdsUrl()}`);

const ctx = { siteUrl: config.siteUrl, transform: transformContent };

// Persist after every operation so a mid-run failure (network blip, rate limit)
// never leaves published records unrecorded — a re-run resumes from here rather
// than duplicating. The CI commit step runs with if: always() for the same reason.
const persist = () =>
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

try {
  for (const a of actions.create) {
    const input = { site: config.siteUrl, ...a.source.toInput(a.entry, ctx) };
    const res = await publisher.publishDocument(input);
    manifest.documents[a.key] = { docUri: res.uri, docCid: res.cid, contentHash: a.hash };
    persist();
    console.log(`created ${a.key} → ${res.uri}`);
  }
  for (const a of actions.update) {
    const input = { site: config.siteUrl, ...a.source.toInput(a.entry, ctx) };
    const res = await publisher.updateDocument(a.rkey, input);
    manifest.documents[a.key] = { docUri: res.uri, docCid: res.cid, contentHash: a.hash };
    persist();
    console.log(`updated ${a.key} → ${res.uri}`);
  }
  for (const a of actions.delete) {
    await publisher.deleteDocument(a.rkey);
    delete manifest.documents[a.key];
    persist();
    console.log(`deleted ${a.key}`);
  }
} finally {
  persist();
}

console.log(`\nWrote ${MANIFEST_PATH}.`);
