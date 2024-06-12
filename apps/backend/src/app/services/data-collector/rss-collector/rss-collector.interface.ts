import { z } from 'zod';

export const rssConfigSchema = z.object({
  url: z.string().url(),
});

export type RssCollectorConfig = z.infer<typeof rssConfigSchema>;
