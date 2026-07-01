import { describe, it, expect } from "vitest";
import {
  trackCover,
  artistNames,
  didFromUri,
  blobUrl,
  authorList,
  mapTrack,
  mapBook,
  isReading,
} from "./now";

describe("now PDS mappers", () => {
  it("trackCover builds a Cover Art Archive URL from an mbid-prefixed id, else null", () => {
    expect(trackCover("mbid:0fc05d92-255c-4a91-b3ed-abcdefabcdef")).toBe(
      "https://coverartarchive.org/release/0fc05d92-255c-4a91-b3ed-abcdefabcdef/front-250",
    );
    expect(trackCover("not-a-uuid")).toBeNull();
    expect(trackCover(undefined)).toBeNull();
  });

  it("artistNames prefers structured artists, falls back to artistNames, else empty", () => {
    expect(artistNames({ artists: [{ artistName: "A" }, { artistName: "B" }] })).toBe("A, B");
    expect(artistNames({ artistNames: ["C"] })).toBe("C");
    expect(artistNames({})).toBe("");
  });

  it("didFromUri extracts the DID from an at:// uri", () => {
    expect(didFromUri("at://did:plc:abc/buzz.bookhive.book/123")).toBe("did:plc:abc");
    expect(didFromUri("nonsense")).toBeNull();
  });

  it("blobUrl builds a getBlob URL from a did + cover ref, else null", () => {
    expect(blobUrl("did:plc:abc", { ref: { $link: "bafc" } })).toBe(
      "https://bsky.social/xrpc/com.atproto.sync.getBlob?did=did:plc:abc&cid=bafc",
    );
    expect(blobUrl(null, { ref: { $link: "bafc" } })).toBeNull();
    expect(blobUrl("did:plc:abc", {})).toBeNull();
  });

  it("authorList joins tab-separated authors", () => {
    expect(authorList("Jane\tJohn")).toBe("Jane, John");
    expect(authorList(undefined)).toBe("");
  });

  it("isReading matches the bookhive reading status", () => {
    expect(isReading({ value: { status: "buzz.bookhive.defs#reading" } })).toBe(true);
    expect(isReading({ value: { status: "buzz.bookhive.defs#finished" } })).toBe(false);
    expect(isReading({})).toBe(false);
  });

  it("mapBook maps a bookhive record to a view model", () => {
    const rec = {
      uri: "at://did:plc:abc/buzz.bookhive.book/1",
      value: {
        title: "Dune",
        authors: "Frank Herbert",
        status: "buzz.bookhive.defs#reading",
        cover: { ref: { $link: "bafc" } },
      },
    };
    expect(mapBook(rec)).toEqual({
      title: "Dune",
      author: "Frank Herbert",
      cover: "https://bsky.social/xrpc/com.atproto.sync.getBlob?did=did:plc:abc&cid=bafc",
    });
  });

  it("mapTrack maps a teal.fm play record to a view model", () => {
    const rec = {
      uri: "at://did:plc:abc/fm.teal.alpha.feed.play/1",
      value: {
        trackName: "Song",
        artistNames: ["X"],
        releaseMbId: "mbid:0fc05d92-255c-4a91-b3ed-abcdefabcdef",
      },
    };
    expect(mapTrack(rec)).toEqual({
      name: "Song",
      artist: "X",
      cover: "https://coverartarchive.org/release/0fc05d92-255c-4a91-b3ed-abcdefabcdef/front-250",
    });
  });
});
