import { JobAttributes, JobAttributesRequired } from '../interfaces/job.interface';

export interface IDataCollectorConfig {
  name: string;
  type: 'WEB' | 'API' | 'RSS';
  config: object;
  lastRun?: Date;
}

export interface IDataCollectorService {
  fetchData(collectorConfig: IDataCollectorConfig): Promise<number>;
}

export interface IJobDispatcher {
  dispatch(data: { collectorConfig: Pick<IDataCollectorConfig, 'name'>, jobListings: (JobAttributesRequired | JobAttributes)[] }): void;
}
