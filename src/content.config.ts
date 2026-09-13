// src/content.config.ts
// Astro v6 Content Layer API — note this file lives at src/content.config.ts,
// NOT inside src/content/. The old src/content/config.ts location + type:
// 'content' syntax was removed in v6; collections now need an explicit loader.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(['k8s', 'cloud', 'ai']),
    tags: z.array(z.string()).default([]),
    date: z.date(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  }),
});

export const collections = { posts };
