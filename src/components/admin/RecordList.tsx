import { useEffect, useState } from "react";
import { deleteRecord, listRecords, type RepoAgent, type RepoRecord } from "./atproto/repo";

export function rkeyFromUri(uri: string): string {
  return uri.split("/").pop() ?? uri;
}

const PREVIEW_FIELDS = ["title", "summary", "name", "displayName", "text", "subject", "description"];

function previewOf(value: Record<string, unknown>): string {
  for (const field of PREVIEW_FIELDS) {
    const v = value[field];
    if (typeof v === "string" && v.trim()) return v.length > 120 ? `${v.slice(0, 120)}…` : v;
  }
  const json = JSON.stringify(value);
  return json.length > 120 ? `${json.slice(0, 120)}…` : json;
}

interface RecordListProps {
  agent: RepoAgent;
  repo: string;
  nsid: string;
  onEdit: (rkey: string) => void;
  onNew: () => void;
}

export function RecordList({ agent, repo, nsid, onEdit, onNew }: RecordListProps) {
  const [records, setRecords] = useState<RepoRecord[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyRkey, setBusyRkey] = useState<string | null>(null);

  const load = async (reset: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const page = await listRecords(agent, {
        repo,
        collection: nsid,
        cursor: reset ? undefined : cursor,
        limit: 50,
      });
      setRecords((prev) => (reset ? page.records : [...prev, ...page.records]));
      setCursor(page.cursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRecords([]);
    setCursor(undefined);
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, repo, nsid]);

  const remove = async (record: RepoRecord) => {
    const rkey = rkeyFromUri(record.uri);
    if (!confirm(`Delete record "${rkey}"? This cannot be undone.`)) return;
    setBusyRkey(rkey);
    setError(null);
    try {
      await deleteRecord(agent, { repo, collection: nsid, rkey, swapRecord: record.cid });
      setRecords((prev) => prev.filter((r) => r.uri !== record.uri));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyRkey(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h2 className="admin__title" style={{ fontSize: "1.1rem", margin: 0, wordBreak: "break-all" }}>
          {nsid}
        </h2>
        <button type="button" className="admin__btn admin__btn--primary" onClick={onNew}>
          + New record
        </button>
      </div>

      {error ? <div className="admin__error">{error}</div> : null}

      {records.map((record) => {
        const rkey = rkeyFromUri(record.uri);
        return (
          <div className="admin__row" key={record.uri}>
            <div className="admin__row-main">
              <div className="admin__row-title">{previewOf(record.value)}</div>
              <div className="admin__row-sub">{rkey}</div>
            </div>
            <button type="button" className="admin__btn" onClick={() => onEdit(rkey)}>
              Edit
            </button>
            <button
              type="button"
              className="admin__btn admin__btn--danger"
              disabled={busyRkey === rkey}
              onClick={() => remove(record)}
            >
              {busyRkey === rkey ? "Deleting…" : "Delete"}
            </button>
          </div>
        );
      })}

      {!loading && records.length === 0 && !error ? (
        <p className="admin__muted">No records in this collection yet.</p>
      ) : null}

      <div className="admin__actions">
        {loading ? <span className="admin__muted">Loading…</span> : null}
        {cursor && !loading ? (
          <button type="button" className="admin__btn" onClick={() => void load(false)}>
            Load more
          </button>
        ) : null}
      </div>
    </div>
  );
}
