// Shared PDS fetch + mapping for the /now page widgets, usable both at build
// time (Astro frontmatter, for instant first paint) and in the browser (the
// Svelte islands refresh from the same source on mount).

const HANDLE = "joeinn.es";
const PDS = "https://bsky.social";
const PLAY_COLLECTION = "fm.teal.feed.play";
const BOOK_COLLECTION = "buzz.bookhive.book";
const READING = "buzz.bookhive.defs#reading";
const COVER_ART_BASE = "https://coverartarchive.org/release";
const ITUNES_LOOKUP = "https://itunes.apple.com/lookup";
const ITUNES_SEARCH = "https://itunes.apple.com/search";

const MBID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface TrackView {
  name: string;
  artist: string;
  cover: string | null;
}
export interface BookProgress {
  percent?: number;
  currentPage?: number;
  totalPages?: number;
}
export interface BookView {
  title: string;
  author: string;
  cover: string | null;
  progress: BookProgress | null;
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

export function appleMusicTrackId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  try {
    const url = new URL(raw);
    if (url.hostname !== "music.apple.com") return null;
    const id = url.searchParams.get("i");
    return id && /^\d+$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

const artworkCache = new Map<string, Promise<string | null>>();

export async function appleMusicArtwork(id: string): Promise<string | null> {
  let artwork = artworkCache.get(id);
  if (!artwork) {
    const params = new URLSearchParams({ id, entity: "song", limit: "1" });
    const lookup =
      typeof window === "undefined"
        ? `${ITUNES_LOOKUP}?${params}`
        : `/api/track-artwork?id=${encodeURIComponent(id)}`;
    artwork = fetch(lookup)
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        const url = typeof window === "undefined" ? data.results?.[0]?.artworkUrl100 : data.cover;
        return typeof url === "string"
          ? url.replace(/\/100x100bb\.(\w+)$/i, "/250x250bb.$1")
          : null;
      })
      .catch(() => null);
    artworkCache.set(id, artwork);
  }

  return artwork;
}

export async function appleMusicSearchArtwork(term: string): Promise<string | null> {
  const key = `search:${term.toLowerCase()}`;
  let artwork = artworkCache.get(key);
  if (!artwork) {
    const params = new URLSearchParams({ term, entity: "song", limit: "1" });
    const lookup =
      typeof window === "undefined"
        ? `${ITUNES_SEARCH}?${params}`
        : `/api/track-artwork?term=${encodeURIComponent(term)}`;
    artwork = fetch(lookup)
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        const url = typeof window === "undefined" ? data.results?.[0]?.artworkUrl100 : data.cover;
        return typeof url === "string"
          ? url.replace(/\/100x100bb\.(\w+)$/i, "/250x250bb.$1")
          : null;
      })
      .catch(() => null);
    artworkCache.set(key, artwork);
  }

  return artwork;
}

export async function trackArtwork(track: any): Promise<string | null> {
  const id = appleMusicTrackId(track?.originUri);
  const cover = trackCover(track?.releaseMbId);
  const term = [track?.trackName, artistNames(track)].filter(Boolean).join(" ");

  if (id) return (await appleMusicArtwork(id)) ?? cover;
  return cover ?? (term ? await appleMusicSearchArtwork(term) : null);
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

/**
 * The single book currently being read: the reading-status record with the
 * most recent startedAt. bookhive leaves stale reading records behind when a
 * book is re-added and finished under a new record, so "all reading records"
 * over-reports. startedAt mixes date-only and ISO datetime strings; string
 * comparison orders both correctly. Records without startedAt sort last.
 */
export function latestReading(records: Record[]): Record | null {
  return (
    records
      .filter(isReading)
      .sort((a, b) =>
        String(b.value.startedAt ?? "").localeCompare(String(a.value.startedAt ?? "")),
      )[0] ?? null
  );
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
    progress: r.value.bookProgress ?? null,
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
  if (!r) return null;
  return { ...mapTrack(r), cover: await trackArtwork(r.value) };
}

export async function fetchCurrentBook(): Promise<BookView | null> {
  const r = latestReading(await listRecords(BOOK_COLLECTION, 100));
  return r ? mapBook(r) : null;
}

/**
 * Drop play records sharing an _rkey, keeping the first occurrence. Guards the
 * stats widget's accumulated history against double-appending a page (e.g. a
 * fetch racing the cache load), and heals caches already poisoned by it.
 */
export function dedupeTracks<T extends { _rkey?: string }>(tracks: T[]): T[] {
  const seen = new Set<string>();
  return tracks.filter((t) => {
    if (!t._rkey) return true;
    if (seen.has(t._rkey)) return false;
    seen.add(t._rkey);
    return true;
  });
}

/** Raw play records (value + rkey) so the widget's existing render code can use them. */
export async function fetchRecentTracks(limit = 3): Promise<any[]> {
  const tracks = (await listRecords(PLAY_COLLECTION, limit)).map((r) => ({
    ...r.value,
    _rkey: r.uri.split("/").pop(),
  }));
  return Promise.all(
    tracks.map(async (track) => ({ ...track, cover: await trackArtwork(track) })),
  );
}
