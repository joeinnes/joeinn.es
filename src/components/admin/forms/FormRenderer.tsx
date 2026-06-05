import { JsonFallbackEditor } from "./JsonFallbackEditor";
import type { PropSchema, RecordObjectSchema } from "./serialize";

interface FieldProps {
  name: string;
  prop: PropSchema;
  required: boolean;
  value: unknown;
  onChange: (value: unknown) => void;
}

function hintFor(prop: PropSchema): string {
  return prop.format ? `${prop.type} · ${prop.format}` : prop.type;
}

function Field({ name, prop, required, value, onChange }: FieldProps) {
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

  // blob / ref / union / unknown / array-of-objects -> raw JSON
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
}

/**
 * Renders one control per property of a record lexicon's object schema, bound to
 * a flat form state (as produced by recordToForm). Untouched fields are simply
 * absent from `value`, so formToRecord omits them.
 */
export function FormRenderer({ schema, value, onChange }: FormRendererProps) {
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
        />
      ))}
    </>
  );
}
