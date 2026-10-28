// Deterministic build-time seed for check-listening.mjs; all other fetches are unchanged.
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input);
  if (url.hostname === "bsky.social" && url.searchParams.get("collection") === "fm.teal.feed.play") {
    return Response.json({ records: [{
      uri: "at://did:plc:test/fm.teal.feed.play/build-time-play",
      value: {
        trackName: "Played at build time",
        artists: [{ artistName: "Build-time artist" }],
        releaseMbId: "00000000-0000-0000-0000-000000000000",
        playedTime: "2026-01-01T12:00:00Z",
      },
    }] });
  }
  return originalFetch(input, init);
};
