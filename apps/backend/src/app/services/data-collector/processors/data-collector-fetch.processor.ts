import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { IDataCollectorConfig } from '../data-collector.interface';
import { UnknownCollectorError } from '../errors/data-collector.error';
import { DataCollectorService } from '../data-collector.service';
import { DataCollectorFactory } from '../data-collector.factory';
import { DATA_COLLECTOR_FETCH } from '../../common/queue.constants';

@Processor(DATA_COLLECTOR_FETCH, { concurrency: 5 })
export class DataCollectorFetchProcessor extends WorkerHost {
  readonly _logger = new Logger(DataCollectorFetchProcessor.name);

  constructor(
    private readonly _collectorFactory: DataCollectorFactory,
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
    const dataCollector = this._collectorFactory.get(job.data.type);
    if (dataCollector) {
        return dataCollector.fetchData(job.data);
    }
    return Promise.reject(new Error(`Connector type ${job.data.type} not supported`));
  }

  @OnWorkerEvent('error')
  onError(err: Error): void {
    this._logger.error(`Error in worker: ${err.message}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<any>, err: Error): void {
    this._logger.warn(`Failed job ${job.id}: ${err.message}`);
  }
}
