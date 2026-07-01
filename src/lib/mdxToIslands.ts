// Pure MDX -> island-directive converter. Rewrites the interactive JSX
// components a legacy Keystatic post embeds (`<ColourSwatch h={201} .../>`) into
// the `::island[key]{prop=value}` leaf directives the home-rolled admin renders
// (see src/components/islands/renderPostBody.ts). This is the migration step that
// lets a post live as plain Markdown + directives on the PDS, with no component
// code stored or executed there.
//
// The regex strategy mirrors stripMdxComponents in
// scripts/standard-site/sources.mjs (drop ESM wiring, then match self-closing
// component tags), but instead of collapsing each component to a notice we emit a
// directive that names the island and carries its props.

export interface ComponentPropDef {
  name: string;
  type: string;
}

export interface ComponentIslandMapEntry {
  islandKey: string;
  props: ComponentPropDef[];
}

// Component name -> island key + declared props. The catalogue in
// src/components/islands/catalogue.ts is the render-side source of truth; this
// map is the authoring-side bridge from the old JSX component names.
export const componentIslandMap: Record<string, ComponentIslandMapEntry> = {
  PomodoroTimer: { islandKey: "pomodoro", props: [] },
  HowMuchTime: { islandKey: "howMuchTime", props: [] },
  WeatherDisplay: { islandKey: "weather", props: [] },
  LimoCalculator: { islandKey: "limo", props: [] },
  ColourSwatch: {
    islandKey: "colourSwatch",
    props: [
      { name: "h", type: "number" },
      { name: "s", type: "number" },
      { name: "l", type: "number" },
    ],
  },
  FontSample: {
    islandKey: "fontSample",
    props: [
      { name: "fontName", type: "string" },
      { name: "fontSrc", type: "string" },
      { name: "wordTest", type: "string" },
      { name: "pinHue", type: "number" },
    ],
  },
  VoterPowerCalculator: {
    islandKey: "voterPower",
    props: [{ name: "year", type: "number" }],
  },
  F1Grid: {
    islandKey: "f1Grid",
    props: [{ name: "results", type: "string[]" }],
  },
  Tweet: {
    islandKey: "tweet",
    props: [
      { name: "content", type: "string" },
      { name: "authorName", type: "string" },
      { name: "authorHandle", type: "string" },
      { name: "link", type: "string" },
      { name: "date", type: "string" },
    ],
  },
};

// A single JSX attribute: a name plus an optional value, where the value is a
// double- or single-quoted string, or a single-level `{expression}`. Nested
// braces (e.g. Tweet's `tweet={{ … }}`) are deliberately out of scope — those
// authoring shapes are migrated by hand.
const ATTR_RE = /([A-Za-z_][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^{}]*)\}))?/g;

// Reduce a `{expression}` value to a directive-friendly scalar. Booleans and
// plain numbers pass through; a quoted literal is unwrapped; anything else is a
// "simple expression" preserved verbatim for a human to resolve later.
function normaliseExpression(raw: string): string {
  const expr = raw.trim();
  if (expr === "true" || expr === "false") return expr;
  if (/^-?\d+(?:\.\d+)?$/.test(expr)) return expr;
  const quoted = /^"(.*)"$/s.exec(expr) ?? /^'(.*)'$/s.exec(expr);
  if (quoted) return quoted[1];
  return expr;
}

// Format a resolved value for a directive attribute. Simple word-like values are
// left bare; anything with whitespace or punctuation is double-quoted so the
// directive parser keeps it intact.
function formatDirectiveValue(value: string): string {
  if (/^[\w.-]+$/.test(value)) return value;
  return `"${value.replace(/"/g, "&quot;")}"`;
}

// Turn the raw attribute text of a component tag into ordered `name=value`
// directive tokens. Astro hydration and other namespaced attributes
// (`client:only="svelte"`) are dropped — they aren't island props.
function parseAttributes(attrs: string): string[] {
  const tokens: string[] = [];
  let match: RegExpExecArray | null;
  ATTR_RE.lastIndex = 0;
  while ((match = ATTR_RE.exec(attrs)) !== null) {
    const [, name, doubleQuoted, singleQuoted, expression] = match;
    if (name.includes(":")) continue;
    let value: string;
    if (doubleQuoted !== undefined) value = doubleQuoted;
    else if (singleQuoted !== undefined) value = singleQuoted;
    else if (expression !== undefined) value = normaliseExpression(expression);
    else value = "true"; // Boolean shorthand: `<Comp c />` -> `c=true`.
    tokens.push(`${name}=${formatDirectiveValue(value)}`);
  }
  return tokens;
}

// Convert one matched self-closing component into its island directive. An
// unrecognised component is left as a TODO marker comment rather than crashing,
// so a partially migratable post still round-trips.
function componentToDirective(name: string, attrs: string): string {
  const entry = componentIslandMap[name];
  if (!entry) {
    return `<!-- TODO: manually migrate the "${name}" component to an island -->`;
  }
  const tokens = parseAttributes(attrs);
  return tokens.length
    ? `::island[${entry.islandKey}]{${tokens.join(" ")}}`
    : `::island[${entry.islandKey}]`;
}

/**
 * Rewrite the JSX component usages in an MDX post body into `::island` leaf
 * directives. Drops ESM import/export wiring lines, converts every self-closing
 * component tag (`<Comp a={1} b="x" c />`) to `::island[key]{a=1 b=x c=true}`
 * using componentIslandMap, and leaves ordinary prose alone. Pure and
 * synchronous, so it is usable at build time and in unit tests alike.
 */
export function convertMdxToIslands(mdxBody: string): string {
  const out = mdxBody
    // Drop ESM import/export lines (component wiring the island format has no use for).
    .replace(/^[ \t]*(?:import|export)\b.*\n?/gm, "")
    // Rewrite self-closing component usages (uppercase-initial tags) into directives.
    .replace(/<([A-Z][\w.]*)\b([^>]*?)\/>/g, (_match, name: string, attrs: string) =>
      componentToDirective(name, attrs),
    );

  // Tidy the blank lines left where imports were, without disturbing prose.
  return out.replace(/\n{3,}/g, "\n\n").trim();
}
