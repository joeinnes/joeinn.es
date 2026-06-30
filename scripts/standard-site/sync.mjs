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
import { createRecordClient } from "./atproto.mjs";
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
// Carry the target collection so the right backend handles the delete.
const sourceByCollection = new Map(SOURCES.map((s) => [s.collection, s]));
for (const [key, record] of Object.entries(manifest.documents)) {
  const src = sourceByCollection.get(key.split(":")[0]);
  if (src && !desired.has(key)) {
    actions.delete.push({ key, rkey: rkeyOf(record.docUri), target: src.target });
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

const ctx = { siteUrl: config.siteUrl, transform: transformContent };

// standard.site documents and owned-lexicon records use different backends. Log
// in to each lazily so a run that only touches one record type makes one login.
const isStandardDoc = (target) => target === "site.standard.document";

let _stdPublisher = null;
async function standardPublisher() {
  if (!_stdPublisher) {
    _stdPublisher = new StandardSitePublisher({ identifier: config.handle, password });
    await _stdPublisher.login();
    console.log(`standard.site: logged in as ${_stdPublisher.getDid()} via ${_stdPublisher.getPdsUrl()}`);
  }
  return _stdPublisher;
}

let _recordClient = null;
async function recordClient() {
  if (!_recordClient) {
    _recordClient = await createRecordClient({ identifier: config.handle, password });
    console.log(`atproto: logged in as ${_recordClient.did} via ${_recordClient.getPdsUrl()}`);
  }
  return _recordClient;
}

async function applyCreate({ source, entry }) {
  if (isStandardDoc(source.target)) {
    const pub = await standardPublisher();
    return pub.publishDocument({ site: config.siteUrl, ...source.toInput(entry, ctx) });
  }
  const client = await recordClient();
  return client.create(source.target, { $type: source.target, ...source.toRecord(entry, ctx) });
}

async function applyUpdate({ source, entry, rkey }) {
  if (isStandardDoc(source.target)) {
    const pub = await standardPublisher();
    return pub.updateDocument(rkey, { site: config.siteUrl, ...source.toInput(entry, ctx) });
  }
  const client = await recordClient();
  return client.put(source.target, rkey, { $type: source.target, ...source.toRecord(entry, ctx) });
}

async function applyDelete({ target, rkey }) {
  if (isStandardDoc(target)) {
    const pub = await standardPublisher();
    return pub.deleteDocument(rkey);
  }
  const client = await recordClient();
  return client.del(target, rkey);
}

// Persist after every operation so a mid-run failure (network blip, rate limit)
// never leaves published records unrecorded — a re-run resumes from here rather
// than duplicating. The CI commit step runs with if: always() for the same reason.
const persist = () =>
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

try {
  for (const a of actions.create) {
    const res = await applyCreate(a);
    manifest.documents[a.key] = { docUri: res.uri, docCid: res.cid, contentHash: a.hash };
    persist();
    console.log(`created ${a.key} → ${res.uri}`);
  }
  for (const a of actions.update) {
    const res = await applyUpdate(a);
    manifest.documents[a.key] = { docUri: res.uri, docCid: res.cid, contentHash: a.hash };
    persist();
    console.log(`updated ${a.key} → ${res.uri}`);
  }
  for (const a of actions.delete) {
    await applyDelete(a);
    delete manifest.documents[a.key];
    persist();
    console.log(`deleted ${a.key}`);
  }
} finally {
  persist();
}

console.log(`\nWrote ${MANIFEST_PATH}.`);
