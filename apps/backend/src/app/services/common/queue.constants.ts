const enrichQueues = [
  'job.enrich',
  'job.summarize',
  'job.categorize',
  'candidate.lookup',
  'candidate.match',
] as const;

export const [
  JOB_ENRICH,
  JOB_SUMMARIZE,
  JOB_CATEGORIZE,
  CANDIDATE_LOOKUP,
  CANDIDATE_MATCH,
] = enrichQueues;

const dataCollectorQueues = [
  'data-collector.fetch',
  'data-collector.job',
] as const;

export const [
  DATA_COLLECTOR_FETCH,
  DATA_COLLECTOR_JOB,
] = dataCollectorQueues;

export type EnrichQueues = (typeof enrichQueues)[number];
export type DataCollectorQueues = (typeof dataCollectorQueues)[number];

const enrichJobFlows = ['job-enricher-producer'] as const;

export const [JOB_ENRICHER_PRODUCER] = enrichJobFlows;
