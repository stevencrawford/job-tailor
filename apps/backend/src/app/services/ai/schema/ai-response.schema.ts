import { z } from 'zod';
import { JobLevel } from '../../job/job.interface';

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
  reason: z.string().or(null).optional(),
});

export const categorizedJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().url(),
  category: z.string(),
  location: z.string().or(null).optional(),
  level: z.enum([
    JobLevel.INTERN,
    JobLevel.ENTRY,
    JobLevel.MID_SENIOR,
    JobLevel.STAFF,
    JobLevel.DIRECTOR,
    JobLevel.EXECUTIVE,
    JobLevel.UNKNOWN
  ]),
});

export const categorizeResponseSchema = z.object({
  results: z.array(categorizedJobSchema),
});
