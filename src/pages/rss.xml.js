import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const now = new Date();
  const posts = await getCollection("posts", ({ data }) => {
    return !data.draft && new Date(data.date) < now;
  });

  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
  );

  return rss({
    title: "Joe Innes — Blog",
    description:
      "Writing from Joe Innes on local-first, realtime apps, encrypted distributed data, and web development.",
    site: context.site,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      link: `/blog/${post.slug}`,
      pubDate: post.data.date,
      description: post.data.excerpt,
    })),
  });
}
