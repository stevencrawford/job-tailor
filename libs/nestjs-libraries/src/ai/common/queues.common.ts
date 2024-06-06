const jobQueues = [
  'fetch-jobs',
  'raw-job-list-filter',
  'raw-job-details',
] as const;

export type JobQueues = (typeof jobQueues)[number];

export const [
  FETCH_JOBS,
  RAW_JOB_LIST_FILTER,
  RAW_JOB_DETAILS,
] = jobQueues;
