import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { IDataCollectorConfig } from '../data-collector.interface';
import { WebCollectorService } from '../web/web-collector.service';
import { UnknownCollectorError } from '../errors/data-collector.error';
import { DataCollectorService } from '../data-collector.service';
import { RSSCollectorService } from '../rss/rss-collector.service';

@Injectable()
@Processor('data-collector.fetch', { concurrency: 1 })
export class DataCollectorFetchProcessor extends WorkerHost {
  readonly _logger = new Logger(DataCollectorFetchProcessor.name);

  constructor(
    private readonly _webCollectorService: WebCollectorService,
    private readonly _rssCollectorService: RSSCollectorService,
    private readonly _dataCollectorService: DataCollectorService,
  ) {
    super();
  }

  async process(job: Job<IDataCollectorConfig>): Promise<any> {
    this._logger.log(`Processing job ${job.id} of type ${job.name} with data ${JSON.stringify(job.data)}`);

    return this.processJobWithErrorHandler(job).catch(async (err) => {
      // TODO: handle errors
      await this._dataCollectorService.updateLastRun(job.data, err);
    });
  }

  private async processJobWithErrorHandler(
    job: Job<IDataCollectorConfig>,
  ): Promise<unknown> {
    try {
      // Work on job
      const result = await this.handleJob(job);
      await this._dataCollectorService.updateLastRun(job.data);
      return result;
    } catch (err) {
      if (err instanceof UnknownCollectorError) {
        this._logger.log(`Received UnknownCollectorError from ${job.data.name}: ${err.message}`);
      }

      this._logger.log(`Received error from ${job.data.name}: ${JSON.stringify(err.message)}`);

      // Unknown error
      throw err;
    }
  }

  private async handleJob(job: Job<IDataCollectorConfig>): Promise<number> {
    switch (job.data.type) {
      case 'WEB':
        return this._webCollectorService.fetchData(job.data);
      case 'RSS':
        return this._rssCollectorService.fetchData(job.data);
      case 'API':
        return Promise.reject(new Error('Not implemented yet'));
      default:
        return Promise.reject(new Error('Connector not supported'));
    }
  }

  @OnWorkerEvent('error')
  onError(err: Error): void {
    this._logger.error('Error in worker');
    console.error(err);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<any>, err: Error): void {
    this._logger.warn(`Failed job ${job.id}: ${err.message}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<any>): void {
    this._logger.log(`Completed job ${job.id}`);
  }
}
