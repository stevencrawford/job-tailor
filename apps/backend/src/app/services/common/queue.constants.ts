const enrichQueues = [
  'jobs-enrich',
  'jobs-summarize',
  'jobs-categorize',
] as const;

export const [
  JOBS_ENRICH,
  JOBS_SUMMARIZE,
  JOBS_CATEGORIZE,
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
