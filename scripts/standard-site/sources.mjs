// Registry of "publishable sources". Each source maps a content collection to a
// standard.site / ATProto record. Phase 1 registers blog posts only; adding
// smidgeons or i-shipped later is a matter of appending one source to SOURCES
// (smidgeons would target app.bsky.feed.post — standard.site is longform-only).

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const NOTICE = "This post includes an interactive component.";

// External longform readers can't render MDX components, so replace the bits they
// can't handle with a short notice linking back to the canonical post.
function stripMdxComponents(body, canonicalUrl) {
  const notice = `> ${NOTICE} [View it on joeinn.es](${canonicalUrl})`;
  let out = body
    // Drop ESM import/export lines (component wiring).
    .replace(/^[ \t]*(?:import|export)\b.*$/gm, "")
    // Paired component blocks: <Tag ...> ... </Tag> (component = uppercase initial).
    .replace(/<([A-Z][\w.]*)\b[^>]*>[\s\S]*?<\/\1>/g, notice)
    // Self-closing components: <Tag ... />.
    .replace(/<[A-Z][\w.]*\b[^>]*\/>/g, notice);

  // Collapse runs of consecutive notice lines into one.
  out = out
    .split("\n")
    .filter((line, i, arr) => !(line.includes(NOTICE) && (arr[i - 1] ?? "").includes(NOTICE)))
    .join("\n");

  return out.replace(/\n{3,}/g, "\n\n").trim();
}

export const postsSource = {
  collection: "posts",
  target: "site.standard.document",
  dir: "src/content/posts",

  list() {
    return readdirSync(this.dir)
      .filter((f) => /\.mdx?$/.test(f))
      .map((file) => {
        const slug = file.replace(/\.mdx?$/, "");
        const { data, content } = matter(readFileSync(join(this.dir, file), "utf8"));
        return { slug, file, data, body: content };
      });
  },

  shouldPublish(entry) {
    if (entry.data.draft) return false;
    const date = new Date(entry.data.date);
    return !Number.isNaN(date.getTime()) && date <= new Date();
  },

  pathFor(entry) {
    return `/blog/${entry.slug}`;
  },

  // Build the publishDocument input (minus `site`, which the engine adds).
  // `transform` is the package's transformContent helper.
  toInput(entry, { siteUrl, transform }) {
    const path = this.pathFor(entry);
    const canonicalUrl = siteUrl + path;
    const cleaned = stripMdxComponents(entry.body, canonicalUrl);
    const { markdown, textContent } = transform(cleaned, { siteUrl, postPath: path });

    return {
      title: entry.data.title,
      path,
      publishedAt: new Date(entry.data.date).toISOString(),
      ...(entry.data.date_updated
        ? { updatedAt: new Date(entry.data.date_updated).toISOString() }
        : {}),
      ...(entry.data.excerpt ? { description: entry.data.excerpt } : {}),
      textContent,
      content: { $type: "site.standard.content.markdown", text: markdown, version: "1.0" },
    };
  },

  // Fields that, when changed, should trigger a re-publish.
  hashInput(entry) {
    return JSON.stringify({
      title: entry.data.title,
      date: entry.data.date,
      date_updated: entry.data.date_updated ?? null,
      excerpt: entry.data.excerpt ?? null,
      body: entry.body,
    });
  },
};

export const SOURCES = [postsSource];
