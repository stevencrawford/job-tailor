import { IJobDispatcher } from '@/app/services/data-collector/data-collector.interface';

export interface IDataProvider<T> {
  _identifier: string;

  hasSupport(url: string): boolean;

  initialize(handler: IJobDispatcher): T;
}
