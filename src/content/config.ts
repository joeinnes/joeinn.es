// @ts-ignore
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    page_bg: z.string().optional(),
    date: z.date(),
    excerpt: z.string().optional(),
    featured_image: z.string().optional(),
  }),
});

export const collections = { posts };
