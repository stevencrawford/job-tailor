import { IJobDispatcher } from './data-collector.interface';

export interface IDataProvider<T> {
  _identifier: string;

  fetchUrl(options: {jobCategory: string, jobLevel: string, region?: string }): string;

  supports(url: string): boolean;

  handle(handler: IJobDispatcher): T;
}
