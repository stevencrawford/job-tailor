import { IJobDispatcher } from './data-collector.interface';

export interface IDataProvider<T> {
  _identifier: string;

  hasSupport(url: string): boolean;

  initialize(handler: IJobDispatcher): T;
}
