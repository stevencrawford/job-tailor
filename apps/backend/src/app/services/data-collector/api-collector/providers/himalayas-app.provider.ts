import { Injectable } from '@nestjs/common';
import { IJobDispatcher } from '../../data-collector.interface';
import { AxiosApiCrawler } from '../axios-api-crawler';
import { CURRENCY_FORMATTER, JobAttributes } from '../../../interfaces/job.interface';
import { z } from 'zod';
import { IDataProvider } from '../../data-provider.interface';
import { AxiosResponse } from 'axios';
import { getDomain } from '../../../../utils/url.utils';

@Injectable()
export class HimalayasAppApiProvider implements IDataProvider<AxiosApiCrawler> {
  readonly _identifier = 'himalayas.app';

  hasSupport(url: string): boolean {
    const domain = getDomain(url);
    return (domain === this._identifier);
  }

  initialize(dispatcher: IJobDispatcher): AxiosApiCrawler {
    return new AxiosApiCrawler({
      responseHandler: async (response: AxiosResponse<ApiResponse>) => {
        const jobs = response.data.jobs;
        const jobListings: JobAttributes[] = jobs.map((job: JobData) => ({
          title: job.title,
          url: job.applicationLink,
          timestamp: job.pubDate * 1000, // Convert from Unix timestamp to milliseconds
          company: job.companyName,
          location: job.locationRestrictions && job.locationRestrictions.join(', '),
          // category: job.parentCategories?.length > 0 ? job.parentCategories.at(0) : job.categories?.at(0), // TODO: need way to resolve categories back to our categories
          description: job.description,
          roleType: job.seniority && job.seniority.join(', '),
          compensation: (job.minSalary && job.maxSalary)
            ? `${CURRENCY_FORMATTER.format(job.minSalary)} - ${CURRENCY_FORMATTER.format(job.maxSalary)}`: '',
          source: this._identifier,
        }));

        dispatcher.dispatch({
          collectorConfig: {
            name: this._identifier,
          },
          jobListings,
        });
      },
    });
  }
}

const jobSchema = z.object({
  title: z.string(),
  companyName: z.string(),
  minSalary: z.number().optional().nullable(),
  maxSalary: z.number().optional().nullable(),
  seniority: z.array(z.string()),
  locationRestrictions: z.array(z.string()),
  timezoneRestrictions: z.array(z.number()),
  categories: z.array(z.string()),
  parentCategories: z.array(z.string()).optional(),
  description: z.string(),
  pubDate: z.number(),
  applicationLink: z.string().url(),
});

const responseSchema = z.object({
  updated_at: z.number(),
  offset: z.number(),
  limit: z.number(),
  total_count: z.number(),
  jobs: z.array(jobSchema),
});

export type JobData = z.infer<typeof jobSchema>;
export type ApiResponse = z.infer<typeof responseSchema>;
