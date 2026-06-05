import { useEffect, useRef } from "react";
import { EditorState, EditorSelection, RangeSetBuilder } from "@codemirror/state";
import {
  EditorView,
  Decoration,
  WidgetType,
  ViewPlugin,
  keymap,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { islandKeys, islandLabel } from "../../islands/catalogue";

// Inline Markdown styling: the source stays visible (StackEdit/Obsidian-style),
// but headings render large, bold renders bold, markers are de-emphasised, etc.
const markdownHighlight = HighlightStyle.define([
  { tag: tags.heading1, fontSize: "1.6em", fontWeight: "700", lineHeight: "1.3" },
  { tag: tags.heading2, fontSize: "1.4em", fontWeight: "700", lineHeight: "1.3" },
  { tag: tags.heading3, fontSize: "1.2em", fontWeight: "700" },
  { tag: tags.heading, fontWeight: "700" },
  { tag: tags.strong, fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.link, color: "var(--admin-accent, #4f6df5)", textDecoration: "underline" },
  { tag: tags.url, color: "var(--admin-muted, #888)" },
  {
    tag: tags.monospace,
    fontFamily: "var(--font-mono, ui-monospace, monospace)",
    background: "color-mix(in srgb, currentColor 8%, transparent)",
    borderRadius: "0.25rem",
    padding: "0 0.2em",
  },
  { tag: tags.quote, color: "var(--admin-muted, #888)", fontStyle: "italic" },
  { tag: tags.processingInstruction, color: "color-mix(in srgb, currentColor 45%, transparent)" },
  { tag: tags.contentSeparator, color: "var(--admin-muted, #888)" },
]);

const editorTheme = EditorView.theme({
  "&": { fontSize: "0.95rem", borderRadius: "0.4rem" },
  ".cm-content": {
    fontFamily: "var(--font-sans, system-ui, sans-serif)",
    padding: "0.75rem",
    lineHeight: "1.6",
    caretColor: "var(--admin-accent, #4f6df5)",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-island-chip": {
    display: "inline-block",
    padding: "0.1rem 0.5rem",
    borderRadius: "0.4rem",
    background: "color-mix(in srgb, var(--admin-accent, #4f6df5) 14%, transparent)",
    border: "1px solid color-mix(in srgb, var(--admin-accent, #4f6df5) 40%, transparent)",
    fontSize: "0.85em",
    fontFamily: "var(--font-mono, ui-monospace, monospace)",
    cursor: "text",
  },
});

const ISLAND_RE = /^::island\[([^\]]+)\](\{[^}]*\})?\s*$/;

class IslandWidget extends WidgetType {
  constructor(
    readonly key: string,
    readonly propsText: string,
  ) {
    super();
  }
  eq(other: IslandWidget) {
    return other.key === this.key && other.propsText === this.propsText;
  }
  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-island-chip";
    span.textContent = `🧩 ${islandLabel(this.key)}${this.propsText ? ` ${this.propsText}` : ""}`;
    return span;
  }
  ignoreEvent() {
    return false; // let clicks place the cursor on the line, revealing the source
  }
}

function buildIslandDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const { selection } = view.state;
  for (const { from, to } of view.visibleRanges) {
    let pos = from;
    while (pos <= to) {
      const line = view.state.doc.lineAt(pos);
      const match = ISLAND_RE.exec(line.text);
      if (match) {
        const cursorOnLine = selection.ranges.some((r) => r.from <= line.to && r.to >= line.from);
        if (!cursorOnLine) {
          builder.add(
            line.from,
            line.to,
            Decoration.replace({ widget: new IslandWidget(match[1], match[2] ?? "") }),
          );
        }
      }
      pos = line.to + 1;
    }
  }
  return builder.finish();
}

const islandDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildIslandDecorations(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = buildIslandDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations },
);

function wrapSelection(view: EditorView, before: string, after = before) {
  const { state } = view;
  view.dispatch(
    state.changeByRange((range) => {
      const text = state.sliceDoc(range.from, range.to);
      return {
        changes: { from: range.from, to: range.to, insert: `${before}${text}${after}` },
        range: EditorSelection.range(
          range.from + before.length,
          range.from + before.length + text.length,
        ),
      };
    }),
  );
  view.focus();
}

function toggleLinePrefix(view: EditorView, prefix: string) {
  const { state } = view;
  const line = state.doc.lineAt(state.selection.main.head);
  const already = line.text.startsWith(prefix);
  view.dispatch({
    changes: already
      ? { from: line.from, to: line.from + prefix.length, insert: "" }
      : { from: line.from, insert: prefix },
  });
  view.focus();
}

function insertLink(view: EditorView) {
  const { state } = view;
  const range = state.selection.main;
  const text = state.sliceDoc(range.from, range.to) || "text";
  view.dispatch({
    changes: { from: range.from, to: range.to, insert: `[${text}](url)` },
    selection: { anchor: range.from + 1, head: range.from + 1 + text.length },
  });
  view.focus();
}

function insertIsland(view: EditorView, key: string) {
  const pos = view.state.selection.main.head;
  const insert = `\n::island[${key}]\n`;
  view.dispatch({ changes: { from: pos, insert }, selection: { anchor: pos + insert.length } });
  view.focus();
}

const markdownKeymap = [
  { key: "Mod-b", run: (view: EditorView) => (wrapSelection(view, "**"), true) },
  { key: "Mod-i", run: (view: EditorView) => (wrapSelection(view, "*"), true) },
];

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  islands?: string[];
}

export function MarkdownEditor({ value, onChange, islands = islandKeys }: MarkdownEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;
    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          keymap.of([...markdownKeymap, ...defaultKeymap, ...historyKeymap]),
          markdown(),
          syntaxHighlighting(markdownHighlight),
          EditorView.lineWrapping,
          islandDecorations,
          editorTheme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Mount once; external value changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (value !== current) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  const run = (fn: (view: EditorView) => void) => () => {
    if (viewRef.current) fn(viewRef.current);
  };
  const hold = (event: React.MouseEvent) => event.preventDefault(); // keep editor selection

  return (
    <div className="admin__md">
      <div className="admin__md-toolbar">
        <button type="button" className="admin__md-tool" onMouseDown={hold} onClick={run((v) => wrapSelection(v, "**"))} title="Bold (⌘B)">
          <b>B</b>
        </button>
        <button type="button" className="admin__md-tool" onMouseDown={hold} onClick={run((v) => wrapSelection(v, "*"))} title="Italic (⌘I)">
          <i>I</i>
        </button>
        <button type="button" className="admin__md-tool" onMouseDown={hold} onClick={run((v) => toggleLinePrefix(v, "# "))} title="Heading 1">
          H1
        </button>
        <button type="button" className="admin__md-tool" onMouseDown={hold} onClick={run((v) => toggleLinePrefix(v, "## "))} title="Heading 2">
          H2
        </button>
        <button type="button" className="admin__md-tool" onMouseDown={hold} onClick={run((v) => toggleLinePrefix(v, "> "))} title="Quote">
          ❝
        </button>
        <button type="button" className="admin__md-tool" onMouseDown={hold} onClick={run((v) => toggleLinePrefix(v, "- "))} title="List">
          •
        </button>
        <button type="button" className="admin__md-tool" onMouseDown={hold} onClick={run((v) => wrapSelection(v, "`"))} title="Inline code">
          {"</>"}
        </button>
        <button type="button" className="admin__md-tool" onMouseDown={hold} onClick={run(insertLink)} title="Link">
          🔗
        </button>
        <span className="admin__md-spacer" />
        <select
          className="admin__md-tool"
          value=""
          onMouseDown={hold}
          onChange={(event) => {
            const key = event.target.value;
            if (key && viewRef.current) insertIsland(viewRef.current, key);
            event.target.value = "";
          }}
          title="Insert an interactive island"
        >
          <option value="">+ Island…</option>
          {islands.map((key) => (
            <option key={key} value={key}>
              {islandLabel(key)}
            </option>
          ))}
        </select>
      </div>
      <div className="admin__md-editor" ref={containerRef} />
    </div>
  );
}
