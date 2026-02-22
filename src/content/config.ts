import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    page_bg: z.string().optional(),
    date: z.date(),
    excerpt: z.string().optional(),
    featured_image: z.string().optional(),
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

export const collections = { posts, smidgeons, iShipped };
