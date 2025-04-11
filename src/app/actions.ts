'use server';

// Use the official Google Generative AI SDK
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';

// Import our new utilities
import { imageCache } from '@/lib/cache-service';
import { PromptBuilder } from '@/lib/prompt-builder';
import { validate, generateClothingImageInputSchema } from '@/lib/validation';
import { ApiError, ImageProcessingError, NetworkError, ValidationError, toAppError } from '@/lib/errors';
import { ModelSettings, EnvironmentSettings } from '@/types';
import { GenerateClothingImageInput, GenerateClothingImageOutput, GenerationError } from '@/types/actions';
import { isDataURI } from '@/lib/utils'; // Import the helper

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
 * Generate a unique filename for storing generated images (using Node.js crypto)
 */
function generateUniqueFilenameSync(imageData: string): string {
  const timestamp = Date.now();
  // Use Node.js crypto for server-side actions
  const hash = crypto
    .createHash('sha256')
    .update(imageData + timestamp)
    .digest('hex');

  return `${timestamp}-${hash.slice(0, 8)}.png`;
}

/**
 * Store generated images on the server with metadata
 */
async function saveGeneratedImage(
  imageData: string, // Full data URI (e.g., data:image/png;base64,...)
  metadata: {
    clothingItemUrl: string, // Original source URL or truncated base64 string
    modelSettings: ModelSettings, // Use specific type
    environmentSettings: EnvironmentSettings // Use specific type
  }
): Promise<string> { // Returns the relative public path (e.g., /generated/...)
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

    // Generate unique filename (use sync version here)
    const filename = generateUniqueFilenameSync(imageData); // Use sync version
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

    // Return the relative path accessible from the web server root
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
      console.log('Using cached generation result for key:', cacheKey);
      return cachedResult;
    }
    console.log('No cache hit for key:', cacheKey, '. Generating new image.');


    // Continue with normal generation if not cached
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_GENAI_API_KEY is not set.");
      throw new ApiError("GOOGLE_GENAI_API_KEY is not set in environment variables.");
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Define the specific model for image generation
    // !!! IMPORTANT: Verify this model name ("gemini-1.5-flash" or another) is correct and available for image GENERATION via the API. !!!
    // !!! Consult Google Cloud documentation for the appropriate model identifier. !!!
    const modelIdentifier = "gemini-1.5-flash"; // Placeholder - VERIFY THIS
    const model = genAI.getGenerativeModel({ model: modelIdentifier });

    // --- Handle base64 Data URI or download URL ---
    let inputBase64Image: string;
    let inputMimeType: string;
    let originalSource = input.clothingItemUrl; // Keep track of original input

    if (isDataURI(input.clothingItemUrl)) {
      console.log("Using provided base64 image data.");
      const match = input.clothingItemUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.*)$/);
      if (!match || match.length < 3) {
        throw new ImageProcessingError("Invalid image data format provided.");
      }
      inputMimeType = match[1];
      inputBase64Image = match[2];
      // Optionally truncate base64 if storing it in metadata later
      originalSource = `${input.clothingItemUrl.substring(0, 50)}... (base64)`;
    } else {
      console.log("Downloading image from URL:", input.clothingItemUrl);
      // Download only if it's a URL
      try {
        const downloaded = await downloadImageAsBase64(input.clothingItemUrl);
        inputBase64Image = downloaded.data;
        inputMimeType = downloaded.mimeType;
      } catch (downloadError) {
        // Provide more specific feedback if download fails
        throw new NetworkError(`Failed to download image from URL: ${input.clothingItemUrl}`, downloadError instanceof Error ? downloadError : undefined);
      }
    }
    // --- End image handling ---

    // Create model and environment settings objects
    // Zod validation ensures these types match ModelSettings/EnvironmentSettings interfaces
    const modelSettings: ModelSettings = {
      gender: input.modelGender,
      bodyType: input.modelBodyType,
      ageRange: input.modelAgeRange,
      ethnicity: input.modelEthnicity,
    };

    const environmentSettings: EnvironmentSettings = {
      description: input.environmentDescription,
      lighting: input.lightingStyle,
      lensStyle: input.lensStyle,
    };

    // Build a structured prompt using our PromptBuilder
    const prompt = PromptBuilder.createPrompt(modelSettings, environmentSettings);

    // Prepare the content parts according to the @google/genai example structure
    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: inputMimeType,
          data: inputBase64Image,
        },
      },
    ];

    console.log(`Generating image with model: ${modelIdentifier}`);
    // Generate content using the model.generateContent method
    const generationResult = await model.generateContent({ contents });
    const response = generationResult.response; // Extract the response part

    // Improved error handling for API responses
    if (!response || !response.candidates || response.candidates.length === 0) {
       console.error("Invalid or empty response from AI service:", response);
      throw new ApiError('The AI service returned an invalid or empty response object', undefined, { response });
    }

    // Process the response to extract the generated image
    let generatedImageUrl = ''; // This will hold the persistent URL
    const candidate = response.candidates[0]; // Get the first candidate

    if (candidate && candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.text) {
          // Log any text part for debugging or potential use
          console.log("Received text part from Gemini:", part.text);
        }
        // Look for inlineData which contains the image
        if (part.inlineData) {
          const imageData = part.inlineData.data; // This is base64
          const imageMimeType = part.inlineData.mimeType;

          // *** NEW: Save the image and get persistent URL ***
          const fullDataUrl = `data:${imageMimeType};base64,${imageData}`;
          const persistentImageUrl = await saveGeneratedImage(
            fullDataUrl, // Pass the full data URL to save function
            {
              clothingItemUrl: originalSource, // Store original source (URL or truncated base64)
              modelSettings: modelSettings, // Pass constructed settings
              environmentSettings: environmentSettings // Pass constructed settings
            }
          );
          console.log("Saved image to:", persistentImageUrl);
          generatedImageUrl = persistentImageUrl; // Use the persistent URL
          // *** END NEW ***
          break; // Found the image, exit the loop
        }
      }
    } else {
       console.error("Invalid candidate structure in AI response:", candidate);
      throw new ApiError(
        "Failed to get valid candidates or parts from the Gemini response.",
        undefined,
        { response } // Include the raw response for debugging if possible
      );
    }

    // Check if an image was actually extracted and saved
    if (!generatedImageUrl) {
      console.error("Failed to extract and save image data from the response parts.");
      throw new ImageProcessingError(
        "Failed to find and process generated image data in the response."
      );
    }

    // Create the result object with the persistent URL
    const result: GenerateClothingImageOutput = {
      generatedImageUrl: generatedImageUrl, // Now contains /generated/filename.png
      promptUsed: prompt,
    };

    // Cache the result (containing the persistent URL)
    console.log('Caching result for key:', cacheKey);
    await imageCache.set(cacheKey, result);

    return result;
  } catch (error: unknown) {
    console.error("Error in generateClothingImage action:", error);

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
          message: 'Failed to connect to the AI service or download image. Please check your internet connection and image URL.'
        }
      };
    } else if (appError instanceof ApiError) {
      return {
        error: {
          code: 'API_ERROR',
          message: `AI Service Error: ${appError.message}`, // Add prefix for clarity
          details: appError.statusCode ? { statusCode: appError.statusCode } : undefined
        }
      };
    } else if (appError instanceof ImageProcessingError) {
      return {
        error: {
          code: 'PROCESSING_ERROR',
          message: `Image Processing Error: ${appError.message}`, // Add prefix
          details: appError.message // Keep original message in details
        }
      };
    } else {
      // Catch-all for unexpected errors
      return {
        error: {
          code: 'PROCESSING_ERROR', // Use a generic code for unknown internal errors
          message: 'An unexpected error occurred while processing your request.',
          details: process.env.NODE_ENV === 'development' ? appError.message : undefined
        }
      };
    }
  }
}
