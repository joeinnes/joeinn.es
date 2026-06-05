import { useEffect, useMemo, useState } from "react";
import { Lexicons } from "@atproto/lexicon";
import { createRecord, getRecord, putRecord, withType, type RepoAgent } from "./atproto/repo";
import { validateRecord } from "./lexicons/registry";
import { FormRenderer } from "./forms/FormRenderer";
import { JsonFallbackEditor } from "./forms/JsonFallbackEditor";
import { formToRecord, isoToLocalInput, recordToForm, type RecordObjectSchema } from "./forms/serialize";

function objectSchemaFor(lex: Lexicons, nsid: string): RecordObjectSchema | null {
  const def = lex.getDef(nsid) as { type?: string; record?: RecordObjectSchema } | undefined;
  if (def?.type === "record" && def.record) return def.record;
  return null;
}

interface RecordEditorProps {
  agent: RepoAgent;
  repo: string;
  nsid: string;
  rkey?: string;
  lex: Lexicons;
  onSaved: () => void;
  onCancel: () => void;
}

export function RecordEditor({ agent, repo, nsid, rkey, lex, onSaved, onCancel }: RecordEditorProps) {
  const schema = useMemo(() => objectSchemaFor(lex, nsid), [lex, nsid]);
  const isEditing = Boolean(rkey);

  const [mode, setMode] = useState<"form" | "json">(schema ? "form" : "json");
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [jsonText, setJsonText] = useState<string>(`{\n  "$type": "${nsid}"\n}`);
  const [newRkey, setNewRkey] = useState("");
  const [cid, setCid] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing record when editing.
  useEffect(() => {
    if (!isEditing || !rkey) {
      // Create mode: prefill a createdAt if the schema asks for one.
      if (schema?.properties?.createdAt?.format === "datetime") {
        setForm({ createdAt: isoToLocalInput(new Date().toISOString()) });
      }
      return;
    }
    let cancelled = false;
    setLoading(true);
    getRecord(agent, { repo, collection: nsid, rkey })
      .then((rec) => {
        if (cancelled) return;
        setCid(rec.cid);
        setJsonText(JSON.stringify({ $type: nsid, ...rec.value }, null, 2));
        setForm(recordToForm(schema ?? { properties: {} }, rec.value));
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, repo, nsid, rkey]);

  // Keep the two editors in sync when toggling mode.
  const switchMode = (next: "form" | "json") => {
    setError(null);
    if (next === mode) return;
    if (next === "json") {
      const record = formToRecord(schema ?? { properties: {} }, form);
      setJsonText(JSON.stringify(withType(nsid, record), null, 2));
    } else {
      try {
        const parsed = JSON.parse(jsonText);
        setForm(recordToForm(schema ?? { properties: {} }, parsed));
      } catch {
        setError("Can't switch to the form: the JSON is invalid.");
        return;
      }
    }
    setMode(next);
  };

  const buildRecord = (): Record<string, unknown> => {
    if (mode === "form") return formToRecord(schema ?? { properties: {} }, form);
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Record must be a JSON object.");
    }
    const { $type: _ignored, ...rest } = parsed as Record<string, unknown>;
    return rest;
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const record = buildRecord();
      const candidate = withType(nsid, record);

      const check = validateRecord(lex, nsid, candidate);
      if (!check.ok) {
        setError(`Validation failed: ${check.error}`);
        setSaving(false);
        return;
      }

      if (isEditing && rkey) {
        await putRecord(agent, { repo, collection: nsid, rkey, record, swapRecord: cid });
      } else {
        await createRecord(agent, {
          repo,
          collection: nsid,
          record,
          rkey: newRkey.trim() || undefined,
        });
      }
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(
        /InvalidSwap/i.test(message)
          ? "This record changed since you opened it. Go back, reload, and try again."
          : message,
      );
      setSaving(false);
    }
  };

  if (loading) return <p className="admin__muted">Loading record…</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h2 className="admin__title" style={{ fontSize: "1.1rem", margin: 0 }}>
          {isEditing ? `Edit ${rkey}` : "New record"}
        </h2>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            type="button"
            className={`admin__btn${mode === "form" ? " admin__btn--primary" : ""}`}
            disabled={!schema}
            title={schema ? "" : "No lexicon registered for this collection"}
            onClick={() => switchMode("form")}
          >
            Form
          </button>
          <button
            type="button"
            className={`admin__btn${mode === "json" ? " admin__btn--primary" : ""}`}
            onClick={() => switchMode("json")}
          >
            JSON
          </button>
        </div>
      </div>

      <p className="admin__row-sub" style={{ marginBottom: "1rem" }}>{nsid}</p>

      {!schema && mode === "json" ? (
        <p className="admin__hint" style={{ marginBottom: "0.75rem" }}>
          No lexicon registered for this collection — editing raw JSON. Register one from the collections
          screen to get a form and validation.
        </p>
      ) : null}

      {error ? <div className="admin__error">{error}</div> : null}

      {mode === "form" && schema ? (
        <FormRenderer schema={schema} value={form} onChange={setForm} />
      ) : (
        <JsonFallbackEditor value={jsonText} onChange={setJsonText} />
      )}

      {!isEditing ? (
        <div className="admin__field">
          <label htmlFor="admin-rkey">Record key (optional)</label>
          <span className="admin__hint">Leave blank for an auto-generated TID. Use e.g. "self" for singletons.</span>
          <input
            id="admin-rkey"
            type="text"
            placeholder="(auto)"
            value={newRkey}
            onChange={(event) => setNewRkey(event.target.value)}
          />
        </div>
      ) : null}

      <div className="admin__actions">
        <button type="button" className="admin__btn admin__btn--primary" disabled={saving} onClick={() => void save()}>
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create record"}
        </button>
        <button type="button" className="admin__btn" disabled={saving} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
