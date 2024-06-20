import { Injectable, Logger } from '@nestjs/common';
import { IJobDispatcher } from '../../data-collector.interface';
import { AxiosApiCrawler } from '../axios-api-crawler';
import { IDataProvider } from '../../data-provider.interface';
import { CURRENCY_FORMATTER, JobAttributes } from '../../../interfaces/job.interface';
import { z } from 'zod';
import { AxiosResponse } from 'axios';
import { getDomain } from '../../../../utils/url.utils';
import { diffInUnitOfTime } from '../../../../utils/date.utils';

@Injectable()
export class RemoteOkApiProvider implements IDataProvider<AxiosApiCrawler> {
  readonly _logger = new Logger(RemoteOkApiProvider.name);
  readonly _identifier = 'remoteok.com';

  hasSupport(url: string): boolean {
    const domain = getDomain(url);
    return (domain === this._identifier);
  }

  initialize(dispatcher: IJobDispatcher): AxiosApiCrawler {
    return new AxiosApiCrawler({
      responseHandler: async (response: AxiosResponse<ApiResponse>, options) => {
        // skip the first element as it is the legal notice
        const jobs = response.data.slice(1) as JobData[];
        const jobListings: JobAttributes[] = jobs.map((job: JobData) => ({
          title: job.position,
          url: job.url,
          timestamp: job.epoch * 1000,
          company: job.company,
          location: job.location,
          tags: job.tags && job.tags.join(','),
          description: job.description,
          compensation: (job.salary_min && job.salary_max)
            ? `${CURRENCY_FORMATTER.format(job.salary_min)} - ${CURRENCY_FORMATTER.format(job.salary_max)}` : '',
          source: this._identifier,
        }));

        const jobsToProcess = jobListings.filter((job: JobAttributes) => {
          const isStale = diffInUnitOfTime(job.timestamp, options.lastRun) > 0;
          return !isStale;
        });

        dispatcher.dispatch({
          collectorConfig: {
            name: this._identifier,
          },
          jobListings: jobsToProcess,
        });
      },
    });
  }
}

const legalNoticeSchema = z.object({
  last_updated: z.number(),
  legal: z.string(),
});

const jobSchema = z.object({
  slug: z.string(),
  id: z.string(),
  epoch: z.number(),
  date: z.string(),
  company: z.string(),
  position: z.string(),
  tags: z.array(z.string()),
  description: z.string(),
  location: z.string(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  apply_url: z.string().url(),
  url: z.string().url(),
});

const responseSchema = z.array(z.union([jobSchema, legalNoticeSchema]));

export type JobData = z.infer<typeof jobSchema>;
export type ApiResponse = z.infer<typeof responseSchema>;
