import { Inject, Injectable } from '@nestjs/common';
import { SiteProvider } from './site-provider.interface';
import { getDomain, getPath } from '../../../../utils/url.utils';

@Injectable()
export class SiteProviderFactory {

  constructor(
    @Inject('SITES') private readonly siteProviders: SiteProvider[],
  ) {}

  get(url: string): SiteProvider {
    const path = getPath(url);
    const domain = getDomain(url);
    for (const provider of this.siteProviders) {
      if (provider._domain === domain && provider._supportedUrls.includes(path)) {
        return provider;
      }
    }
  }
}
