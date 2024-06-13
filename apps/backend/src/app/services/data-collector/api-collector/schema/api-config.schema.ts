import { z } from 'zod';

export const apiConfigSchema = z.object({
  url: z.string().url(),
});

export type ApiCollectorConfig = z.infer<typeof apiConfigSchema>;
