import { describe, it, expect } from "vitest";
import { mapShipped, mapShippedDigest, type PdsRecord } from "./pds";

describe("pds shipped mappers", () => {
  it("mapShipped maps an es.joeinn.shipped record to a view model with a Date mergedAt", () => {
    const rec: PdsRecord = {
      uri: "at://did:plc:abc/es.joeinn.shipped/3mpj62dsv4e27",
      value: {
        $type: "es.joeinn.shipped",
        summary: "Fixed a race in the sync engine",
        repo: "garden-co/jazz",
        prNumber: "986",
        url: "https://github.com/garden-co/jazz/pull/986",
        description: "A longer markdown body.",
        mergedAt: "2026-06-04T00:00:00.000Z",
        createdAt: "2026-06-04T00:00:00.000Z",
      },
    };
    const view = mapShipped(rec);
    expect(view).toEqual({
      summary: "Fixed a race in the sync engine",
      repo: "garden-co/jazz",
      prNumber: "986",
      url: "https://github.com/garden-co/jazz/pull/986",
      description: "A longer markdown body.",
      mergedAt: new Date("2026-06-04T00:00:00.000Z"),
    });
    expect(view.mergedAt).toBeInstanceOf(Date);
  });

  it("mapShipped yields a null description when the record omits the optional body", () => {
    const rec: PdsRecord = {
      uri: "at://did:plc:abc/es.joeinn.shipped/1",
      value: {
        summary: "Small doc tweak",
        repo: "owner/name",
        prNumber: "3",
        url: "https://github.com/owner/name/pull/3",
        mergedAt: "2026-05-01T00:00:00.000Z",
        createdAt: "2026-05-01T00:00:00.000Z",
      },
    };
    expect(mapShipped(rec).description).toBeNull();
  });

  it("mapShippedDigest maps an es.joeinn.shippedDigest record with Date period bounds", () => {
    const rec: PdsRecord = {
      uri: "at://did:plc:abc/es.joeinn.shippedDigest/3mpj5v6io7t2j",
      value: {
        $type: "es.joeinn.shippedDigest",
        title: "May 2026",
        startDate: "2026-05-01T00:00:00.000Z",
        endDate: "2026-05-31T00:00:00.000Z",
        summary: "A multi-paragraph digest.\n\nWith newlines.",
        createdAt: "2026-05-01T00:00:00.000Z",
      },
    };
    const view = mapShippedDigest(rec);
    expect(view).toEqual({
      title: "May 2026",
      startDate: new Date("2026-05-01T00:00:00.000Z"),
      endDate: new Date("2026-05-31T00:00:00.000Z"),
      summary: "A multi-paragraph digest.\n\nWith newlines.",
    });
    expect(view.startDate).toBeInstanceOf(Date);
    expect(view.endDate).toBeInstanceOf(Date);
  });

  it("mapShippedDigest yields a null title when the record omits the optional label", () => {
    const rec: PdsRecord = {
      uri: "at://did:plc:abc/es.joeinn.shippedDigest/2",
      value: {
        startDate: "2026-04-01T00:00:00.000Z",
        endDate: "2026-04-30T00:00:00.000Z",
        summary: "Digest without a title.",
        createdAt: "2026-04-01T00:00:00.000Z",
      },
    };
    expect(mapShippedDigest(rec).title).toBeNull();
  });
});
