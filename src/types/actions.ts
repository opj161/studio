import { z } from 'zod';
import { generateClothingImageInputSchema } from '@/lib/validation';

// Input type for the generateClothingImage function
export type GenerateClothingImageInput = {
  clothingItemUrl: string;
  modelGender: string;
  modelBodyType: string;
  modelAgeRange: string;
  modelEthnicity: string;
  environmentDescription: string;
  lightingStyle: string;
  lensStyle: string;
};

// Output type for the generateClothingImage function
export type GenerateClothingImageOutput = {
  generatedImageUrl: string; // Data URL of the generated image
  promptUsed: string;
};

// Error response type
export type GenerationError = {
  code: 'API_ERROR' | 'VALIDATION_ERROR' | 'PROCESSING_ERROR' | 'NETWORK_ERROR';
  message: string;
  details?: any;
};
