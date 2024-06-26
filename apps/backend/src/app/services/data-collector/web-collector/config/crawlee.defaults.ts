import { BrowserName, DeviceCategory } from '@crawlee/browser-pool';
import { PlaywrightCrawlerOptions } from 'crawlee';

export const defaultCrawlerOptions: PlaywrightCrawlerOptions = {
  keepAlive: true,
  browserPoolOptions: {
    useFingerprints: true,
    fingerprintOptions: {
      fingerprintGeneratorOptions: {
        browsers: [BrowserName.chrome],
        devices: [DeviceCategory.desktop],
        locales: ['en-GB'],
      },
    },
  },
  launchContext: {
    launchOptions: {
      headless: true,
    },
    useChrome: true,
  },
  sameDomainDelaySecs: 30,
  maxConcurrency: 2,
  minConcurrency: 1,
  maxRequestRetries: 0,
  maxRequestsPerMinute: 5,
  retryOnBlocked: true,
};
