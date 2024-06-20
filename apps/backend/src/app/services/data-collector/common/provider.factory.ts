import { Inject, Injectable } from '@nestjs/common';
import { IDataProvider } from '@/app/services/data-collector/data-provider.interface';

@Injectable()
export class ProviderFactory<T> {
  constructor(
    @Inject('PROVIDERS') private readonly providers: IDataProvider<T>[],
  ) {}

  get(id: string): IDataProvider<T> {
    for (const provider of this.providers) {
      if (provider._identifier === id) {
        return provider;
      }
    }
  }
}
