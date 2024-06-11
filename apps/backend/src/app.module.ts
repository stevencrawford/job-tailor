import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@songkeys/nestjs-redis';
import { AIModule } from './app/services/ai/ai.module';
import { configSchema } from './app/configuration/config.schema';
import config, { Config, RedisConfig } from './app/configuration/config';
import { JobModule } from './app/services/job/job.module';
import { CronService } from './app/services/cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiModule } from './app/api/api.module';
import { DataCollectorModule } from './app/services/data-collector/data-collector.module';
import { BullModule } from '@nestjs/bullmq';

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
    JobModule,
    AIModule,
    ApiModule,
  ],
  controllers: [],
  providers: [CronService],
})
export class AppModule {
}
