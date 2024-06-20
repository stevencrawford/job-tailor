import { Inject, Injectable } from '@nestjs/common';
import { IDataCollectorService } from '@/app/services/data-collector/data-collector.interface';

@Injectable()
export class DataCollectorFactory {
  constructor(
    @Inject('COLLECTORS') private readonly collectors: IDataCollectorService[],
  ) {}

  get(id: 'WEB' | 'RSS' | 'API'): IDataCollectorService {
    for (const collector of this.collectors) {
      if (collector._type === id) {
        return collector;
      }
    }
  }
}
