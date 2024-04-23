import { defineCollection, z } from 'astro:content';

const work = defineCollection({
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      start: z.date(),
      end: z.date().optional(),
      type: z.array(z.enum(['stills', 'moving', 'code', 'design', 'mixed', 'installation'])),
      thumbnail: z.string().optional(),
      selected: z.boolean().default(false),
      ongoing: z.boolean().default(false),

      // Refactor to ensure both imageUrl and videoUrl are properly handled
      gallery: z
        .object({
          content: z
            .array(
              z.object({
                imageUrl: z.string().optional(),
                alt: z.string().optional(),
                videoUrl: z.string().optional(),
              }),
            )
            .optional(),
        })
        .optional(),
    })
});

export const collections = {
  work,
};
