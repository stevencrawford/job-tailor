import { BrowserName, DeviceCategory } from '@crawlee/browser-pool';
import { PlaywrightCrawlerOptions } from 'crawlee';

export const defaultCrawlerOptions: PlaywrightCrawlerOptions = {
  browserPoolOptions: {
    useFingerprints: true,
    fingerprintOptions: {
      fingerprintGeneratorOptions: {
        browsers: [BrowserName.chrome, BrowserName.firefox, BrowserName.edge],
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
  maxConcurrency: 2,
  minConcurrency: 1,
  maxRequestRetries: 0,
};


export const defaultEnqueueOptions = {
  limit: 25,
}
