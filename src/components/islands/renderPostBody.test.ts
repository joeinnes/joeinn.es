import { describe, it, expect } from "vitest";
import { renderPostBody, type Block } from "./renderPostBody";

function islands(blocks: Block[]) {
  return blocks.filter((b): b is Extract<Block, { type: "island" }> => b.type === "island");
}

describe("renderPostBody", () => {
  it("renders plain markdown as a single HTML block", () => {
    const blocks = renderPostBody("# Title\n\nSome **bold** text.");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("html");
    const html = (blocks[0] as { html: string }).html;
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("splits prose and island directives into ordered blocks", () => {
    const md = "# T\n\nbefore\n\n::island[pomodoro]\n\nmiddle\n\n::island[colourSwatch]{h=210 s=80 l=50}\n\nafter";
    const blocks = renderPostBody(md);
    expect(blocks.map((b) => b.type)).toEqual(["html", "island", "html", "island", "html"]);

    const found = islands(blocks);
    expect(found[0]).toEqual({ type: "island", key: "pomodoro", props: {} });
    expect(found[1]).toEqual({
      type: "island",
      key: "colourSwatch",
      props: { h: "210", s: "80", l: "50" },
    });
  });

  it("keeps directive attributes as raw strings (coercion happens at render)", () => {
    const blocks = renderPostBody("::island[fontSample]{fontName=Inter pinHue=200}");
    expect(islands(blocks)[0]).toEqual({
      type: "island",
      key: "fontSample",
      props: { fontName: "Inter", pinHue: "200" },
    });
  });

  it("handles an island at the very start with no surrounding prose", () => {
    const blocks = renderPostBody("::island[pomodoro]");
    expect(blocks).toEqual([{ type: "island", key: "pomodoro", props: {} }]);
  });

  it("returns no blocks for empty input", () => {
    expect(renderPostBody("")).toEqual([]);
    expect(renderPostBody("   \n\n  ")).toEqual([]);
  });
});
