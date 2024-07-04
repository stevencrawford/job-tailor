import { IDataCollectorConfig } from '@/app/services/data-collector/data-collector.interface';
import { JobAttributes, JobAttributesRequired, JobWithId } from '@/app/services/interfaces/job.interface';

export interface IDataCollectorFetchQueueRequest {
  collectorConfig: IDataCollectorConfig
}

export interface IJobListingsEnrichQueueRequest {
  collectorConfig: IDataCollectorConfig,
  jobListings: Array<JobWithId & (JobAttributesRequired | JobAttributes)>
}
