import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      // Increase the maxContentSize to accommodate larger images (e.g., 20MB)
      maxContentSize: 20 * 1024 * 1024,
    }),
  ],
  model: 'googleai/gemini-2.0-flash-exp',
});
