// Dual-track post model. One island-aware source produces two representations:
//
//   - portable: a `site.standard.document` body for cross-app interop (Bluesky
//     enhanced cards, other atproto readers). Interactive islands can't render
//     off-site, so each `::island[...]` directive collapses to a notice.
//   - rich: the island-aware markdown itself. Only our own site reads this and
//     hydrates the islands via renderPostBody.
//
// Keeping both in one place means the two never drift: publish `document` for
// the world, render `richBody` for us.

export interface PostSource {
  title: string;
  slug: string;
  publishedAt: string; // ISO 8601
  updatedAt?: string;
  description?: string;
  markdown: string; // body with `::island[key]{props}` leaf directives
}

export interface StandardDocument {
  title: string;
  path: string;
  publishedAt: string;
  updatedAt?: string;
  description?: string;
  content: { $type: "site.standard.content.markdown"; text: string; version: "1.0" };
}

export interface DualTrackPost {
  document: StandardDocument;
  richBody: string;
}

// Strip `::island[...]` leaf directives to a one-line notice so external readers
// see prose plus a pointer back to the canonical post instead of raw directives.
export function toPortableMarkdown(markdown: string, canonicalUrl?: string): string {
  const notice = canonicalUrl
    ? `> This post includes an interactive component. [View it on joeinn.es](${canonicalUrl})`
    : "> This post includes an interactive component.";
  return (
    markdown
      .replace(/^[ \t]*::island\[.*$/gm, notice)
      // ponytail: adjacent islands yield repeated notices; add a collapse pass if that shows up.
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

export function buildPostRecord(src: PostSource, siteUrl: string): DualTrackPost {
  const path = `/blog/${src.slug}`;
  const document: StandardDocument = {
    title: src.title,
    path,
    publishedAt: src.publishedAt,
    ...(src.updatedAt ? { updatedAt: src.updatedAt } : {}),
    ...(src.description ? { description: src.description } : {}),
    content: {
      $type: "site.standard.content.markdown",
      text: toPortableMarkdown(src.markdown, siteUrl + path),
      version: "1.0",
    },
  };
  return { document, richBody: src.markdown };
}
