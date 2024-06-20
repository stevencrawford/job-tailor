import { JobAttributes, JobAttributesRequired } from '@/app/services/interfaces/job.interface';

export interface IDataCollectorConfig {
  name: string;
  type: 'WEB' | 'API' | 'RSS';
  config: object;
  lastRun?: number;
}

export interface IDataCollectorService {
  _type: string;

  fetchData(collectorConfig: IDataCollectorConfig): Promise<number>;
}

export interface IJobDispatcher {
  dispatch(data: { collectorConfig: Pick<IDataCollectorConfig, 'name'>, jobListings: Array<JobAttributesRequired | JobAttributes> }): void;
}
