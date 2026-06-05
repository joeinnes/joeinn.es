// The catalogue of interactive widgets ("islands") that a blog post may embed.
//
// This is the single source of truth for *which* islands exist and *what props*
// they take — it describes repo-side component code, so it lives in the repo
// (not the PDS). A post references an island by `key` via a Markdown directive
// (`::island[key]{prop=value}`); the renderer resolves the key to the actual
// Svelte/React component (see the component map in PostBody.astro). No component
// code is ever stored in or executed from the PDS.
//
// This module is pure metadata — safe to import from both the React admin
// editor (the insert-island picker) and the Astro renderer.

export interface IslandPropDef {
  type: "string" | "number" | "boolean";
  default?: string | number | boolean;
  label?: string;
}

export interface IslandDef {
  key: string;
  label: string;
  description?: string;
  props: Record<string, IslandPropDef>;
}

export const islandCatalogue: Record<string, IslandDef> = {
  pomodoro: {
    key: "pomodoro",
    label: "Pomodoro Timer",
    description: "A 25-minute focus timer.",
    props: {},
  },
  howMuchTime: {
    key: "howMuchTime",
    label: "How Much Time",
    description: "Time-remaining visualisation.",
    props: {},
  },
  weather: {
    key: "weather",
    label: "Weather",
    description: "Current weather display.",
    props: {},
  },
  limo: {
    key: "limo",
    label: "Limo Calculator",
    props: {},
  },
  colourSwatch: {
    key: "colourSwatch",
    label: "Colour Swatch",
    description: "An HSL colour swatch.",
    props: {
      h: { type: "number", default: 0, label: "Hue" },
      s: { type: "number", default: 0, label: "Saturation" },
      l: { type: "number", default: 0, label: "Lightness" },
    },
  },
  fontSample: {
    key: "fontSample",
    label: "Font Sample",
    props: {
      fontName: { type: "string" },
      fontSrc: { type: "string" },
      wordTest: { type: "string", default: "Be Traist" },
      pinHue: { type: "number" },
    },
  },
};

export const islandKeys = Object.keys(islandCatalogue);

export function islandLabel(key: string): string {
  return islandCatalogue[key]?.label ?? key;
}

/**
 * Coerce raw directive attribute strings (everything parses as a string) into
 * the prop types declared in the catalogue, filling in defaults for any
 * declared prop the author omitted.
 */
export function coerceProps(key: string, raw: Record<string, string>): Record<string, unknown> {
  const def = islandCatalogue[key];
  const out: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(raw)) {
    const type = def?.props[name]?.type;
    out[name] =
      type === "number" ? Number(value) : type === "boolean" ? value !== "false" : value;
  }
  if (def) {
    for (const [name, prop] of Object.entries(def.props)) {
      if (!(name in out) && prop.default !== undefined) out[name] = prop.default;
    }
  }
  return out;
}
