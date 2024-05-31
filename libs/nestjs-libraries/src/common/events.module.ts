import { DynamicModule, Global, Module } from '@nestjs/common';
import { BullMqModule } from '../bull-mq-transport/bull-mq.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config, { Config, RedisConfig } from '../config/config';
import { configSchema } from '../config/config.schema';

@Global()
@Module({})
export class EventsModule {

  public static registerAsync(): DynamicModule {
    return {
      module: EventsModule,
      imports: [
        BullMqModule.forRootAsync({
          imports:[
            ConfigModule.forRoot({
              isGlobal: true,
              cache: true,
              load: [config],
              validate: (env) => configSchema.parse(env),
            }),
          ],
          inject: [ConfigService],
          useFactory: (configService: ConfigService<Config>) => {
            const redisConfig = configService.getOrThrow<RedisConfig>('redis');
            return {
              prefix: redisConfig.keyPrefix + ':events',
              connection: {
                host: redisConfig.host,
                port: redisConfig.port,
                password: redisConfig.password,
                db: redisConfig.db,
              },
            };
          },
        }),
      ],
    };
  }

}
