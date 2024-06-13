import { Logger } from '@nestjs/common';
import Parser, { Output } from 'rss-parser';

export interface RssParserCrawlerOptions {
  customFields?:  Parser.CustomFields<string, any>;
  responseHandler?: (response: ({ [p: string]: any } & Output<string>)) => void;
}

export class RssParserCrawler {
  readonly _logger = new Logger(RssParserCrawler.name);

  constructor(private readonly options: RssParserCrawlerOptions) {
  }

  async run(request: string) {
    const customFields = this.options.customFields;
    const parser = new Parser({
      customFields,
    });

    try {
      const feed = await parser.parseURL(request);
      if (this.options.responseHandler) {
        this.options.responseHandler(feed);
      }
    } catch (err) {
      this._logger.error(`Error calling ${request}: ${err.message}`);

      throw err;
    }
  }
}
