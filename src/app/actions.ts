'use server';

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

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
  generatedImageUrl: z.string().describe('The URL of the generated image.'),
  promptUsed: z.string().describe('The prompt used to generate the image.'),
});
export type GenerateClothingImageOutput = z.infer<typeof GenerateClothingImageOutputSchema>;

async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return base64;
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
}

export async function generateClothingImage(input: GenerateClothingImageInput): Promise<GenerateClothingImageOutput> {
  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY || "" });

    const base64Image = await downloadImageAsBase64(input.clothingItemUrl);

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

The generated image should realistically depict the clothing item on the model with the specified attributes and environment settings.`;

    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/png",
          data: base64Image,
        },
      },
    ];

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: contents,
      config: {
        responseModalities: ["Text", "Image"],
      },
    });
    
    let generatedImageUrl = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log("Generated Text:", part.text);
        generatedImageUrl = part.text;
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        generatedImageUrl = `data:image/png;base64,${imageData}`;
      }
    }
    const filename = `generated_${uuidv4()}.png`;
    return {
      generatedImageUrl: generatedImageUrl,
      promptUsed: prompt,
    };
  } catch (error: any) {
    console.error("Error generating image:", error);
    throw new Error(error.message || "Failed to generate image");
  }
}
