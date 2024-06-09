import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@songkeys/nestjs-redis';
import { BullMqModule } from '@libs/nestjs-libraries/bull-mq-transport/bull-mq.module';
import { AIModule } from './app/services/ai/ai.module';
import { WebCollectorModule } from './app/services/web-collector/web-collector.module';
import { ApiCollectorModule } from './app/services/api-collector/api-collector.module';
import { configSchema } from './app/configuration/config.schema';
import config, { Config, RedisConfig } from './app/configuration/config';
import { PrismaModule } from './app/services/prisma/prisma.module';
import { JobModule } from './app/services/job/job.module';
import { CronService } from './app/services/cron.service';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsModule } from './app/events/events.module';
import { ApiModule } from './app/api/api.module';

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
    ScheduleModule.forRoot(),
    EventsModule,
    WebCollectorModule,
    ApiCollectorModule,
    JobModule,
    PrismaModule,
    AIModule,
    ApiModule,
  ],
  controllers: [],
  providers: [CronService],
})
export class AppModule {
}
