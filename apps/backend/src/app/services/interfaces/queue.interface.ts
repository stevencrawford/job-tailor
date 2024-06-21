import { IDataCollectorConfig } from '@/app/services/data-collector/data-collector.interface';
import { JobAttributes, JobAttributesRequired, JobWithId } from '@/app/services/interfaces/job.interface';

export interface IDataCollectorProcessRequest {
  collectorConfig: IDataCollectorConfig
}

export interface IJobListingsEnrichRequest {
  collectorConfig: IDataCollectorConfig,
  jobListings: Array<JobWithId & (JobAttributesRequired | JobAttributes)>
}
