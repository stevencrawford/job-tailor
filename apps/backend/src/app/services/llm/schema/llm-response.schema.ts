import { z } from 'zod';

export enum LLM_DECISION {
  UNKNOWN = 'UNKNOWN',
  IGNORE = 'IGNORE',
  CONSIDER = 'CONSIDER',
  APPLY = 'APPLY',
}

export const classifyResponseSchema = z.object({
  score: z.number().min(0).max(10),
  decision: z
    .enum([
      LLM_DECISION.UNKNOWN,
      LLM_DECISION.IGNORE,
      LLM_DECISION.CONSIDER,
      LLM_DECISION.APPLY,
    ]).default(LLM_DECISION.UNKNOWN),
  reason: z.string().or(null).optional(),
});

export const categorizedJobSchema = z.object({
  id: z.string(),
  category: z.string(),
  level: z.string(),
});

export const categorizeResponseSchema = z.object({
  results: z.array(categorizedJobSchema),
});

export const summarizeJobSchema = z.object({
  responsibilities: z.string(),
  experienceRequirements: z.string(),
  technicalStack: z.string(),
  interviewProcess: z.string().optional(),
  applicationProcess: z.string().optional(),
});
