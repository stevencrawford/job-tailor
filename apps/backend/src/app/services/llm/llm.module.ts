import { Module } from '@nestjs/common';
import { GroqProvider } from './providers/groq.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { LlmProviderFactory } from './providers/llm-provider.factory';
import { LlmProvider } from './providers/llm-provider.interface';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    GroqProvider,
    OpenAIProvider,
    LlmProviderFactory,
    {
      provide: 'AI_PROVIDERS',
      useFactory: (...providers: LlmProvider[]) => {
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
