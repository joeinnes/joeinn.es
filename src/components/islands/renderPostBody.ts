import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { Root, RootContent } from "mdast";

// An ordered piece of a rendered post body: either a chunk of prose (already
// rendered to HTML) or a reference to an interactive island to hydrate.
export type Block =
  | { type: "html"; html: string }
  | { type: "island"; key: string; props: Record<string, string> };

const parser = unified().use(remarkParse).use(remarkDirective);
const proseProcessor = unified().use(remarkRehype).use(rehypeStringify);

interface LeafDirectiveNode {
  type: "leafDirective";
  name: string;
  attributes?: Record<string, string | null | undefined>;
  children?: Array<{ type: string; value?: string }>;
}

function isIslandDirective(node: RootContent): node is RootContent & LeafDirectiveNode {
  return (node as { type: string }).type === "leafDirective" && (node as LeafDirectiveNode).name === "island";
}

function islandBlock(node: LeafDirectiveNode): Block {
  const key = node.children?.find((c) => c.type === "text")?.value ?? "";
  const props: Record<string, string> = {};
  for (const [name, value] of Object.entries(node.attributes ?? {})) {
    if (value != null) props[name] = String(value);
  }
  return { type: "island", key, props };
}

/**
 * Split a Markdown post body into an ordered list of prose (HTML) and island
 * blocks. `::island[key]{prop=value}` leaf directives become island references;
 * everything else is rendered to HTML. Pure and synchronous so it works at build
 * time, during SSR, and in unit tests alike. Props are kept as raw strings —
 * coercion to the component's prop types happens at render (see coerceProps).
 */
export function renderPostBody(markdown: string): Block[] {
  const tree = parser.runSync(parser.parse(markdown)) as Root;
  const blocks: Block[] = [];
  let run: RootContent[] = [];

  const flush = () => {
    if (run.length === 0) return;
    const html = proseProcessor.stringify(
      proseProcessor.runSync({ type: "root", children: run }),
    ) as string;
    if (html.trim()) blocks.push({ type: "html", html });
    run = [];
  };

  for (const node of tree.children) {
    if (isIslandDirective(node)) {
      flush();
      blocks.push(islandBlock(node));
    } else {
      run.push(node);
    }
  }
  flush();

  return blocks;
}
