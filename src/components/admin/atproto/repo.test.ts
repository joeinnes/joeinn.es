import { describe, it, expect, vi } from "vitest";
import {
  withType,
  describeRepo,
  listRecords,
  getRecord,
  createRecord,
  putRecord,
  deleteRecord,
  listAllRecords,
  type RepoAgent,
} from "./repo";

function fakeAgent(overrides: Record<string, unknown> = {}) {
  const repo = {
    describeRepo: vi.fn(async () => ({ data: { collections: ["app.bsky.feed.post"] } })),
    listRecords: vi.fn(async () => ({ data: { records: [], cursor: undefined } })),
    getRecord: vi.fn(async () => ({ data: { uri: "at://x", cid: "c", value: {} } })),
    createRecord: vi.fn(async () => ({ data: { uri: "at://x", cid: "c" } })),
    putRecord: vi.fn(async () => ({ data: { uri: "at://x", cid: "c2" } })),
    deleteRecord: vi.fn(async () => ({ data: {} })),
    ...overrides,
  };
  const agent = { com: { atproto: { repo } } } as unknown as RepoAgent;
  return { agent, repo };
}

describe("withType", () => {
  it("forces $type to the collection nsid", () => {
    expect(withType("app.bsky.feed.post", { text: "hi" })).toEqual({
      text: "hi",
      $type: "app.bsky.feed.post",
    });
  });

  it("overrides an incorrect existing $type", () => {
    expect(withType("a.b.c", { $type: "wrong", x: 1 })).toEqual({ x: 1, $type: "a.b.c" });
  });
});

describe("describeRepo", () => {
  it("returns the collections array", async () => {
    const { agent } = fakeAgent();
    await expect(describeRepo(agent, "did:plc:abc")).resolves.toEqual(["app.bsky.feed.post"]);
  });
});

describe("listRecords", () => {
  it("passes cursor + default limit and returns records + cursor", async () => {
    const { agent, repo } = fakeAgent({
      listRecords: vi.fn(async () => ({
        data: { records: [{ uri: "at://1", cid: "c", value: {} }], cursor: "next" },
      })),
    });
    const page = await listRecords(agent, { repo: "did:x", collection: "c.d.e", cursor: "cur" });
    expect(repo.listRecords).toHaveBeenCalledWith({
      repo: "did:x",
      collection: "c.d.e",
      cursor: "cur",
      limit: 50,
    });
    expect(page).toEqual({ records: [{ uri: "at://1", cid: "c", value: {} }], cursor: "next" });
  });
});

describe("getRecord", () => {
  it("returns the record envelope", async () => {
    const { agent, repo } = fakeAgent();
    const rec = await getRecord(agent, { repo: "did:x", collection: "a.b.c", rkey: "r1" });
    expect(repo.getRecord).toHaveBeenCalledWith({ repo: "did:x", collection: "a.b.c", rkey: "r1" });
    expect(rec).toEqual({ uri: "at://x", cid: "c", value: {} });
  });
});

describe("createRecord / putRecord", () => {
  it("injects $type on create", async () => {
    const { agent, repo } = fakeAgent();
    await createRecord(agent, { repo: "did:x", collection: "a.b.c", record: { text: "hi" } });
    expect(repo.createRecord).toHaveBeenCalledWith({
      repo: "did:x",
      collection: "a.b.c",
      rkey: undefined,
      record: { text: "hi", $type: "a.b.c" },
    });
  });

  it("injects $type and forwards swapRecord on put", async () => {
    const { agent, repo } = fakeAgent();
    await putRecord(agent, {
      repo: "did:x",
      collection: "a.b.c",
      rkey: "r1",
      record: { text: "hi" },
      swapRecord: "cid0",
    });
    expect(repo.putRecord).toHaveBeenCalledWith({
      repo: "did:x",
      collection: "a.b.c",
      rkey: "r1",
      record: { text: "hi", $type: "a.b.c" },
      swapRecord: "cid0",
    });
  });
});

describe("deleteRecord", () => {
  it("forwards swapRecord", async () => {
    const { agent, repo } = fakeAgent();
    await deleteRecord(agent, { repo: "did:x", collection: "a.b.c", rkey: "r1", swapRecord: "cid0" });
    expect(repo.deleteRecord).toHaveBeenCalledWith({
      repo: "did:x",
      collection: "a.b.c",
      rkey: "r1",
      swapRecord: "cid0",
    });
  });
});

describe("listAllRecords", () => {
  it("accumulates across pages and stops when the cursor is undefined", async () => {
    let call = 0;
    const pages = [
      { data: { records: [{ uri: "1" }, { uri: "2" }], cursor: "p2" } },
      { data: { records: [{ uri: "3" }], cursor: undefined } },
    ];
    const { agent, repo } = fakeAgent({ listRecords: vi.fn(async () => pages[call++]) });
    const all = await listAllRecords(agent, { repo: "did:x", collection: "a.b.c" });
    expect(all.map((r) => r.uri)).toEqual(["1", "2", "3"]);
    expect(repo.listRecords).toHaveBeenCalledTimes(2);
  });

  it("respects maxPages even if a cursor keeps coming back", async () => {
    const { agent, repo } = fakeAgent({
      listRecords: vi.fn(async () => ({ data: { records: [{ uri: "x" }], cursor: "always" } })),
    });
    const all = await listAllRecords(agent, { repo: "did:x", collection: "a.b.c", maxPages: 3 });
    expect(repo.listRecords).toHaveBeenCalledTimes(3);
    expect(all).toHaveLength(3);
  });
});
