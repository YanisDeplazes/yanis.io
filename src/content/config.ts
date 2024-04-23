import { defineCollection, z } from 'astro:content';

const work = defineCollection({
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      start: z.date(),
      end: z.date().optional(),
      type: z.array(z.enum(['stills', 'moving', 'system', 'installation'])),
      thumbnail: z.string().optional(),
      selected: z.boolean().default(false),
      ongoing: z.boolean().default(false),
      context: z.string().optional(),
      website: z.string().optional(),
      location: z.union([z.string(), z.array(z.string())]).optional(),

      // Refactor to ensure both imageUrl and videoUrl are properly handled
      gallery: z
        .object({
          content: z
            .array(
              z.object({
                imageUrl: z.string().optional(),
                alt: z.string().optional(),
                videoUrl: z.string().optional(),
                autoplay: z.boolean().default(false),
              }),
            )
            .optional(),
        })
        .optional(),
        lists: z.array(
          z.object({
            title: z.string(),
            items: z.array(z.string()),
          })
        ).optional()
    })
});

export const collections = {
  work,
};
