import { z } from 'zod';
import { generateClothingImageInputSchema } from '@/lib/validation';

// Input type for the generateClothingImage function - Inferred from Zod schema
export type GenerateClothingImageInput = z.infer<typeof generateClothingImageInputSchema>;

// Output type for the generateClothingImage function
export type GenerateClothingImageOutput = {
  generatedImageUrl: string; // Will become persistent URL later
  promptUsed: string;
};

// Error response type
export type GenerationError = {
  code: 'API_ERROR' | 'VALIDATION_ERROR' | 'PROCESSING_ERROR' | 'NETWORK_ERROR';
  message: string;
  details?: any;
};
