// Build-time PDS reader for the admin dashboard's public collections. This
// generalises the private listRecords helper in src/lib/now.ts into a reusable,
// unauthenticated reader: Astro pages call it in frontmatter so the first paint
// already carries live data from the PDS. Reads only — nothing here writes to a
// repo.
//
// The repo defaults to the joeinn.es handle; every collection lives on the same
// repo, so callers usually pass just the collection NSID.

const HANDLE = "joeinn.es";
const PDS = "https://bsky.social";

/** NSIDs of the collections this module maps to view models. */
export const SHIPPED_COLLECTION = "es.joeinn.shipped";
export const SHIPPED_DIGEST_COLLECTION = "es.joeinn.shippedDigest";

/** A single record envelope as returned by com.atproto.repo.listRecords. */
export interface PdsRecord {
  uri: string;
  cid?: string;
  value: any;
}

/** One page of listRecords output. */
export interface ListRecordsResult {
  records: PdsRecord[];
  cursor?: string;
}

export interface ListRecordsOptions {
  limit?: number;
  cursor?: string;
  repo?: string;
}

/**
 * Fetch a single page of records from a public PDS. Unauthenticated — this only
 * ever hits the read-only listRecords endpoint. Throws on a non-2xx response so
 * callers can wrap it in safe().
 */
export async function listRecords(
  collection: string,
  opts: ListRecordsOptions = {},
): Promise<ListRecordsResult> {
  const { limit, cursor, repo = HANDLE } = opts;
  const params = new URLSearchParams({ repo, collection });
  if (limit != null) params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`${PDS}/xrpc/com.atproto.repo.listRecords?${params}`);
  if (!res.ok) throw new Error(`listRecords ${collection} ${res.status}`);
  const data = await res.json();
  return { records: data.records ?? [], cursor: data.cursor ?? undefined };
}

/**
 * Follow the cursor until the collection is exhausted, returning every record.
 * A page cap guards against a misbehaving server that keeps handing back the
 * same cursor forever.
 */
export async function fetchAllRecords(
  collection: string,
  repo: string = HANDLE,
): Promise<PdsRecord[]> {
  const all: PdsRecord[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 100; page++) {
    const res = await listRecords(collection, { limit: 100, cursor, repo });
    all.push(...res.records);
    cursor = res.cursor;
    if (!cursor) break;
  }
  return all;
}

/**
 * Run a promise, falling back to a default value on any rejection. Mirrors the
 * helper inlined in src/pages/now/index.astro so a build-time read never fails
 * a whole page — the caller just gets the fallback.
 */
export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

// ---- View models -------------------------------------------------------

/** A shipped contribution, shaped for the /i-shipped listing. */
export interface ShippedView {
  summary: string;
  repo: string;
  prNumber: string;
  url: string;
  description: string | null;
  mergedAt: Date;
}

/** A periodic digest of shipped work, shaped for the /i-shipped listing. */
export interface ShippedDigestView {
  title: string | null;
  startDate: Date;
  endDate: Date;
  summary: string;
}

/**
 * Map an es.joeinn.shipped record to its view model. `description` is optional
 * on the record (omitted when the source body was empty), so it becomes null
 * when absent. Datetime strings are parsed into Date objects for the page.
 */
export function mapShipped(r: PdsRecord): ShippedView {
  const v = r.value;
  return {
    summary: v.summary,
    repo: v.repo,
    prNumber: v.prNumber,
    url: v.url,
    description: typeof v.description === "string" ? v.description : null,
    mergedAt: new Date(v.mergedAt),
  };
}

/**
 * Map an es.joeinn.shippedDigest record to its view model. `title` is optional
 * on the record, so it becomes null when absent. The period bounds are parsed
 * into Date objects for the page.
 */
export function mapShippedDigest(r: PdsRecord): ShippedDigestView {
  const v = r.value;
  return {
    title: typeof v.title === "string" ? v.title : null,
    startDate: new Date(v.startDate),
    endDate: new Date(v.endDate),
    summary: v.summary,
  };
}

// ---- Convenience fetchers ---------------------------------------------

/** Fetch every shipped contribution as a view model. */
export async function fetchShipped(): Promise<ShippedView[]> {
  return (await fetchAllRecords(SHIPPED_COLLECTION)).map(mapShipped);
}

/** Fetch every shipped digest as a view model. */
export async function fetchShippedDigests(): Promise<ShippedDigestView[]> {
  return (await fetchAllRecords(SHIPPED_DIGEST_COLLECTION)).map(mapShippedDigest);
}

export const SMIDGEON_COLLECTION = "es.joeinn.smidgeon";

/** A smidgeon (short-form note), shaped for the /smidgeons feed. */
export interface SmidgeonView {
  summary: string;
  body: string;
  created: Date;
}

/**
 * Map an es.joeinn.smidgeon record to its view model. `richBody` is optional on
 * the record (summary-only smidgeons omit it), so `body` becomes "" when absent.
 */
export function mapSmidgeon(r: PdsRecord): SmidgeonView {
  const v = r.value;
  return {
    summary: v.summary,
    body: typeof v.richBody === "string" ? v.richBody : "",
    created: new Date(v.createdAt),
  };
}

/** Fetch every smidgeon as a view model. */
export async function fetchSmidgeons(): Promise<SmidgeonView[]> {
  return (await fetchAllRecords(SMIDGEON_COLLECTION)).map(mapSmidgeon);
}

export const NOW_COLLECTION = "es.joeinn.now";

/** A /now page snapshot. The site renders the most recent one. */
export interface NowView {
  content: string;
  createdAt: Date;
}

export function mapNow(r: PdsRecord): NowView {
  const v = r.value;
  return {
    content: typeof v.content === "string" ? v.content : "",
    createdAt: new Date(v.createdAt),
  };
}

/** The most recent /now snapshot, or null when there are none. */
export async function fetchNow(): Promise<NowView | null> {
  const views = (await fetchAllRecords(NOW_COLLECTION)).map(mapNow);
  if (views.length === 0) return null;
  return views.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
}

export const BLOG_COLLECTION = "es.joeinn.blog.post";

/** The record key (the post slug, for blog posts) from an at:// uri. */
export function rkeyFromUri(uri: string): string {
  return uri.split("/").pop() ?? uri;
}

function didFromUri(uri: string): string | null {
  return /^at:\/\/(did:[^/]+)\//.exec(uri)?.[1] ?? null;
}

/** A blob (e.g. a featured image) resolved to its public getBlob URL. */
function blobUrl(did: string | null, blob: any): string | undefined {
  const cid = blob?.ref?.$link;
  if (!did || !cid) return undefined;
  return `${PDS}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${encodeURIComponent(cid)}`;
}

/** A blog post shaped for the /blog listing and post pages. `body` is the rich
 *  Markdown + ::island body; render it with renderPostBody / PostBody.astro. */
export interface BlogPostView {
  slug: string;
  title: string;
  date: Date;
  dateUpdated?: Date;
  excerpt?: string;
  pageBg?: string;
  featuredImage?: string;
  body: string;
}

export function mapBlogPost(r: PdsRecord): BlogPostView {
  const v = r.value;
  return {
    slug: rkeyFromUri(r.uri),
    title: v.title,
    date: new Date(v.createdAt),
    dateUpdated: v.updatedAt ? new Date(v.updatedAt) : undefined,
    excerpt: typeof v.excerpt === "string" ? v.excerpt : undefined,
    pageBg: typeof v.pageBg === "string" ? v.pageBg : undefined,
    featuredImage: blobUrl(didFromUri(r.uri), v.featuredImage),
    body: typeof v.richBody === "string" ? v.richBody : "",
  };
}

/** Fetch one record by rkey, or null when it doesn't exist (404). */
export async function getRecord(
  collection: string,
  rkey: string,
  repo: string = HANDLE,
): Promise<PdsRecord | null> {
  const params = new URLSearchParams({ repo, collection, rkey });
  const res = await fetch(`${PDS}/xrpc/com.atproto.repo.getRecord?${params}`);
  if (!res.ok) return null;
  return (await res.json()) as PdsRecord;
}

/** A single blog post by slug (= rkey), or null when not migrated to a record. */
export async function fetchBlogPost(slug: string): Promise<BlogPostView | null> {
  const rec = await getRecord(BLOG_COLLECTION, slug);
  return rec ? mapBlogPost(rec) : null;
}

/** Every blog post as a view model. */
export async function fetchBlogPosts(): Promise<BlogPostView[]> {
  return (await fetchAllRecords(BLOG_COLLECTION)).map(mapBlogPost);
}
