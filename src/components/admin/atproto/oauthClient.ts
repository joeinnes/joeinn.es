import { BrowserOAuthClient } from "@atproto/oauth-client-browser";

// `transition:generic` is required (in addition to `atproto`) to read/write
// app-defined records via com.atproto.repo.* on the user's PDS.
export const SCOPE = "atproto transition:generic";

// Resolve handles/DIDs against the user's own PDS rather than leaking the lookup
// (IP + handle) to a third-party appview.
export const HANDLE_RESOLVER = "https://bsky.social";

/**
 * Dev uses atproto's "loopback client": the synthetic client_id is
 * `http://localhost?...`, but the browser origin MUST be the loopback IP
 * (127.0.0.1), never `localhost`. We also bake the scope in, because the
 * default loopback scope is identity-only (`atproto`).
 */
function devClientId(): string {
  const loc = window.location;
  const host = loc.hostname === "localhost" ? "127.0.0.1" : loc.hostname;
  const port = loc.port ? `:${loc.port}` : "";
  const redirectUri = `http://${host}${port}/admin`;
  return `http://localhost?scope=${encodeURIComponent(SCOPE)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

/** Prod client_id is the metadata document served from this exact origin. */
function prodClientId(): string {
  return `${window.location.origin}/client-metadata.json`;
}

export function getClientId(): string {
  return import.meta.env.DEV ? devClientId() : prodClientId();
}

/**
 * In dev, bounce `localhost` -> `127.0.0.1` before anything else, since atproto
 * forbids `localhost` as the OAuth origin and the session store is per-origin.
 * Returns true if a redirect was triggered (the caller should then stop).
 */
export function ensureDevLoopbackOrigin(): boolean {
  if (!import.meta.env.DEV) return false;
  if (typeof window === "undefined") return false;
  if (window.location.hostname === "localhost") {
    const target = new URL(window.location.href);
    target.hostname = "127.0.0.1";
    window.location.replace(target.toString());
    return true;
  }
  return false;
}

let clientPromise: Promise<BrowserOAuthClient> | null = null;

/**
 * Construct the OAuth client exactly once. Module scope (not React state)
 * guarantees a single instance across React StrictMode double-effects and Astro
 * view-transition island remounts, so `init()` can't run the callback twice.
 */
export function getOAuthClient(): Promise<BrowserOAuthClient> {
  if (!clientPromise) {
    clientPromise = BrowserOAuthClient.load({
      clientId: getClientId(),
      handleResolver: HANDLE_RESOLVER,
    });
  }
  return clientPromise;
}
