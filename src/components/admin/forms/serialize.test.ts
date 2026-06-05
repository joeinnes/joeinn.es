import { describe, it, expect } from "vitest";
import { isoToLocalInput, localInputToIso, recordToForm, formToRecord } from "./serialize";

describe("datetime conversion (timezone-stable, UTC wall-clock)", () => {
  it("isoToLocalInput renders the UTC wall-clock", () => {
    expect(isoToLocalInput("2026-01-01T12:30:45.000Z")).toBe("2026-01-01T12:30:45");
  });

  it("localInputToIso interprets the input as UTC", () => {
    expect(localInputToIso("2026-01-01T12:30:45")).toBe("2026-01-01T12:30:45.000Z");
    expect(localInputToIso("2026-01-01T12:30")).toBe("2026-01-01T12:30:00.000Z");
  });

  it("round-trips an ISO timestamp", () => {
    const iso = "2026-06-05T09:00:00.000Z";
    expect(localInputToIso(isoToLocalInput(iso))).toBe(iso);
  });
});

const schema = {
  properties: {
    text: { type: "string" },
    when: { type: "string", format: "datetime" },
    count: { type: "integer" },
    done: { type: "boolean" },
    tags: { type: "array", items: { type: "string" } },
    blob: { type: "blob" }, // unsupported in iteration 1 -> JSON passthrough
  },
};

const record = {
  $type: "x.y.z",
  text: "hello",
  when: "2026-06-05T09:00:00.000Z",
  count: 3,
  done: true,
  tags: ["a", "b"],
  blob: { $type: "blob", ref: { $link: "abc" }, mimeType: "image/png", size: 10 },
};

describe("recordToForm / formToRecord", () => {
  it("encodes a record into form values (datetime -> local input, blob -> JSON text)", () => {
    const form = recordToForm(schema, record);
    expect(form.text).toBe("hello");
    expect(form.when).toBe("2026-06-05T09:00:00");
    expect(form.count).toBe(3);
    expect(form.done).toBe(true);
    expect(form.tags).toEqual(["a", "b"]);
    expect(typeof form.blob).toBe("string");
    expect(JSON.parse(form.blob as string)).toEqual(record.blob);
    expect(form).not.toHaveProperty("$type");
  });

  it("round-trips back to the record (sans $type)", () => {
    const back = formToRecord(schema, recordToForm(schema, record));
    const { $type, ...expected } = record;
    expect(back).toEqual(expected);
  });

  it("treats a field with no schema prop as raw JSON passthrough", () => {
    const f = recordToForm({ properties: {} }, { extra: { a: 1 } });
    expect(typeof f.extra).toBe("string");
    expect(formToRecord({ properties: {} }, f)).toEqual({ extra: { a: 1 } });
  });

  it("reflects array add/remove through formToRecord", () => {
    const form = recordToForm(schema, record);
    (form.tags as string[]).push("c");
    expect(formToRecord(schema, form).tags).toEqual(["a", "b", "c"]);
  });

  it("drops an empty integer rather than emitting NaN", () => {
    const back = formToRecord(schema, { count: "" });
    expect(back).not.toHaveProperty("count");
  });
});
