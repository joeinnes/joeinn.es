// Shared PDS fetch + mapping for the /now page widgets, usable both at build
// time (Astro frontmatter, for instant first paint) and in the browser (the
// Svelte islands refresh from the same source on mount).
//
// ponytail: the small pure helpers are duplicated in the widgets' own client
// code; kept separate here rather than refactoring three working interactive
// components. Fold them together when the widgets next get touched.

const HANDLE = "joeinn.es";
const PDS = "https://bsky.social";
const PLAY_COLLECTION = "fm.teal.alpha.feed.play";
const BOOK_COLLECTION = "buzz.bookhive.book";
const READING = "buzz.bookhive.defs#reading";
const COVER_ART_BASE = "https://coverartarchive.org/release";

const MBID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface TrackView {
  name: string;
  artist: string;
  cover: string | null;
}
export interface BookView {
  title: string;
  author: string;
  cover: string | null;
}
interface Record {
  uri: string;
  value: any;
}

/** teal.fm stores MBIDs prefixed ("mbid:…"); Cover Art Archive wants the bare UUID. */
export function trackCover(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.replace(/^mbid:/i, "").trim();
  return MBID_RE.test(id) ? `${COVER_ART_BASE}/${id}/front-250` : null;
}

export function artistNames(t: any): string {
  if (t?.artists?.length) return t.artists.map((a: any) => a.artistName).join(", ");
  if (t?.artistNames?.length) return t.artistNames.join(", ");
  return "";
}

export function didFromUri(uri: unknown): string | null {
  const m = /^at:\/\/(did:[^/]+)\//.exec(typeof uri === "string" ? uri : "");
  return m ? m[1] : null;
}

/** A blob (e.g. a book cover) resolved via getBlob on the PDS. */
export function blobUrl(did: string | null, cover: any): string | null {
  const cid = cover?.ref?.$link;
  if (!did || !cid) return null;
  return `${PDS}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${encodeURIComponent(cid)}`;
}

/** bookhive stores authors as a single tab-separated string. */
export function authorList(a: unknown): string {
  return typeof a === "string" ? a.split("\t").filter(Boolean).join(", ") : "";
}

export function isReading(r: any): boolean {
  return r?.value?.status === READING;
}

export function mapTrack(r: Record): TrackView {
  return {
    name: r.value.trackName,
    artist: artistNames(r.value),
    cover: trackCover(r.value.releaseMbId),
  };
}

export function mapBook(r: Record): BookView {
  return {
    title: r.value.title ?? "Untitled",
    author: authorList(r.value.authors),
    cover: blobUrl(didFromUri(r.uri), r.value.cover),
  };
}

async function listRecords(collection: string, limit: number): Promise<Record[]> {
  const params = new URLSearchParams({ repo: HANDLE, collection, limit: String(limit) });
  const res = await fetch(`${PDS}/xrpc/com.atproto.repo.listRecords?${params}`);
  if (!res.ok) throw new Error(`listRecords ${collection} ${res.status}`);
  return (await res.json()).records ?? [];
}

export async function fetchLatestTrack(): Promise<TrackView | null> {
  const r = (await listRecords(PLAY_COLLECTION, 1))[0];
  return r ? mapTrack(r) : null;
}

export async function fetchReadingBooks(): Promise<BookView[]> {
  return (await listRecords(BOOK_COLLECTION, 100)).filter(isReading).map(mapBook);
}

/** Raw play records (value + rkey) so the widget's existing render code can use them. */
export async function fetchRecentTracks(limit = 3): Promise<any[]> {
  return (await listRecords(PLAY_COLLECTION, limit)).map((r) => ({
    ...r.value,
    _rkey: r.uri.split("/").pop(),
  }));
}
