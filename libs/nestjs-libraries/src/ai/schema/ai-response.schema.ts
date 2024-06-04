import { z } from 'zod';

export const classifyResponseSchema = z.object({
  score: z.number().min(0).max(10),
  status: z
    .enum([
      'APPLY',
      'CONSIDER',
      'REJECT',
    ])
    .optional(),
  reason: z.string().optional(),
});

export const rankResponseSchema = z.object({
  results: z.array(
    z.object({
      title: z.string(),
      url: z.string().url()
    }).and(classifyResponseSchema)
  ),
});
