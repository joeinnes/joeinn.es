import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { fetchBlogPosts, safe } from "../lib/pds";

export async function GET(context) {
  const now = new Date();

  // Prefer the PDS (es.joeinn.blog.post); merge in any not-yet-migrated MDX posts
  // so the feed stays complete during the migration. Newest first.
  const pds = (await safe(fetchBlogPosts(), [])).filter((p) => p.date < now);
  const pdsSlugs = new Set(pds.map((p) => p.slug));
  const mdxOnly = (
    await getCollection("posts", ({ data }) => !data.draft && new Date(data.date) < now)
  )
    .filter((e) => !pdsSlugs.has(e.slug))
    .map((e) => ({
      slug: e.slug,
      title: e.data.title,
      date: new Date(e.data.date),
      excerpt: e.data.excerpt,
    }));
  const items = [...pds, ...mdxOnly].sort((a, b) => b.date.getTime() - a.date.getTime());

  return rss({
    title: "Joe Innes — Blog",
    description:
      "Writing from Joe Innes on local-first, realtime apps, encrypted distributed data, and web development.",
    site: context.site,
    items: items.map((post) => ({
      title: post.title,
      link: `/blog/${post.slug}`,
      pubDate: post.date,
      description: post.excerpt,
    })),
  });
}
