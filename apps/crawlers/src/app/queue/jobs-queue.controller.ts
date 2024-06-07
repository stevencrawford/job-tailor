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
  async refreshJobs(data: { connector: string }) {
    this._logger.log(`Received fetch-jobs event for ${data.connector}`);
    await this._crawlerService.crawl(data.connector);
  }

  @EventPattern(RAW_JOB_LIST_FILTER, Transport.REDIS)
  async processJobs(data: { connector: string, userId: string, jobs: Pick<RawJob, 'title' | 'url' | 'timestamp'>[] }) {
    const apply = await this._jobService.processAll(data.userId, data.connector, data.jobs);
    if (apply.length > 0) {
      await this._crawlerService.crawlAll(data.connector, apply);
    }
  }

  @EventPattern(RAW_JOB_DETAILS, Transport.REDIS)
  async processJob(data: { job: RawJob & { id: string } }) {
    await this._jobService.classifyJob(data.job);
  }

}
