import { Lexicons, type LexiconDoc } from "@atproto/lexicon";

// Where user-registered custom lexicon docs are persisted in the browser.
export const STORAGE_KEY = "admin:lexicons:v1";

/** Minimal Storage shape so the registry stays SSR-safe and unit-testable. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface BuildResult {
  lex: Lexicons;
  /** NSIDs successfully registered. */
  loaded: string[];
  /** NSIDs (or "(invalid)") that could not be registered. */
  skipped: string[];
}

/**
 * Build a `Lexicons` collection from a set of (possibly untrusted) docs.
 * Resilient by design: docs without a string `id` or that fail to register are
 * collected into `skipped` instead of throwing, so one bad paste can't break
 * the whole dashboard. Later docs with the same id win (dedupe).
 */
export function buildLexicons(docs: unknown[]): BuildResult {
  const lex = new Lexicons();
  const loaded: string[] = [];
  const skipped: string[] = [];

  const byId = new Map<string, object>();
  for (const doc of docs) {
    if (doc && typeof doc === "object" && typeof (doc as { id?: unknown }).id === "string") {
      byId.set((doc as { id: string }).id, doc);
    } else {
      skipped.push("(invalid)");
    }
  }

  for (const [id, doc] of byId) {
    try {
      lex.add(doc as LexiconDoc);
      loaded.push(id);
    } catch {
      skipped.push(id);
    }
  }

  return { lex, loaded, skipped };
}

/** Whether a record lexicon is registered for the given NSID. */
export function isRegistered(lex: Lexicons, nsid: string): boolean {
  return Boolean(lex.getDef(nsid));
}

export interface ValidationResult {
  ok: boolean;
  /** True when no schema was registered for the NSID, so validation was skipped. */
  skipped?: boolean;
  error?: string;
}

/**
 * Validate a record against its registered lexicon. When the NSID isn't
 * registered we cannot validate, so the write is allowed through ({ ok, skipped })
 * and the raw-JSON editor is the only guarantee. The record must include `$type`.
 */
export function validateRecord(lex: Lexicons, nsid: string, record: unknown): ValidationResult {
  if (!isRegistered(lex, nsid)) return { ok: true, skipped: true };
  try {
    lex.assertValidRecord(nsid, record);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function loadCustomDocs(storage: StorageLike | undefined): unknown[] {
  if (!storage) return [];
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomDocs(storage: StorageLike, docs: unknown[]): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(docs));
}
