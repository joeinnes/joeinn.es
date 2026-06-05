import { useEffect, useState } from "react";
import { Lexicons } from "@atproto/lexicon";
import { describeRepo, type RepoAgent } from "./atproto/repo";
import { isRegistered } from "./lexicons/registry";

const RECENT_NSIDS_KEY = "admin:nsids:v1";

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

  return (
    <div>
      <h2 className="admin__title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
        Collections
      </h2>

      {error ? <div className="admin__error">{error}</div> : null}
      {collections === null && !error ? <p className="admin__muted">Loading collections…</p> : null}

      {collections?.length === 0 ? (
        <p className="admin__muted">
          No collections with records yet. Enter an NSID below to create the first record.
        </p>
      ) : null}

      {collections?.map((nsid) => (
        <div className="admin__row" key={nsid}>
          <div className="admin__row-main">
            <button
              type="button"
              className="admin__row-title"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
              onClick={() => onOpen(nsid)}
            >
              {nsid}
            </button>
          </div>
          {isRegistered(lex, nsid) ? <span className="admin__tag">lexicon</span> : null}
          <button type="button" className="admin__btn" onClick={() => onOpen(nsid)}>
            Browse
          </button>
        </div>
      ))}

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
