import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@songkeys/nestjs-redis';
import { configSchema } from '@/app/configuration/config.schema';
import config, { Config, RedisConfig } from '@/app/configuration/config';
import { CronService } from '@/app/services/cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiModule } from '@/app/api/api.module';
import { DataCollectorModule } from '@/app/services/data-collector/data-collector.module';
import { BullModule } from '@nestjs/bullmq';
import { JobCategorizeModule } from '@/app/services/job-categorize/job-categorize.module';
import { JobSummarizeModule } from '@/app/services/job-summarize/job-summarize.module';
import { CandidateModule } from '@/app/services/candidate/candidate.module';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
      validate: (env) => configSchema.parse(env),
    }),
    BullModule.forRootAsync({
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
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter // Or FastifyAdapter from `@bull-board/fastify`
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
    ScheduleModule.forRoot(),
    DataCollectorModule,
    JobCategorizeModule,
    JobSummarizeModule,
    CandidateModule,
    ApiModule,
  ],
  controllers: [],
  providers: [CronService],
})
export class AppModule {
}
