// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const work = defineCollection({
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      date: z.date(),
      type: z.array(z.enum(['stills', 'moving', 'code', 'design', 'mixed'])),
      thumbnail: z.string().optional(),
      selected: z.boolean().default(false),
      ongoing: z.boolean().default(false),
      color: z.string().optional(),
      videos: z
        .object({
          content: z
            .array(
              z.object({
                videoUrl: z.string(),
                videoAlt: z.string(),
                thumbnail: z.string(),
              }),
            )
            .optional(),
        })
        .optional(),
      gallery: z
        .object({
          content: z
            .array(
              z.object({
                imageUrl: z.string(),
                imageAlt: z.string(),
              }),
            )
            .optional(),
        })
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (data.selected && !data.color) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '`color` is required when `selected` is true',
          path: ['color'],
        });
      }
    }),
});

export const collections = {
  work,
};
