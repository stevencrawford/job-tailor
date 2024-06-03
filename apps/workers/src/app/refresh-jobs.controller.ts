import { Controller } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { CrawlerService } from '@libs/nestjs-libraries/crawler/crawler.service';

@Controller()
export class RefreshJobsController {

  constructor(
    private readonly _crawlerService: CrawlerService,
  ) {
  }

  @EventPattern('refresh-jobs', Transport.REDIS)
  async refreshJobs(data: { provider: string }) {
    console.log(`RefreshJobsController received refresh-jobs event for ${data.provider}`);
    await this._crawlerService.crawl('https://web3.career/remote-jobs');
  }

}
