import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homepage = readFileSync(new URL("./pages/index.astro", import.meta.url), "utf8");
const nowPage = readFileSync(new URL("./pages/now/index.astro", import.meta.url), "utf8");

describe("homepage illustration links", () => {
  it.each([
    ["window", "/now", "See what Joe is doing now"],
    ["laptop", "/i-shipped", "See what Joe has shipped"],
    ["guitar", "/now#listening", "See what Joe is listening to"],
  ])("links the %s accessibly", (object, href, label) => {
    expect(homepage).toContain(`class="hotspot hotspot--${object}"`);
    expect(homepage).toContain(`href="${href}"`);
    expect(homepage).toContain(`aria-label="${label}"`);
  });

  it("provides the listening destination", () => {
    expect(nowPage).toContain('id="listening"');
  });
});
