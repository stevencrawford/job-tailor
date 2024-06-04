import { Inject, Injectable } from '@nestjs/common';
import { AIProvider } from './ai-provider.interface';

export type SupportProviders = 'openai' | 'groq';

@Injectable()
export class AIProviderFactory {
  constructor(
    @Inject('AI_PROVIDERS') private readonly providers: AIProvider[],
  ) {}

  get(identifier: SupportProviders): AIProvider {
    for (const provider of this.providers) {
      if (provider.identifier == identifier) {
        return provider;
      }
    }

    return null;
  }
}
