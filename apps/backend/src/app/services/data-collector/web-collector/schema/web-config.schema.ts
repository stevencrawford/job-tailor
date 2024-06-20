import { z } from 'zod';

export const webConfigSchema = z.object({
  selectors: z.object({
    title: z.string(),
    company: z.string(),
    location: z.string().optional(),
    length: z.string().optional(),
    description: z.string(),
    compensation: z.string().optional(),
    roleType: z.string().optional(),
  }),
  paginationSelector: z.string().optional(),
});

export type WebCollectorConfig = z.infer<typeof webConfigSchema>;
