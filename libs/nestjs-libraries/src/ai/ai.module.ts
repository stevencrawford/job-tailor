import { Global, Module } from '@nestjs/common';
import { GroqProvider } from './providers/groq.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AIProviderFactory } from './ai-provider.factory';
import { AIProvider } from './ai-provider.interface';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    GroqProvider,
    OpenAIProvider,
    AIProviderFactory,
    {
      provide: 'AI_PROVIDERS',
      useFactory: (...providers: AIProvider[]) => {
        return providers;
      },
      inject: [
        GroqProvider,
        OpenAIProvider,
      ],
    },
  ],
  exports: ['AI_PROVIDERS', AIProviderFactory],
})
export class AIModule {}
