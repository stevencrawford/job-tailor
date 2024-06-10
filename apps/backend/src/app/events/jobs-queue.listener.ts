import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { RawJob } from '../services/job/job.interface';
import { WebCollectorService } from '../services/web-collector/web-collector.service';
import { FETCH_JOBS, RAW_JOB_DETAILS, RAW_JOB_LIST_FILTER } from './job-queue.interface';
import { JobService } from '../services/job/job.service';

@Controller()
export class JobsQueueListener {
  readonly _logger = new Logger(JobsQueueListener.name);

  constructor(
    private readonly _jobService: JobService,
    private readonly _webCollectorService: WebCollectorService,
  ) {
  }

  @EventPattern(FETCH_JOBS, Transport.REDIS)
  async refreshJobs(data: { connector: string }) {
    this._logger.log(`Received fetch-jobs event for ${data.connector}`);
    await this._webCollectorService.crawl(data.connector);
  }

  @EventPattern(RAW_JOB_LIST_FILTER, Transport.REDIS)
  async processJobs(data: { connector: string, userId: string, jobs: Pick<RawJob, 'title' | 'url' | 'timestamp' | 'company'>[] }) {
    const processed = await this._jobService.processAll(data.userId, data.connector, data.jobs);
    if (processed.length > 0) {
      await this._webCollectorService.crawlAll(data.connector, processed);
    }
  }

  @EventPattern(RAW_JOB_DETAILS, Transport.REDIS)
  async processJob(data: { job: RawJob & { id: string } }) {
    await this._jobService.summarizeJob(data.job);
  }

}
