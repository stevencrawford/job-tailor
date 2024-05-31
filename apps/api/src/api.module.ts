import { Module } from '@nestjs/common';
import { AppService } from './services/app.service';
import { ConfigModule } from '@nestjs/config';
import config from '@libs/nestjs-libraries/config/config';
import { configSchema } from '@libs/nestjs-libraries/config/config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
      validate: (env) => configSchema.parse(env)
    }),
    ApiModule
  ],
  controllers: [],
  providers: [AppService]
})
export class ApiModule {
}
