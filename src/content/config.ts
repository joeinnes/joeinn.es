// @ts-ignore
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    page_bg: z.string().optional(),
    date: z.date(),
    excerpt: z.string().optional(),
    featured_image: z.string().optional(),
  }),
});

const smidgeons = defineCollection({
  type: 'content',
  schema: z.object({
    summary: z.string(),
    created: z.date(),
  }),
});

export const collections = { posts, smidgeons };
