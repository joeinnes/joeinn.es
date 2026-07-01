import { useState, type ChangeEvent } from "react";
import { JsonFallbackEditor } from "./JsonFallbackEditor";
import { MarkdownEditor } from "./MarkdownEditor";
import { uploadBlob, type RepoAgent } from "../atproto/repo";
import type { PropSchema, RecordObjectSchema } from "./serialize";

const MARKDOWN_FIELDS = new Set(["body", "content", "markdown", "text", "article", "post"]);

function isMarkdownField(name: string, maxLength?: number): boolean {
  return MARKDOWN_FIELDS.has(name.toLowerCase()) || (typeof maxLength === "number" && maxLength >= 3000);
}

interface FieldProps {
  name: string;
  prop: PropSchema;
  required: boolean;
  value: unknown;
  onChange: (value: unknown) => void;
  agent?: RepoAgent;
}

function hintFor(prop: PropSchema): string {
  return prop.format ? `${prop.type} · ${prop.format}` : prop.type;
}

// Upload a file as a blob and store its ref in the record field. The blob-ref
// object round-trips through serialize (blob case) untouched.
function BlobField({ name, prop, required, value, onChange, agent }: FieldProps & { agent: RepoAgent }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const ref = value && typeof value === "object" ? (value as { ref?: { $link?: string } }) : null;
  const cid = ref?.ref?.$link;
  const accept = prop.accept?.length ? prop.accept.join(",") : "image/*";

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const blob = await uploadBlob(agent, file);
      onChange(blob);
      if (file.type.startsWith("image/")) setPreview(URL.createObjectURL(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin__field">
      <label>
        {name}
        {required ? " *" : ""}
      </label>
      <span className="admin__hint">blob · file upload</span>
      {preview ? (
        <img src={preview} alt="" style={{ maxWidth: "12rem", height: "auto", borderRadius: "0.25rem" }} />
      ) : cid ? (
        <span className="admin__hint">Attached ({cid.slice(0, 16)}…)</span>
      ) : null}
      <input type="file" accept={accept} disabled={uploading} onChange={onFile} />
      {uploading ? <span className="admin__hint">Uploading…</span> : null}
      {error ? <div className="admin__error">{error}</div> : null}
      {value ? (
        <button
          type="button"
          className="admin__btn"
          onClick={() => {
            onChange(undefined);
            setPreview(null);
          }}
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}

function Field({ name, prop, required, value, onChange, agent }: FieldProps) {
  const label = (
    <label>
      {name}
      {required ? " *" : ""}
    </label>
  );

  // string + datetime -> datetime-local (value already a local-input string)
  if (prop.type === "string" && prop.format === "datetime") {
    return (
      <div className="admin__field">
        {label}
        <span className="admin__hint">{hintFor(prop)}</span>
        <input
          type="datetime-local"
          step="1"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }

  if (prop.type === "string") {
    const maxLength = (prop as { maxLength?: number }).maxLength;
    if (isMarkdownField(name, maxLength)) {
      return (
        <div className="admin__field">
          {label}
          <span className="admin__hint">markdown · supports ::island embeds</span>
          <MarkdownEditor value={typeof value === "string" ? value : ""} onChange={onChange} />
        </div>
      );
    }
    const long = typeof maxLength === "number" && maxLength > 200;
    return (
      <div className="admin__field">
        {label}
        <span className="admin__hint">{hintFor(prop)}</span>
        {long ? (
          <textarea value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input type="text" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    );
  }

  if (prop.type === "integer") {
    return (
      <div className="admin__field">
        {label}
        <span className="admin__hint">{hintFor(prop)}</span>
        <input
          type="number"
          step="1"
          value={value === 0 || value ? String(value) : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }

  if (prop.type === "boolean") {
    return (
      <div className="admin__field">
        <div className="admin__checkbox">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
          />
          {label}
        </div>
        <span className="admin__hint">{hintFor(prop)}</span>
      </div>
    );
  }

  if (prop.type === "array" && (prop.items?.type === "string" || prop.items?.type === "integer")) {
    const items = Array.isArray(value) ? (value as unknown[]) : [];
    const update = (next: unknown[]) => onChange(next);
    return (
      <div className="admin__field">
        {label}
        <span className="admin__hint">array of {prop.items?.type}</span>
        {items.map((item, index) => (
          <div className="admin__array-item" key={index}>
            <input
              type="text"
              value={String(item ?? "")}
              onChange={(event) => {
                const next = items.slice();
                next[index] = prop.items?.type === "integer" ? Number(event.target.value) : event.target.value;
                update(next);
              }}
            />
            <button
              type="button"
              className="admin__btn admin__btn--danger"
              onClick={() => update(items.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="admin__btn" onClick={() => update([...items, ""])}>
          + Add
        </button>
      </div>
    );
  }

  // blob -> file upload (when we have an agent to upload through)
  if (prop.type === "blob" && agent) {
    return <BlobField name={name} prop={prop} required={required} value={value} onChange={onChange} agent={agent} />;
  }

  // ref / union / unknown / array-of-objects -> raw JSON
  return (
    <JsonFallbackEditor
      label={`${name}${required ? " *" : ""}`}
      hint={`${hintFor(prop)} (raw JSON)`}
      value={typeof value === "string" ? value : value == null ? "" : JSON.stringify(value, null, 2)}
      onChange={onChange}
    />
  );
}

interface FormRendererProps {
  schema: RecordObjectSchema;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  agent?: RepoAgent;
}

/**
 * Renders one control per property of a record lexicon's object schema, bound to
 * a flat form state (as produced by recordToForm). Untouched fields are simply
 * absent from `value`, so formToRecord omits them.
 */
export function FormRenderer({ schema, value, onChange, agent }: FormRendererProps) {
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  return (
    <>
      {Object.entries(props).map(([name, prop]) => (
        <Field
          key={name}
          name={name}
          prop={prop}
          required={required.has(name)}
          value={value[name]}
          onChange={(v) => onChange({ ...value, [name]: v })}
          agent={agent}
        />
      ))}
    </>
  );
}
