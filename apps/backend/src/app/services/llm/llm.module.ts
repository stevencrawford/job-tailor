import { Module } from '@nestjs/common';
import { GroqProvider } from './providers/groq.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { LlmProviderFactory } from './llm-provider.factory';
import { AIProvider } from './llm-provider.interface';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    GroqProvider,
    OpenAIProvider,
    LlmProviderFactory,
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
  exports: [LlmProviderFactory],
})
export class LlmModule {}
