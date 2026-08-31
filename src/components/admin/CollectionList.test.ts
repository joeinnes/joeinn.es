import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  loadCollectionPreferences,
  organiseCollections,
  saveCollectionPreferences,
} from "./CollectionList";
import type { StorageLike } from "./lexicons/registry";

const collectionListSource = readFileSync(new URL("./CollectionList.tsx", import.meta.url), "utf8");

function memoryStorage(initial: string | null = null): StorageLike {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_key, next) => {
      value = next;
    },
  };
}

describe("collection preferences", () => {
  it("keeps the friendly-name input hidden until rename is toggled", () => {
    expect(collectionListSource).toContain("editingNsid === nsid");
    expect(collectionListSource).toContain('{editingNsid === nsid ? "Done" : "Rename"}');
  });

  it("puts pinned collections first, sorts by friendly name, and separates hidden collections", () => {
    const result = organiseCollections(
      ["com.example.notes", "es.joeinn.blog.post", "es.joeinn.shipped"],
      {
        "com.example.notes": { hidden: true },
        "es.joeinn.blog.post": { name: "Blog posts" },
        "es.joeinn.shipped": { name: "Shipped work", pinned: true },
      },
    );

    expect(result).toEqual({
      visible: ["es.joeinn.shipped", "es.joeinn.blog.post"],
      hidden: ["com.example.notes"],
    });
  });

  it("round-trips valid preferences and ignores malformed browser data", () => {
    const storage = memoryStorage();
    const preferences = { "es.joeinn.blog.post": { name: "Blog posts", pinned: true } };

    saveCollectionPreferences(storage, preferences);

    expect(loadCollectionPreferences(storage)).toEqual(preferences);
    expect(loadCollectionPreferences(memoryStorage("not json"))).toEqual({});
    expect(loadCollectionPreferences(memoryStorage('{"es.joeinn.blog.post":"wrong"}'))).toEqual({});
  });
});
