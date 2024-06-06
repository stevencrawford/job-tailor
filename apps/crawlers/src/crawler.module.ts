import { Module } from '@nestjs/common';
import { CrawlerService } from './app/crawler.service';
import { CrawlerHandler } from './app/crawler-handler.interface';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LinkedinCrawlerHandler } from './app/handlers/linkedin.handler';
import { CrawlerHandlerFactory } from './app/crawler-handler.factory';
import { RedisModule } from '@songkeys/nestjs-redis';
import config, { Config, RedisConfig } from '@libs/nestjs-libraries/config/config';
import { Web3CareerCrawlerHandler } from './app/handlers/web3-careers.handler';
import { HttpBinCrawlerHandler } from './app/handlers/httpbin-io.handler';
import { JobsQueueController } from './app/queue/jobs-queue.controller';
import { configSchema } from '@libs/nestjs-libraries/config/config.schema';
import { BullMqModule } from '@libs/nestjs-libraries/bull-mq-transport/bull-mq.module';
import { JobService } from '@libs/nestjs-libraries/services/job.service';
import { AIModule } from '@libs/nestjs-libraries/ai/ai.module';
import { DatabaseModule } from '@libs/nestjs-libraries/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
      validate: (env) => configSchema.parse(env),
    }),
    BullMqModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config>) => {
        const redisConfig = configService.getOrThrow<RedisConfig>('redis');
        return {
          connection: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
          },
        };
      },
    }),
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
    }),
    DatabaseModule,
    AIModule,
  ],
  providers: [
    HttpBinCrawlerHandler,
    LinkedinCrawlerHandler,
    Web3CareerCrawlerHandler,
    CrawlerHandlerFactory,
    {
      provide: 'CRAWLER_HANDLERS',
      useFactory: (...handles: CrawlerHandler[]) => {
        return handles;
      },
      inject: [
        HttpBinCrawlerHandler,
        LinkedinCrawlerHandler,
        Web3CareerCrawlerHandler,
      ],
    },
    CrawlerService,
    JobService
  ],
  controllers: [JobsQueueController],
})
export class CrawlerModule {
}
