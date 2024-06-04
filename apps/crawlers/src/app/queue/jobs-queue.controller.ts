import { Controller } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { RawJob } from '@libs/nestjs-libraries/dto/job.dto';
import { CrawlerService } from '../crawler.service';
import { AIProviderFactory } from '@libs/nestjs-libraries/ai/ai-provider.factory';

@Controller()
export class JobsQueueController {

  constructor(
    private readonly _crawlerService: CrawlerService,
    private readonly _aiProviderFactory: AIProviderFactory,
  ) {
  }

  @EventPattern('fetch-jobs', Transport.REDIS)
  async refreshJobs(data: { source: string }) {
    console.log(`[JobsQueueController] received fetch-jobs event for ${data.source}`);
    await this._crawlerService.crawl('https://web3.career/remote-jobs');
    // await this._crawlerService.crawl('https://httpbin.io/user-agent');
  }

  @EventPattern('raw-job-list-filter', Transport.REDIS)
  async processJobs(data: { source: string, jobs: Partial<RawJob>[] }) {
    await this._aiProviderFactory.get('groq').rankJobTitles(data.jobs).then(rankedJobs => {
      const nextStage: (Partial<RawJob> & {status?: string})[] = rankedJobs.results
        .filter(value => value.status == 'APPLY');

      console.log(`[JobsQueueController] Found ${nextStage.length} jobs to apply to. ${JSON.stringify(nextStage)}`);
      this._crawlerService.crawlAll(data.source, nextStage.map(j => j.url));
    });
  }

  @EventPattern('raw-job-details', Transport.REDIS)
  async processJob(data: { job: RawJob }) {
    await this._aiProviderFactory.get('groq').classifyJob(data.job).then((classified) =>
      console.log(`[JobsQueueController] Classified ${JSON.stringify(classified)}`)
    );
  }

}
