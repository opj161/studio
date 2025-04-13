/**
 * Validation schemas and utilities for input validation
 */

import { z } from 'zod';
import { ValidationError } from './errors';
import { isDataURI } from './utils';

// Base model settings schema
export const modelSettingsSchema = z.object({
  gender: z.enum(['male', 'female', 'non-binary']),
  bodyType: z.enum(['slim', 'athletic', 'average', 'plus-size']),
  ageRange: z.enum(['18-25', '26-35', '36-45', '46-60', '60+']),
  ethnicity: z.enum(['caucasian', 'black', 'asian', 'hispanic', 'middle-eastern', 'mixed']),
});

// Environment settings schema
export const environmentSettingsSchema = z.object({
  description: z.string().min(3).max(200),
  lighting: z.enum(['natural', 'studio', 'soft', 'dramatic', 'bright']),
  lensStyle: z.enum(['portrait', 'fashion', 'product', 'editorial', 'casual']),
});

// URL validation schema with better error messages
export const urlSchema = z.string().url({
  message: "Please enter a valid URL starting with http:// or https://",
}).refine(
  (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  {
    message: "The URL format is invalid",
  }
);

// Schema allowing HTTP(S) URLs or base64 image Data URIs
export const imageUrlOrDataUriSchema = z.string().refine(
  (val) => isDataURI(val) || /^(https?:\/\/)/.test(val),
  { message: "Must be a valid URL starting with http(s):// or a base64 image Data URI" }
).pipe(z.string().min(20, { message: "Input seems too short to be a valid URL or Data URI" })); // Basic length check

// Image URL validation with additional checks (applied only if it's a URL)
export const imageUrlSchema = imageUrlOrDataUriSchema.refine(
  (url) => {
    // If it's a Data URI, skip the extension check
    if (isDataURI(url)) {
      return true;
    }
    // Otherwise, perform checks for URLs
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.endsWith('.jpg') ||
      lowerUrl.endsWith('.jpeg') ||
      lowerUrl.endsWith('.png') ||
      lowerUrl.endsWith('.webp') ||
      lowerUrl.endsWith('.gif') ||
      lowerUrl.includes('image') ||
      // Allow URLs that might be image APIs without extensions
      lowerUrl.includes('picsum') ||
      lowerUrl.includes('pngimg') ||
      lowerUrl.includes('placeholder')
    );
  },
  {
    message: "The URL doesn't appear to be an image. Please provide a direct link to an image file.",
  }
);

// Generation input schema with detailed validation
export const generateClothingImageInputSchema = z.object({
  clothingItemUrl: imageUrlOrDataUriSchema, // Use the schema that allows Data URI or URL
  modelGender: modelSettingsSchema.shape.gender,
  modelBodyType: modelSettingsSchema.shape.bodyType,
  modelAgeRange: modelSettingsSchema.shape.ageRange,
  modelEthnicity: modelSettingsSchema.shape.ethnicity,
  environmentDescription: environmentSettingsSchema.shape.description,
  lightingStyle: environmentSettingsSchema.shape.lighting,
  lensStyle: environmentSettingsSchema.shape.lensStyle,
});

// Helper function to validate with better error handling
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Get the first error for a cleaner user experience
      const firstError = error.errors[0];
      const field = firstError.path.join('.');
      throw new ValidationError(
        firstError.message,
        field,
        error.errors
      );
    }
    throw error;
  }
}

// Validate image URL specifically
export function validateImageUrl(url: string): string {
  return validate(imageUrlSchema, url);
}
