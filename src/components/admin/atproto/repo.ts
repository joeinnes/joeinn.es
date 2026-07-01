// Thin, injectable wrappers over the authenticated atproto repo XRPC methods.
// The agent is passed in (rather than imported as a singleton) so these stay
// free of OAuth/DOM concerns and are trivially unit-tested with a small fake.

export interface RepoRecord {
  uri: string;
  cid: string;
  value: Record<string, unknown>;
}

export interface ListRecordsPage {
  records: RepoRecord[];
  cursor?: string;
}

/**
 * The structural subset of `@atproto/api`'s `Agent` that we actually call. The
 * real Agent satisfies this shape, and tests provide a minimal mock.
 */
export interface RepoAgent {
  uploadBlob(
    data: Blob | Uint8Array,
    opts?: { encoding?: string },
  ): Promise<{ data: { blob: unknown } }>;
  com: {
    atproto: {
      repo: {
        describeRepo(params: { repo: string }): Promise<{ data: { collections: string[] } }>;
        listRecords(params: {
          repo: string;
          collection: string;
          limit?: number;
          cursor?: string;
          reverse?: boolean;
        }): Promise<{ data: ListRecordsPage }>;
        getRecord(params: {
          repo: string;
          collection: string;
          rkey: string;
        }): Promise<{ data: RepoRecord }>;
        createRecord(params: {
          repo: string;
          collection: string;
          rkey?: string;
          record: Record<string, unknown>;
        }): Promise<{ data: { uri: string; cid: string } }>;
        putRecord(params: {
          repo: string;
          collection: string;
          rkey: string;
          record: Record<string, unknown>;
          swapRecord?: string | null;
        }): Promise<{ data: { uri: string; cid: string } }>;
        deleteRecord(params: {
          repo: string;
          collection: string;
          rkey: string;
          swapRecord?: string | null;
        }): Promise<{ data: unknown }>;
      };
    };
  };
}

/** Force the record's `$type` to equal its collection NSID — atproto requires this on writes. */
export function withType(
  collection: string,
  record: Record<string, unknown>,
): Record<string, unknown> {
  return { ...record, $type: collection };
}

export async function describeRepo(agent: RepoAgent, repo: string): Promise<string[]> {
  const res = await agent.com.atproto.repo.describeRepo({ repo });
  return res.data.collections;
}

export async function listRecords(
  agent: RepoAgent,
  opts: { repo: string; collection: string; cursor?: string; limit?: number },
): Promise<ListRecordsPage> {
  const { repo, collection, cursor, limit = 50 } = opts;
  const res = await agent.com.atproto.repo.listRecords({ repo, collection, cursor, limit });
  return { records: res.data.records, cursor: res.data.cursor };
}

export async function getRecord(
  agent: RepoAgent,
  opts: { repo: string; collection: string; rkey: string },
): Promise<RepoRecord> {
  const res = await agent.com.atproto.repo.getRecord(opts);
  return res.data;
}

export async function createRecord(
  agent: RepoAgent,
  opts: { repo: string; collection: string; record: Record<string, unknown>; rkey?: string },
): Promise<{ uri: string; cid: string }> {
  const { repo, collection, record, rkey } = opts;
  const res = await agent.com.atproto.repo.createRecord({
    repo,
    collection,
    rkey,
    record: withType(collection, record),
  });
  return res.data;
}

export async function putRecord(
  agent: RepoAgent,
  opts: {
    repo: string;
    collection: string;
    rkey: string;
    record: Record<string, unknown>;
    swapRecord?: string | null;
  },
): Promise<{ uri: string; cid: string }> {
  const { repo, collection, rkey, record, swapRecord } = opts;
  const res = await agent.com.atproto.repo.putRecord({
    repo,
    collection,
    rkey,
    record: withType(collection, record),
    swapRecord,
  });
  return res.data;
}

export async function deleteRecord(
  agent: RepoAgent,
  opts: { repo: string; collection: string; rkey: string; swapRecord?: string | null },
): Promise<void> {
  await agent.com.atproto.repo.deleteRecord(opts);
}

/** Upload a file as a blob and return its blob ref (to store in a record field). */
export async function uploadBlob(agent: RepoAgent, file: Blob): Promise<unknown> {
  const encoding = (file as { type?: string }).type || "application/octet-stream";
  const res = await agent.uploadBlob(file, { encoding });
  return res.data.blob;
}

/** Accumulate every record across pages (used for small collections / counts). */
export async function listAllRecords(
  agent: RepoAgent,
  opts: { repo: string; collection: string; pageLimit?: number; maxPages?: number },
): Promise<RepoRecord[]> {
  const { repo, collection, pageLimit = 100, maxPages = Infinity } = opts;
  const out: RepoRecord[] = [];
  let cursor: string | undefined;
  let pages = 0;
  do {
    const page = await listRecords(agent, { repo, collection, cursor, limit: pageLimit });
    out.push(...page.records);
    cursor = page.cursor;
    pages += 1;
  } while (cursor && pages < maxPages);
  return out;
}
