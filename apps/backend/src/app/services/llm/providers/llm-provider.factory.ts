import { Inject, Injectable } from '@nestjs/common';
import { LlmProvider } from './llm-provider.interface';

export type SupportProviders = 'openai' | 'groq';

@Injectable()
export class LlmProviderFactory {
  constructor(
    @Inject('AI_PROVIDERS') private readonly providers: LlmProvider[],
  ) {}

  get(identifier: SupportProviders): LlmProvider {
    for (const provider of this.providers) {
      if (provider.identifier == identifier) {
        return provider;
      }
    }

    throw new Error(`No provider registered for ${identifier}.`);
  }
}
