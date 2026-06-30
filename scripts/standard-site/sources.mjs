// Registry of "publishable sources". Each source maps a content collection to a
// standard.site or ATProto record. Sources targeting `site.standard.document`
// expose `toInput` (the standard.site document shape); sources targeting an owned
// lexicon (es.joeinn.*) expose `toRecord` (the bare record body — the sync engine
// adds `$type`). Adding another collection later is a matter of appending one
// source here plus a matching lexicon under lexicons/.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

// Read every MDX/Markdown file in a directory as { slug, file, data, body }.
// A missing directory yields no entries (so the delete sweep still runs).
function readEntries(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.mdx?$/.test(f))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const { data, content } = matter(readFileSync(join(dir, file), "utf8"));
      return { slug, file, data, body: content };
    });
}

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

// Each merged contribution → an es.joeinn.shipped record. MDX stays the authoring
// and render source; this mirrors it to the PDS.
export const shippedSource = {
  collection: "i-shipped",
  target: "es.joeinn.shipped",
  dir: "src/content/i-shipped",

  list() {
    return readEntries(this.dir);
  },

  shouldPublish(entry) {
    return Boolean(entry.data.mergeDate);
  },

  toRecord(entry) {
    const mergedAt = new Date(entry.data.mergeDate).toISOString();
    const repo = entry.data.repo;
    const prNumber = String(entry.data.prNumber);
    const description = entry.body.trim();
    return {
      summary: entry.data.summary,
      repo,
      prNumber,
      url: `https://github.com/${repo}/pull/${prNumber}`,
      ...(description ? { description } : {}),
      mergedAt,
      createdAt: mergedAt,
    };
  },

  hashInput(entry) {
    return JSON.stringify({
      summary: entry.data.summary,
      repo: entry.data.repo,
      prNumber: String(entry.data.prNumber),
      mergeDate: entry.data.mergeDate,
      body: entry.body,
    });
  },
};

// Each digest → an es.joeinn.shippedDigest record. Covers any period (month,
// quarter, year, ad-hoc) via a startDate/endDate range; the body is the summary.
export const shippedDigestSource = {
  collection: "shipped-digests",
  target: "es.joeinn.shippedDigest",
  dir: "src/content/shipped-digests",

  list() {
    return readEntries(this.dir);
  },

  shouldPublish(entry) {
    return Boolean(entry.data.start && entry.data.end);
  },

  toRecord(entry) {
    const startDate = new Date(entry.data.start).toISOString();
    const endDate = new Date(entry.data.end).toISOString();
    const summary = entry.body.trim();
    return {
      ...(entry.data.title ? { title: entry.data.title } : {}),
      startDate,
      endDate,
      summary,
      createdAt: startDate,
    };
  },

  hashInput(entry) {
    return JSON.stringify({
      title: entry.data.title ?? null,
      start: entry.data.start,
      end: entry.data.end,
      body: entry.body,
    });
  },
};

export const SOURCES = [postsSource, shippedSource, shippedDigestSource];
