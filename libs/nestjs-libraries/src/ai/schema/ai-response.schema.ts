import { z } from 'zod';

export enum AI_DECISION {
  UNKNOWN = 'UNKNOWN',
  IGNORE = 'IGNORE',
  CONSIDER = 'CONSIDER',
  APPLY = 'APPLY',
}

export enum CLASSIFIED_TYPE {
  CLASSIFIED_TITLE = 'CLASSIFIED_TITLE',
  CLASSIFIED_FULL = 'CLASSIFIED_FULL',
}

export const classifyResponseSchema = z.object({
  state: z.enum([
    CLASSIFIED_TYPE.CLASSIFIED_TITLE,
    CLASSIFIED_TYPE.CLASSIFIED_FULL,
  ]).optional(),
  score: z.number().min(0).max(10),
  decision: z
    .enum([
      AI_DECISION.UNKNOWN,
      AI_DECISION.IGNORE,
      AI_DECISION.CONSIDER,
      AI_DECISION.APPLY,
    ]).default(AI_DECISION.UNKNOWN),
  reason: z.string().optional(),
});

export const rankResponseSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      url: z.string().url(),
    }).and(classifyResponseSchema),
  ),
});
