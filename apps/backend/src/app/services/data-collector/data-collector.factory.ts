import { Inject, Injectable } from '@nestjs/common';
import { IDataCollectorService } from './data-collector.interface';

@Injectable()
export class DataCollectorFactory {
  constructor(
    @Inject('COLLECTORS') private readonly collectors: IDataCollectorService[],
  ) {}

  get(id: 'WEB' | 'RSS' | 'API'): IDataCollectorService {
    for (const collector of this.collectors) {
      if (collector._identifier === id) {
        return collector;
      }
    }
  }
}
