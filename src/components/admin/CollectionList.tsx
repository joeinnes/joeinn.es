import { useEffect, useState } from "react";
import { Lexicons } from "@atproto/lexicon";
import { describeRepo, type RepoAgent } from "./atproto/repo";
import { isRegistered, type StorageLike } from "./lexicons/registry";

const RECENT_NSIDS_KEY = "admin:nsids:v1";
const PREFERENCES_KEY = "admin:collection-preferences:v1";

export interface CollectionPreference {
  name?: string;
  pinned?: boolean;
  hidden?: boolean;
}

export type CollectionPreferences = Record<string, CollectionPreference>;

export function loadCollectionPreferences(storage: StorageLike): CollectionPreferences {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(PREFERENCES_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const valid = Object.values(parsed).every(
      (value) =>
        !!value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        ("name" in value ? typeof value.name === "string" : true) &&
        ("pinned" in value ? typeof value.pinned === "boolean" : true) &&
        ("hidden" in value ? typeof value.hidden === "boolean" : true),
    );
    return valid ? (parsed as CollectionPreferences) : {};
  } catch {
    return {};
  }
}

export function saveCollectionPreferences(
  storage: StorageLike,
  preferences: CollectionPreferences,
): void {
  try {
    storage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    /* ignore */
  }
}

export function organiseCollections(collections: string[], preferences: CollectionPreferences) {
  const sorted = [...collections].sort((a, b) => {
    const pinDifference = Number(!!preferences[b]?.pinned) - Number(!!preferences[a]?.pinned);
    if (pinDifference) return pinDifference;
    const aLabel = preferences[a]?.name?.trim() || a;
    const bLabel = preferences[b]?.name?.trim() || b;
    return aLabel.localeCompare(bLabel) || a.localeCompare(b);
  });

  return {
    visible: sorted.filter((nsid) => !preferences[nsid]?.hidden),
    hidden: sorted.filter((nsid) => preferences[nsid]?.hidden),
  };
}

function loadRecentNsids(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_NSIDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function rememberNsid(nsid: string): void {
  try {
    const set = new Set([nsid, ...loadRecentNsids()]);
    localStorage.setItem(RECENT_NSIDS_KEY, JSON.stringify([...set].slice(0, 50)));
  } catch {
    /* ignore */
  }
}

interface CollectionListProps {
  agent: RepoAgent;
  repo: string;
  lex: Lexicons;
  onOpen: (nsid: string) => void;
  onNewIn: (nsid: string) => void;
  onRegisterLexicon: (doc: unknown) => string | null;
}

export function CollectionList({
  agent,
  repo,
  lex,
  onOpen,
  onNewIn,
  onRegisterLexicon,
}: CollectionListProps) {
  const [collections, setCollections] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customNsid, setCustomNsid] = useState("");
  const [lexText, setLexText] = useState("");
  const [lexError, setLexError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [preferences, setPreferences] = useState<CollectionPreferences>({});

  useEffect(() => {
    setPreferences(loadCollectionPreferences(localStorage));
  }, []);

  useEffect(() => {
    let cancelled = false;
    describeRepo(agent, repo)
      .then((found) => {
        if (cancelled) return;
        const merged = Array.from(new Set([...found, ...loadRecentNsids()])).sort();
        setCollections(merged);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)));
    return () => {
      cancelled = true;
    };
  }, [agent, repo]);

  const registerLexicon = () => {
    setLexError(null);
    let doc: unknown;
    try {
      doc = JSON.parse(lexText);
    } catch {
      setLexError("Not valid JSON.");
      return;
    }
    const id = onRegisterLexicon(doc);
    if (!id) {
      setLexError("Not a valid lexicon document (needs a string `id`).");
      return;
    }
    setLexText("");
    setShowRegister(false);
    if (typeof id === "string") setCollections((prev) => Array.from(new Set([...(prev ?? []), id])).sort());
  };

  const updatePreference = (nsid: string, preference: CollectionPreference) => {
    setPreferences((current) => {
      const next = { ...current, [nsid]: preference };
      saveCollectionPreferences(localStorage, next);
      return next;
    });
  };

  const organised = organiseCollections(collections ?? [], preferences);

  const renderCollection = (nsid: string) => {
    const preference = preferences[nsid] ?? {};
    return (
      <div className="admin__row" key={nsid}>
        <div className="admin__row-main">
          <input
            type="text"
            className="admin__friendly-name"
            aria-label={`Friendly name for ${nsid}`}
            placeholder="Friendly name"
            value={preference.name ?? ""}
            onChange={(event) => updatePreference(nsid, { ...preference, name: event.target.value })}
          />
          <div className="admin__row-sub">{nsid}</div>
        </div>
        {isRegistered(lex, nsid) ? <span className="admin__tag">lexicon</span> : null}
        <div className="admin__row-actions">
          <button
            type="button"
            className="admin__btn"
            aria-pressed={!!preference.pinned}
            onClick={() => updatePreference(nsid, { ...preference, pinned: !preference.pinned })}
          >
            {preference.pinned ? "Unpin" : "Pin"}
          </button>
          <button
            type="button"
            className="admin__btn"
            onClick={() => updatePreference(nsid, { ...preference, hidden: !preference.hidden })}
          >
            {preference.hidden ? "Unhide" : "Hide"}
          </button>
          <button type="button" className="admin__btn" onClick={() => onOpen(nsid)}>
            Browse
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="admin__title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
        Collections
      </h2>
      <p className="admin__hint">Names, pins and hidden collections are saved in this browser.</p>

      {error ? <div className="admin__error">{error}</div> : null}
      {collections === null && !error ? <p className="admin__muted">Loading collections…</p> : null}

      {collections?.length === 0 ? (
        <p className="admin__muted">
          No collections with records yet. Enter an NSID below to create the first record.
        </p>
      ) : null}

      {organised.visible.map(renderCollection)}

      {organised.hidden.length > 0 ? (
        <details className="admin__hidden">
          <summary>Hidden collections ({organised.hidden.length})</summary>
          {organised.hidden.map(renderCollection)}
        </details>
      ) : null}

      <div className="admin__field" style={{ marginTop: "1.5rem" }}>
        <label htmlFor="admin-custom-nsid">Open or create in a specific collection (NSID)</label>
        <span className="admin__hint">
          describeRepo only lists collections that already have records, so enter an NSID to start a new one.
        </span>
        <input
          id="admin-custom-nsid"
          type="text"
          placeholder="es.joeinn.blog.post"
          value={customNsid}
          onChange={(event) => setCustomNsid(event.target.value)}
        />
        <div className="admin__actions">
          <button
            type="button"
            className="admin__btn"
            disabled={!customNsid.trim()}
            onClick={() => {
              const nsid = customNsid.trim();
              rememberNsid(nsid);
              onOpen(nsid);
            }}
          >
            Browse
          </button>
          <button
            type="button"
            className="admin__btn admin__btn--primary"
            disabled={!customNsid.trim()}
            onClick={() => {
              const nsid = customNsid.trim();
              rememberNsid(nsid);
              onNewIn(nsid);
            }}
          >
            + New record
          </button>
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button type="button" className="admin__btn" onClick={() => setShowRegister((v) => !v)}>
          {showRegister ? "Cancel" : "Register a lexicon"}
        </button>
        {showRegister ? (
          <div className="admin__field" style={{ marginTop: "0.75rem" }}>
            <label htmlFor="admin-lex-json">Lexicon JSON</label>
            <span className="admin__hint">
              Paste a lexicon document to get schema-driven forms + validation for its collection.
            </span>
            <textarea
              id="admin-lex-json"
              spellCheck={false}
              value={lexText}
              onChange={(event) => setLexText(event.target.value)}
            />
            {lexError ? <div className="admin__error">{lexError}</div> : null}
            <div className="admin__actions">
              <button type="button" className="admin__btn admin__btn--primary" onClick={registerLexicon}>
                Add lexicon
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
