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

// Legacy `<Tweet tweet={{ content: `…`, authorName: "…", … }} />` embeds carry
// rich HTML in a nested object — impossible to express as a directive attribute.
// These are static historical tweets, so flatten each to a Markdown blockquote
// (the inline HTML in the content still renders).
function flattenTweets(text: string): string {
  return text.replace(/<Tweet\s+tweet=\{\{([\s\S]*?)\}\}\s*\/>/g, (_m, obj: string) => {
    const field = (re: RegExp) => re.exec(obj)?.[1]?.trim() ?? "";
    const content = field(/content:\s*`([\s\S]*?)`\s*,/).replace(/\s*\n\s*/g, " ");
    const authorName = field(/authorName:\s*"([^"]*)"/);
    const authorHandle = field(/authorHandle:\s*"([^"]*)"/);
    const date = field(/date:\s*"([^"]*)"/);
    const link = field(/link:\s*"([^"]*)"/);
    const dateText = link && date ? `[${date}](${link})` : date;
    const attribution = [`— ${authorName}`, authorHandle && `(${authorHandle})`, dateText]
      .filter(Boolean)
      .join(" ");
    return `\n> ${content}\n>\n> ${attribution}\n`;
  });
}

// Rewrite the prose (non-code) part of a body: flatten tweets, drop ESM wiring,
// convert self-closing components to directives, and promote each directive to
// its own block so it parses even when wrapped in a styling element.
function convertProse(text: string): string {
  return flattenTweets(text)
    .replace(
      /^[ \t]*(?:import|export)\b[^\n]*\bfrom[ \t]*\r?\n[ \t]*["'][^"'\n]*["'];?[ \t]*$/gm,
      "",
    )
    .replace(/^[ \t]*(?:import|export)\b.*\r?\n?/gm, "")
    .replace(/<([A-Z][\w.]*)\b([^>]*?)\/>/g, (_m, name: string, attrs: string) =>
      componentToDirective(name, attrs),
    )
    .replace(/^[ \t]*(::island\[[^\]]+\](?:\{[^}]*\})?)[ \t]*$/gm, "\n$1\n");
}

interface Segment {
  text: string;
  code: boolean;
}

// Split a body into alternating prose / fenced-code segments so conversion never
// touches code examples (a post *about* React has `import`s and `<Component/>`
// inside ``` fences that are content, not wiring to strip).
function splitFences(body: string): Segment[] {
  const lines = body.split("\n");
  const segments: Segment[] = [];
  let buffer: string[] = [];
  let fence: string | null = null;
  const flush = (code: boolean) => {
    segments.push({ text: buffer.join("\n"), code });
    buffer = [];
  };
  for (const line of lines) {
    const open = /^[ \t]*(```+|~~~+)/.exec(line);
    if (fence === null && open) {
      flush(false);
      fence = open[1][0];
      buffer.push(line);
    } else if (fence !== null && new RegExp(`^[ \\t]*[${fence}]{3,}[ \\t]*$`).test(line)) {
      buffer.push(line);
      flush(true);
      fence = null;
    } else {
      buffer.push(line);
    }
  }
  flush(fence !== null); // an unterminated fence is treated as code, to be safe
  return segments;
}

/**
 * Rewrite the JSX component usages in an MDX post body into `::island` leaf
 * directives. Fenced code blocks are left verbatim; in prose it flattens legacy
 * <Tweet> embeds, drops ESM wiring, converts self-closing component tags
 * (`<Comp a={1} b="x" c />`) to `::island[key]{a=1 b=x c=true}`, and leaves
 * ordinary prose alone. Pure and synchronous.
 */
export function convertMdxToIslands(mdxBody: string): string {
  const out = splitFences(mdxBody)
    .map((seg) => (seg.code ? seg.text : convertProse(seg.text)))
    .join("\n");
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Reasons a converted body still can't be safely published as a record: a TODO
 * marker (unknown component) or a leftover component tag — but only in prose,
 * not inside code blocks (where `<Component>` is just example text). An empty
 * array means the post is clean to migrate.
 */
export function unmigratableReasons(convertedBody: string): string[] {
  const prose = splitFences(convertedBody)
    .filter((s) => !s.code)
    .map((s) => s.text)
    .join("\n");
  const reasons: string[] = [];
  if (/TODO: manually migrate/.test(prose)) reasons.push("unknown component");
  const tag = /<([A-Z][A-Za-z0-9]*)[\s/>]/.exec(prose);
  if (tag) reasons.push(`leftover <${tag[1]}>`);
  if (/^[ \t]*import\b/m.test(prose)) reasons.push("leftover import");
  return reasons;
}
