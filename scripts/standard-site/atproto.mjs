// Generic AT Protocol record client for custom (owned) lexicons such as
// es.joeinn.shipped and es.joeinn.shippedDigest. The standard.site publisher only
// writes site.standard.* records, so anything under our own NSID namespace goes
// through com.atproto.repo.* directly.
//
// Auth is a Bluesky app password (the same ATPROTO_APP_PASSWORD the standard.site
// sync uses). We log in against the bsky.social entryway, which proxies writes to
// the account's PDS — correct for this account today. If the account ever moves
// to a self-hosted PDS, resolve the service endpoint from the DID document here.

import { AtpAgent } from "@atproto/api";

const ENTRYWAY = "https://bsky.social";

// Log in and return a thin client bound to the authenticated repo (DID). Each
// method maps onto a single com.atproto.repo call and returns the bits the sync
// engine records in the manifest.
export async function createRecordClient({ identifier, password, service = ENTRYWAY }) {
  const agent = new AtpAgent({ service });
  await agent.login({ identifier, password });
  const did = agent.session?.did;
  if (!did) throw new Error("atproto login succeeded but no DID was returned");

  return {
    did,
    getPdsUrl: () => service,

    async create(collection, record) {
      const res = await agent.com.atproto.repo.createRecord({ repo: did, collection, record });
      return { uri: res.data.uri, cid: res.data.cid };
    },

    async put(collection, rkey, record) {
      const res = await agent.com.atproto.repo.putRecord({ repo: did, collection, rkey, record });
      return { uri: res.data.uri, cid: res.data.cid };
    },

    async del(collection, rkey) {
      await agent.com.atproto.repo.deleteRecord({ repo: did, collection, rkey });
    },
  };
}
