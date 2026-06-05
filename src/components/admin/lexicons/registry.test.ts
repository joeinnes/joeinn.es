import { describe, it, expect } from "vitest";
import {
  buildLexicons,
  validateRecord,
  isRegistered,
  loadCustomDocs,
  saveCustomDocs,
  type StorageLike,
} from "./registry";

const noteDoc = {
  lexicon: 1,
  id: "es.joeinn.test.note",
  defs: {
    main: {
      type: "record",
      key: "tid",
      record: {
        type: "object",
        required: ["text", "createdAt"],
        properties: {
          text: { type: "string", maxLength: 100 },
          createdAt: { type: "string", format: "datetime" },
        },
      },
    },
  },
};
const nsid = "es.joeinn.test.note";
const validRecord = { $type: nsid, text: "hi", createdAt: "2026-01-01T00:00:00.000Z" };

describe("buildLexicons", () => {
  it("loads valid docs and reports their ids", () => {
    const { lex, loaded, skipped } = buildLexicons([noteDoc]);
    expect(loaded).toEqual([nsid]);
    expect(skipped).toEqual([]);
    expect(isRegistered(lex, nsid)).toBe(true);
  });

  it("dedupes by id (last write wins)", () => {
    const { loaded } = buildLexicons([noteDoc, { ...noteDoc }]);
    expect(loaded).toEqual([nsid]);
  });

  it("skips malformed docs without throwing", () => {
    const { lex, loaded, skipped } = buildLexicons([noteDoc, {}, null, "nope"]);
    expect(loaded).toEqual([nsid]);
    expect(skipped).toHaveLength(3);
    expect(isRegistered(lex, nsid)).toBe(true);
  });
});

describe("validateRecord", () => {
  it("passes a valid record", () => {
    const { lex } = buildLexicons([noteDoc]);
    expect(validateRecord(lex, nsid, validRecord)).toEqual({ ok: true });
  });

  it("fails when $type is missing", () => {
    const { lex } = buildLexicons([noteDoc]);
    const r = validateRecord(lex, nsid, { text: "hi", createdAt: "2026-01-01T00:00:00.000Z" });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/\$type/);
  });

  it("fails on a missing required field", () => {
    const { lex } = buildLexicons([noteDoc]);
    expect(validateRecord(lex, nsid, { $type: nsid, text: "hi" }).ok).toBe(false);
  });

  it("skips validation for an unregistered nsid", () => {
    const { lex } = buildLexicons([noteDoc]);
    expect(validateRecord(lex, "es.joeinn.unknown", { anything: true })).toEqual({
      ok: true,
      skipped: true,
    });
  });
});

function memStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
  };
}

describe("custom doc persistence", () => {
  it("round-trips custom docs", () => {
    const s = memStorage();
    saveCustomDocs(s, [noteDoc]);
    expect(loadCustomDocs(s)).toEqual([noteDoc]);
  });

  it("returns [] for missing storage, empty storage, or corrupt JSON", () => {
    expect(loadCustomDocs(undefined)).toEqual([]);
    const s = memStorage();
    expect(loadCustomDocs(s)).toEqual([]);
    s.setItem("admin:lexicons:v1", "{not json");
    expect(loadCustomDocs(s)).toEqual([]);
  });
});
