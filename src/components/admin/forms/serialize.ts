// Pure helpers mapping between an atproto record and a flat form state, used by
// FormRenderer. Kept framework-free so the fiddly bits (datetime conversion,
// raw-JSON passthrough, round-tripping) are unit-tested without React.

export interface PropSchema {
  type: string;
  format?: string;
  items?: { type: string };
}

export interface RecordObjectSchema {
  properties?: Record<string, PropSchema>;
  required?: string[];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Render an ISO timestamp as a `datetime-local` input value using its UTC
 * wall-clock. Using UTC (rather than the host timezone) keeps the value stable
 * across machines and makes the round-trip lossless.
 */
export function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  );
}

/** Interpret a `datetime-local` input value as UTC and return a full ISO string. */
export function localInputToIso(local: string): string {
  if (!local) return "";
  const withSeconds = local.length === 16 ? `${local}:00` : local;
  const d = new Date(`${withSeconds}Z`);
  if (Number.isNaN(d.getTime())) return local;
  return d.toISOString();
}

function toJsonText(value: unknown): string {
  return JSON.stringify(value ?? null, null, 2);
}

function fromJsonText(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function encodeField(prop: PropSchema | undefined, value: unknown): unknown {
  if (!prop) return toJsonText(value);
  switch (prop.type) {
    case "string":
      if (prop.format === "datetime" && typeof value === "string") return isoToLocalInput(value);
      return value ?? "";
    case "integer":
    case "boolean":
      return value;
    case "array":
      return Array.isArray(value) ? value : [];
    default:
      // blob / ref / union / unknown -> raw-JSON passthrough
      return toJsonText(value);
  }
}

function decodeField(prop: PropSchema | undefined, value: unknown): unknown {
  if (!prop) return fromJsonText(value);
  switch (prop.type) {
    case "string":
      if (prop.format === "datetime" && typeof value === "string") {
        return value ? localInputToIso(value) : undefined;
      }
      return value;
    case "integer":
      return value === "" || value == null ? undefined : Number(value);
    case "boolean":
      return Boolean(value);
    case "array":
      return Array.isArray(value) ? value : [];
    default:
      return fromJsonText(value);
  }
}

/** Encode a record into flat form values. `$type` is dropped (it's re-injected on write). */
export function recordToForm(
  schema: RecordObjectSchema,
  record: Record<string, unknown>,
): Record<string, unknown> {
  const props = schema.properties ?? {};
  const form: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(record)) {
    if (name === "$type") continue;
    form[name] = encodeField(props[name], value);
  }
  return form;
}

/** Decode flat form values back into a record. Empty/undefined fields are omitted. */
export function formToRecord(
  schema: RecordObjectSchema,
  form: Record<string, unknown>,
): Record<string, unknown> {
  const props = schema.properties ?? {};
  const record: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(form)) {
    const decoded = decodeField(props[name], value);
    if (decoded !== undefined) record[name] = decoded;
  }
  return record;
}
