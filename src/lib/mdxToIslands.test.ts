import { describe, it, expect } from "vitest";
import { convertMdxToIslands, componentIslandMap, unmigratableReasons } from "./mdxToIslands";

describe("convertMdxToIslands", () => {
  it("rewrites a self-closing component with numeric expression props", () => {
    expect(convertMdxToIslands("<ColourSwatch h={201} s={85} l={31} />")).toBe(
      "::island[colourSwatch]{h=201 s=85 l=31}",
    );
  });

  it("maps string, spaced-string and numeric props, quoting only where needed", () => {
    expect(
      convertMdxToIslands('<FontSample fontName="Avenir" wordTest="Be Traist" pinHue={201} />'),
    ).toBe('::island[fontSample]{fontName=Avenir wordTest="Be Traist" pinHue=201}');
  });

  it("quotes a URL-like string value that carries punctuation", () => {
    const mdx =
      '<FontSample\n' +
      '  fontName="Satoshi"\n' +
      '  fontSrc="https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap"\n' +
      '  wordTest="Wigglesworth"\n' +
      "/>";
    expect(convertMdxToIslands(mdx)).toBe(
      '::island[fontSample]{fontName=Satoshi ' +
        'fontSrc="https://api.fontshare.com/v2/css?f[]=satoshi@1&display=swap" ' +
        "wordTest=Wigglesworth}",
    );
  });

  it("handles boolean shorthand and explicit boolean expressions", () => {
    expect(
      convertMdxToIslands("<ColourSwatch h={200} outlined dark={true} muted={false} />"),
    ).toBe("::island[colourSwatch]{h=200 outlined=true dark=true muted=false}");
  });

  it("preserves a simple arithmetic expression by quoting it verbatim", () => {
    expect(convertMdxToIslands("<ColourSwatch h={360 - 201} label={'hi'} />")).toBe(
      '::island[colourSwatch]{h="360 - 201" label=hi}',
    );
  });

  it("drops Astro hydration directives such as client:only", () => {
    expect(
      convertMdxToIslands('<VoterPowerCalculator year={2024} client:only="svelte" />'),
    ).toBe("::island[voterPower]{year=2024}");
  });

  it("emits a bare directive for a component with no props", () => {
    expect(convertMdxToIslands("<PomodoroTimer />")).toBe("::island[pomodoro]");
    expect(convertMdxToIslands("<HowMuchTime/>")).toBe("::island[howMuchTime]");
  });

  it("removes the corresponding ESM import lines", () => {
    const mdx =
      'import ColourSwatch from "../../components/ColourSwatch.svelte";\n' +
      "\n" +
      "Here is a swatch:\n" +
      "\n" +
      "<ColourSwatch h={201} s={85} l={31} />";
    const out = convertMdxToIslands(mdx);
    expect(out).not.toContain("import");
    expect(out).toBe("Here is a swatch:\n\n::island[colourSwatch]{h=201 s=85 l=31}");
  });

  it("leaves ordinary prose untouched", () => {
    const prose =
      "# Heading\n" +
      "\n" +
      "Just some **prose** with no components.\n" +
      "\n" +
      "- a list item\n" +
      "- another";
    expect(convertMdxToIslands(prose)).toBe(prose);
  });

  it("leaves an unmapped component as a TODO marker without crashing", () => {
    const out = convertMdxToIslands('<SomeRandom foo="bar" />');
    expect(out).toContain("TODO");
    expect(out).toContain("SomeRandom");
    expect(out).not.toContain("::island");
  });

  it("converts a mix of prose, mapped and unmapped components in order", () => {
    const mdx =
      'import PomodoroTimer from "../../components/PomodoroTimer.svelte";\n' +
      "\n" +
      "Intro paragraph.\n" +
      "\n" +
      "<PomodoroTimer />\n" +
      "\n" +
      "<MysteryWidget count={3} />\n" +
      "\n" +
      "Outro paragraph.";
    const out = convertMdxToIslands(mdx);
    expect(out).toBe(
      "Intro paragraph.\n" +
        "\n" +
        "::island[pomodoro]\n" +
        "\n" +
        '<!-- TODO: manually migrate the "MysteryWidget" component to an island -->\n' +
        "\n" +
        "Outro paragraph.",
    );
  });

  it("exposes the component -> island key mapping", () => {
    expect(componentIslandMap.Tweet.islandKey).toBe("tweet");
    expect(componentIslandMap.F1Grid.islandKey).toBe("f1Grid");
    expect(componentIslandMap.ColourSwatch.props.map((p) => p.name)).toEqual(["h", "s", "l"]);
  });

  it("removes a multi-line default import broken after `from`", () => {
    const mdx =
      "import VoterPowerCalculator from\n" +
      '  "../../components/VoterPowerCalculator.svelte";\n' +
      "\n" +
      "Body text.\n" +
      "\n" +
      "<VoterPowerCalculator year={2015} />";
    const out = convertMdxToIslands(mdx);
    expect(out).not.toContain("VoterPowerCalculator.svelte");
    expect(out).not.toContain("import");
    expect(out).toBe("Body text.\n\n::island[voterPower]{year=2015}");
  });

  it("promotes a directive to its own block when the source wrapped it in HTML", () => {
    const mdx =
      '<div class="p-2 rounded shadow">\n' +
      "<ColourSwatch h={201} s={85} l={31} />\n" +
      "</div>";
    // Blank lines either side of the directive let remark parse it instead of
    // swallowing it into the surrounding HTML block.
    expect(convertMdxToIslands(mdx)).toBe(
      '<div class="p-2 rounded shadow">\n\n::island[colourSwatch]{h=201 s=85 l=31}\n\n</div>',
    );
  });

  it("leaves fenced code blocks untouched (imports and JSX inside are content)", () => {
    const mdx =
      "Here's an example:\n\n" +
      "```jsx\n" +
      "import App from './App';\n" +
      "ReactDOM.render(<App />, root);\n" +
      "```\n\n" +
      "<PomodoroTimer />";
    const out = convertMdxToIslands(mdx);
    expect(out).toContain("import App from './App';");
    expect(out).toContain("ReactDOM.render(<App />, root);");
    expect(out).toContain("::island[pomodoro]");
  });

  it("flattens a legacy <Tweet tweet={{…}} /> embed to an attributed blockquote", () => {
    const mdx = [
      "<Tweet",
      "  tweet={{",
      '    content: `Hello <a href="x">world</a>`,',
      '    authorName: "Jane Doe",',
      '    authorHandle: "@jane",',
      '    date: "April 4, 2018",',
      '    link: "https://example.com/1",',
      "  }}",
      "/>",
    ].join("\n");
    const out = convertMdxToIslands(mdx);
    expect(out).not.toContain("<Tweet");
    expect(out).toContain('> Hello <a href="x">world</a>');
    expect(out).toContain("> — Jane Doe (@jane) [April 4, 2018](https://example.com/1)");
  });

  it("unmigratableReasons flags prose components but ignores those inside code", () => {
    expect(unmigratableReasons("```\n<Card />\n```\n\nclean prose")).toEqual([]);
    expect(unmigratableReasons("<Card>paired</Card>")).toContain("leftover <Card>");
    expect(unmigratableReasons("just prose, no components")).toEqual([]);
  });
});
