
export interface IDataCollectorConfig {
  name: string;
  type: 'WEB' | 'API' | 'RSS';
  config: object;
  lastRun?: Date;
}

export interface IDataCollectorService {
  fetchData(collectorConfig: IDataCollectorConfig): Promise<number>;
}
