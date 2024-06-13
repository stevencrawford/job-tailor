import { Inject, Injectable } from '@nestjs/common';
import { IDataProvider } from '../../data-provider.interface';
import { AxiosApiCrawler } from '../axios-api-crawler';

@Injectable()
export class ApiProviderFactory {
  constructor(
    @Inject('API_PROVIDERS') private readonly providers: IDataProvider<AxiosApiCrawler>[],
  ) {}

  get(id: string): IDataProvider<AxiosApiCrawler> {
    for (const provider of this.providers) {
      if (provider._identifier === id) {
        return provider;
      }
    }
  }
}
