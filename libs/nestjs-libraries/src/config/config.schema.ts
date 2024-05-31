import { z } from 'zod';

export const configSchema = z.object({
  PORT: z.coerce.number().optional().default(3000),
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().positive(),
  REDIS_PASSWORD: z.string().optional(),
});
