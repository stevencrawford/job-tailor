import { Global, Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerHandler } from './crawler-handler.interface';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LinkedinCrawlerHandler } from './handlers/linkedin.handler';
import { CrawlerHandlerFactory } from './crawler-handler.factory';
import { RedisModule } from '@songkeys/nestjs-redis';
import { Config, RedisConfig } from '../config/config';
import { Web3CareerCrawlerHandler } from './handlers/web3-careers.handler';

@Global()
@Module({
  imports: [
    ConfigModule,
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => {
        const redisConfig = configService.getOrThrow<RedisConfig>('redis');
        return {
          readyLog: true,
          config: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
          },
        };
      },
    })
  ],
  providers: [
    LinkedinCrawlerHandler,
    Web3CareerCrawlerHandler,
    CrawlerHandlerFactory,
    {
      provide: 'CRAWLER_HANDLERS',
      useFactory: (...handles: CrawlerHandler[]) => {
        return handles;
      },
      inject: [
        LinkedinCrawlerHandler,
        Web3CareerCrawlerHandler,
      ],
    },
    CrawlerService,
  ],
  exports: ['CRAWLER_HANDLERS', CrawlerHandlerFactory],
})
export class CrawlerModule {
}
