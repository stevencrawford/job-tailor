import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { RawJob } from '@libs/nestjs-libraries/dto/job.dto';
import { CrawlerService } from '../crawler.service';
import { FETCH_JOBS, RAW_JOB_DETAILS, RAW_JOB_LIST_FILTER } from '@libs/nestjs-libraries/ai/common/queues.common';
import { JobService } from '@libs/nestjs-libraries/services/job.service';

@Controller()
export class JobsQueueController {
  readonly _logger = new Logger(JobsQueueController.name);

  constructor(
    @Inject() private readonly _jobService: JobService,
    private readonly _crawlerService: CrawlerService,
  ) {
  }

  @EventPattern(FETCH_JOBS, Transport.REDIS)
  async refreshJobs(data: { source: string }) {
    this._logger.log(`Received fetch-jobs event for ${data.source}`);
    await this._crawlerService.crawl('https://web3.career/remote-jobs');
    // await this._crawlerService.crawl('https://httpbin.io/user-agent');
  }

  @EventPattern(RAW_JOB_LIST_FILTER, Transport.REDIS)
  async processJobs(data: { source: string, jobs: Pick<RawJob, 'title' | 'url' | 'timestamp'>[] }) {
    const apply = await this._jobService.processAll('d6b986c9-edce-4041-94ab-8c953682c5df', data.source, data.jobs);
    if (apply.length > 0) {
      await this._crawlerService.crawlAll(data.source, apply);
    }
  }

  @EventPattern(RAW_JOB_DETAILS, Transport.REDIS)
  async processJob(data: { job: RawJob & { id: string } }) {
    await this._jobService.classifyJob(data.job);
  }

}
