import axios, { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';

export interface ApiCrawlerOptions {
  responseHandler?: (response: AxiosResponse, options?: ApiCrawlerRunOptions) => void;
}

export interface ApiCrawlerRunOptions {
  lastRun: number;
}

export class AxiosApiCrawler {
  readonly _logger = new Logger(AxiosApiCrawler.name);

  constructor(private readonly options: ApiCrawlerOptions) {}

  async run(requests: string[], options: ApiCrawlerRunOptions) {
    const client = axios.create();

    for (const request of requests) {
      try {
        const response = await client.get(request);
        if (this.options.responseHandler) {
          this.options.responseHandler(response, options);
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          this._logger.error(`Error calling ${request}: ${err.message}`);
        } else {
          this._logger.error(`Unexpected error: ${err}`);
        }

        throw err;
      }
    }
  }
}
