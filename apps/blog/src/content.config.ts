import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		draft: z.boolean().optional(),
		slug: z.string().optional(),
		locale: z.string().optional(),
		type: z.string().optional(),
		week: z.number().optional(),
		day: z.number().optional(),
		tags: z.array(z.string()).optional(),
		image: z.string().nullable().optional(),
		image_prompt: z.string().nullable().optional(),
		cta: z.string().nullable().optional(),
		altSlug: z.string().nullable().optional(),
	}),
});

export const collections = { blog };
