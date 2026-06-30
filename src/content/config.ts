// @ts-ignore
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    page_bg: z.string().optional(),
    date: z.date(),
    date_updated: z.date().optional(),
    draft: z.boolean().optional(),
    excerpt: z.string().optional(),
    featured_image: z.string().optional(),
    // AT-URI of a Bluesky post; when set, its replies render as comments.
    bskyPostUri: z.string().optional(),
  }),
});

const smidgeons = defineCollection({
  type: "content",
  schema: z.object({
    summary: z.string(),
    created: z.date(),
  }),
});

const iShipped = defineCollection({
  type: "content",
  schema: z.object({
    summary: z.string(),
    repo: z.string(),
    mergeDate: z.date(),
    prNumber: z.string(),
    content: z.string(),
  }),
});

// Hand-authored digests summarising the most impactful work shipped over an
// arbitrary period (month, quarter, year, ad-hoc). Mirrored to es.joeinn.shippedDigest.
const shippedDigests = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    start: z.date(),
    end: z.date(),
    created: z.date(),
  }),
});

export const collections = {
  posts,
  smidgeons,
  iShipped,
  "shipped-digests": shippedDigests,
};
