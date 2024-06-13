import axios, { AxiosResponse } from 'axios';
import { Logger } from '@nestjs/common';

export interface ApiCrawlerOptions {
  responseHandler?: (response: AxiosResponse) => void;
}

export class AxiosApiCrawler {
  readonly _logger = new Logger(AxiosApiCrawler.name);

  constructor(private readonly options: ApiCrawlerOptions) {}

  async run(requests: string[]) {
    const client = axios.create();

    for (const request of requests) {
      try {
        const response = await client.get(request);
        if (this.options.responseHandler) {
          this.options.responseHandler(response);
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
