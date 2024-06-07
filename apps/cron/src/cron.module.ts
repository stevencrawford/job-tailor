import { Module } from '@nestjs/common';
import { FetchJobsCron } from './tasks/fetch-jobs.cron';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config, { Config, RedisConfig } from '@libs/nestjs-libraries/config/config';
import { configSchema } from '@libs/nestjs-libraries/config/config.schema';
import { BullMqModule } from '@libs/nestjs-libraries/bull-mq-transport/bull-mq.module';
import { DatabaseModule } from '@libs/nestjs-libraries/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
      validate: (env) => configSchema.parse(env),
    }),
    ScheduleModule.forRoot(),
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
    DatabaseModule,
  ],
  providers: [FetchJobsCron],
})
export class CronModule {
}
