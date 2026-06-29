import { openAIItineraryProvider } from './openAIItineraryProvider';

export function createAiItineraryProvider(provider = openAIItineraryProvider) {
  return {
    generate: (input) => provider.generate(input),
  };
}

export const defaultAiItineraryProvider = createAiItineraryProvider();
