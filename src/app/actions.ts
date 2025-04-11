'use server';

import { GoogleGenAI } from "@google/genai";
import { cache } from 'react';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Import our new utilities
import { imageCache } from '@/lib/cache-service';
import { PromptBuilder } from '@/lib/prompt-builder';
import { validate, generateClothingImageInputSchema } from '@/lib/validation';
import { ApiError, ImageProcessingError, NetworkError, ValidationError, toAppError } from '@/lib/errors';
import { ModelSettings, EnvironmentSettings } from '@/types';
import { GenerateClothingImageInput, GenerateClothingImageOutput, GenerationError } from '@/types/actions';

/**
 * Download an image from a URL and convert it to base64
 */
async function downloadImageAsBase64(imageUrl: string): Promise<{ data: string, mimeType: string }> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new ImageProcessingError(
        `Failed to download image: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.warn(`Downloaded content type is not an image: ${contentType}. Attempting to proceed.`);
    }

    const detectedMimeType = contentType || 'image/png'; // Use detected or default
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return { data: base64, mimeType: detectedMimeType };
  } catch (error) {
    console.error("Error downloading image:", error);
    if (error instanceof ImageProcessingError) {
      throw error;
    }
    throw new NetworkError(
      `Failed to download image from ${imageUrl}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Generate a unique filename for storing generated images
 */
async function generateUniqueFilename(imageData: string): Promise<string> {
  const timestamp = Date.now();
  // Use a different approach since crypto.createHash is not available in the browser
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(imageData + timestamp)
  );

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `${timestamp}-${hashHex.slice(0, 8)}.png`;
}

/**
 * Store generated images on the server with metadata
 */
async function saveGeneratedImage(
  imageData: string,
  metadata: {
    clothingItemUrl: string,
    modelSettings: Record<string, string>,
    environmentSettings: Record<string, string>
  }
): Promise<string> {
  try {
    // Extract base64 data
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Create directories if they don't exist
    const publicDir = path.join(process.cwd(), 'public');
    const generatedDir = path.join(publicDir, 'generated');
    const metadataDir = path.join(publicDir, 'metadata');

    await fs.mkdir(generatedDir, { recursive: true });
    await fs.mkdir(metadataDir, { recursive: true });

    // Generate unique filename
    const filename = await generateUniqueFilename(imageData);
    const imagePath = path.join(generatedDir, filename);
    const metadataPath = path.join(metadataDir, `${filename}.json`);

    // Save image and metadata
    await fs.writeFile(imagePath, buffer);
    await fs.writeFile(metadataPath, JSON.stringify({
      timestamp: Date.now(),
      sourceImage: metadata.clothingItemUrl,
      modelSettings: metadata.modelSettings,
      environmentSettings: metadata.environmentSettings
    }, null, 2));

    return `/generated/${filename}`;
  } catch (error) {
    console.error("Error saving generated image:", error);
    throw new ImageProcessingError(
      "Failed to save the generated image",
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Cache the generation function to improve performance
 */
export const generateClothingImageCached = cache(async (input: GenerateClothingImageInput) => {
  return generateClothingImage(input);
});

/**
 * Generate an image of a model wearing the provided clothing item
 * with the specified attributes and environment settings
 */
export async function generateClothingImage(input: GenerateClothingImageInput): Promise<GenerateClothingImageOutput | { error: GenerationError }> {
  try {
    // Validate input parameters
    validate(generateClothingImageInputSchema, input);

    // Check if we have this exact request cached
    const cacheKey = imageCache.createCacheKey(input);
    const cachedResult = await imageCache.get<GenerateClothingImageOutput>(cacheKey);

    if (cachedResult) {
      console.log('Using cached generation result');
      return cachedResult;
    }

    // Continue with normal generation if not cached
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new ApiError("GOOGLE_GENAI_API_KEY is not set in environment variables.");
    }

    // Initialize the Google Gemini AI client
    const genAI = new GoogleGenAI({ apiKey });

    // Download and prepare the input image
    const { data: base64Image, mimeType: inputMimeType } = await downloadImageAsBase64(input.clothingItemUrl);

    // Create model and environment settings objects
    const modelSettings: ModelSettings = {
      gender: input.modelGender as any,
      bodyType: input.modelBodyType as any,
      ageRange: input.modelAgeRange as any,
      ethnicity: input.modelEthnicity as any,
    };

    const environmentSettings: EnvironmentSettings = {
      description: input.environmentDescription,
      lighting: input.lightingStyle as any,
      lensStyle: input.lensStyle as any,
    };

    // Build a structured prompt using our PromptBuilder
    const prompt = PromptBuilder.createPrompt(modelSettings, environmentSettings);

    // Prepare the content parts for the AI model
    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: inputMimeType,
          data: base64Image,
        },
      },
    ];

    // Generate content using the model
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    // Improved error handling for API responses
    if (!response) {
      throw new ApiError('The AI service returned an empty response');
    }

    // Process the response to extract the generated image
    let generatedImageUrl = '';
    const candidate = response?.candidates?.[0];

    if (candidate && candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        // Look for inlineData which contains the image
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const imageMimeType = part.inlineData.mimeType;
          generatedImageUrl = `data:${imageMimeType};base64,${imageData}`;
          break; // Found the image, exit the loop
        } else if (part.text) {
          // Log any text part for debugging
          console.log("Received text part from Gemini:", part.text);
        }
      }
    } else {
      throw new ApiError(
        "Failed to get valid candidates or parts from the Gemini response.",
        undefined,
        { response }
      );
    }

    // Check if an image was actually extracted
    if (!generatedImageUrl) {
      throw new ImageProcessingError(
        "Failed to find generated image data in the response."
      );
    }

    // Create the result object
    const result: GenerateClothingImageOutput = {
      generatedImageUrl,
      promptUsed: prompt,
    };

    // Cache the result for future requests
    await imageCache.set(cacheKey, result);

    return result;
  } catch (error: unknown) {
    console.error("Error generating image:", error);

    // Convert to AppError for consistent error handling
    const appError = toAppError(error);

    // Return appropriate error response based on error type
    if (appError instanceof ValidationError) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: appError.message,
          details: appError.field ? { field: appError.field } : undefined
        }
      };
    } else if (appError instanceof NetworkError) {
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to the AI service. Please check your internet connection.'
        }
      };
    } else if (appError instanceof ApiError) {
      return {
        error: {
          code: 'API_ERROR',
          message: appError.message,
          details: appError.statusCode ? { statusCode: appError.statusCode } : undefined
        }
      };
    } else if (appError instanceof ImageProcessingError) {
      return {
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to process the generated image',
          details: appError.message
        }
      };
    } else {
      return {
        error: {
          code: 'PROCESSING_ERROR',
          message: 'An unexpected error occurred while processing your request',
          details: process.env.NODE_ENV === 'development' ? appError.message : undefined
        }
      };
    }
  }
}
// --- END OF FILE actions.ts ---
