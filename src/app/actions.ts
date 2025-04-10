// --- START OF FILE actions.ts ---

'use server';

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
// Removed uuidv4 as it wasn't used in the final return value
// import { v4 as uuidv4 } from 'uuid';

const GenerateClothingImageInputSchema = z.object({
  clothingItemUrl: z.string().describe('The URL of the clothing item image.'),
  modelGender: z.string().describe('The gender of the virtual model.'),
  modelBodyType: z.string().describe('The body type of the virtual model.'),
  modelAgeRange: z.string().describe('The age range of the virtual model.'),
  modelEthnicity: z.string().describe('The ethnicity of the virtual model.'),
  environmentDescription: z.string().describe('The description of the environment.'),
  lightingStyle: z.string().describe('The lighting style of the environment.'),
  lensStyle: z.string().describe('The lens style used for the image.'),
});
export type GenerateClothingImageInput = z.infer<typeof GenerateClothingImageInputSchema>;

const GenerateClothingImageOutputSchema = z.object({
  generatedImageUrl: z.string().describe('The URL (data URL) of the generated image.'), // Clarified it's a data URL
  promptUsed: z.string().describe('The prompt used to generate the image.'),
});
export type GenerateClothingImageOutput = z.infer<typeof GenerateClothingImageOutputSchema>;

async function downloadImageAsBase64(imageUrl: string): Promise<{ data: string, mimeType: string }> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
        console.warn(`Downloaded content type is not an image: ${contentType}. Attempting to proceed.`);
        // Default to png if unsure, or throw an error if stricter validation is needed
    }
    const detectedMimeType = contentType || 'image/png'; // Use detected or default

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return { data: base64, mimeType: detectedMimeType };
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
}

export async function generateClothingImage(input: GenerateClothingImageInput): Promise<GenerateClothingImageOutput> {
  try {
    // Input validation (optional but recommended if not done elsewhere)
    GenerateClothingImageInputSchema.parse(input);

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_GENAI_API_KEY is not set in environment variables.");
    }

    // Initialize the client (matches example pattern)
    const genAI = new GoogleGenAI({ apiKey: apiKey }); // Changed variable name from 'ai' to 'genAI' to match original code style

    // Download and prepare the input image
    const { data: base64Image, mimeType: inputMimeType } = await downloadImageAsBase64(input.clothingItemUrl);

    // Construct the prompt
    const prompt = `Generate an image of a virtual model wearing the provided clothing item in the specified environment.

Model Attributes:
- Gender: ${input.modelGender}
- Body Type: ${input.modelBodyType}
- Age Range: ${input.modelAgeRange}
- Ethnicity: ${input.modelEthnicity}

Environment Settings:
- Background: ${input.environmentDescription}
- Lighting: ${input.lightingStyle}
- Lens Style: ${input.lensStyle}

The generated image should realistically depict the clothing item on the model with the specified attributes and environment settings. Ensure the generated image clearly shows the model and the clothing item.`;

    // Prepare the content parts
    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: inputMimeType, // Use the detected mimeType from download
          data: base64Image,
        },
      },
    ];

    // Generate content using the model (matches example pattern)
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation", // Check if this model name is still correct/available
      contents: contents,
      config: {
        // Set responseModalities correctly
        responseModalities: ["Text", "Image"], // Corrected syntax
      },
    });

    // Process the response to extract the generated image
    let generatedImageUrl = '';
    // Add more robust checking for response structure
    const candidate = response?.candidates?.[0];
    if (candidate && candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        // Primarily look for inlineData which contains the image
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const imageMimeType = part.inlineData.mimeType;
          generatedImageUrl = `data:${imageMimeType};base64,${imageData}`;
          break; // Found the image, exit the loop
        } else if (part.text) {
          // Log any text part for debugging, but don't assign it to generatedImageUrl
          console.log("Received text part from Gemini:", part.text);
        }
      }
    } else {
      console.error("Unexpected response format from Gemini:", JSON.stringify(response, null, 2));
      throw new Error("Failed to get valid candidates or parts from the Gemini response.");
    }

    // Check if an image was actually extracted
    if (!generatedImageUrl) {
        console.error("No image data found in the Gemini response parts:", JSON.stringify(candidate?.content?.parts, null, 2));
        throw new Error("Failed to find generated image data in the response.");
    }

    // Return the result
    return {
      generatedImageUrl: generatedImageUrl,
      promptUsed: prompt,
    };
  } catch (error: any) {
    console.error("Error generating image:", error);
    // Log specific details if available (e.g., Zod validation errors)
    if (error instanceof z.ZodError) {
        console.error("Input validation failed:", error.errors);
    } else {
        console.error("Detailed error information:", error.message, error.stack);
    }
    // Re-throw a user-friendly error or the original error depending on needs
    throw new Error(error.message || "Failed to generate image. Check the server logs for more details.");
  }
}
// --- END OF FILE actions.ts ---