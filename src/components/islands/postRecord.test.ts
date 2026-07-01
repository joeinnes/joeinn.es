import { describe, it, expect } from "vitest";
import { buildPostRecord, toPortableMarkdown } from "./postRecord";
import { renderPostBody } from "./renderPostBody";

// One island-aware source → two tracks: a portable standard.site body (widgets
// stripped, for cross-app interop) and a rich body our own site hydrates.
const SOURCE = `# Hello

Intro paragraph.

::island[pomodoro]

More prose here.

::island[colourSwatch]{h=210 s=80 l=50}

Closing words.`;

const META = {
  title: "Hello",
  slug: "hello",
  publishedAt: "2026-07-01T00:00:00.000Z",
  markdown: SOURCE,
};

describe("dual-track post record", () => {
  it("portable half strips island directives to a notice, keeps prose", () => {
    const text = toPortableMarkdown(SOURCE, "https://joeinn.es/blog/hello");
    expect(text).not.toContain("::island");
    expect(text).toContain("Intro paragraph.");
    expect(text).toContain("Closing words.");
    expect(text).toContain("interactive component");
    expect(text).toContain("https://joeinn.es/blog/hello");
  });

  it("rich half preserves islands so the site can hydrate them", () => {
    const { richBody } = buildPostRecord(META, "https://joeinn.es");
    const islands = renderPostBody(richBody).filter((b) => b.type === "island");
    expect(islands).toEqual([
      { type: "island", key: "pomodoro", props: {} },
      { type: "island", key: "colourSwatch", props: { h: "210", s: "80", l: "50" } },
    ]);
  });

  it("emits a standard.site document for interop", () => {
    const { document } = buildPostRecord({ ...META, description: "hi" }, "https://joeinn.es");
    expect(document.path).toBe("/blog/hello");
    expect(document.content.$type).toBe("site.standard.content.markdown");
    expect(document.content.text).not.toContain("::island");
    expect(document.description).toBe("hi");
  });
});
