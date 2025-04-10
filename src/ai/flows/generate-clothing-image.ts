'use server';
/**
 * @fileOverview Generates an image of a model wearing a clothing item based on customized attributes.
 *
 * - generateClothingImage - A function that handles the image generation process.
 * - GenerateClothingImageInput - The input type for the generateClothingImage function.
 * - GenerateClothingImageOutput - The return type for the generateClothingImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

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

export async function generateClothingImage(input: GenerateClothingImageInput): Promise<GenerateClothingImageOutput> {
  return generateClothingImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateClothingImagePrompt',
  input: {
    schema: z.object({
      clothingItemUrl: z.string().describe('The URL of the clothing item image.'),
      modelGender: z.string().describe('The gender of the virtual model.'),
      modelBodyType: z.string().describe('The body type of the virtual model.'),
      modelAgeRange: z.string().describe('The age range of the virtual model.'),
      modelEthnicity: z.string().describe('The ethnicity of the virtual model.'),
      environmentDescription: z.string().describe('The description of the environment.'),
      lightingStyle: z.string().describe('The lighting style of the environment.'),
      lensStyle: z.string().describe('The lens style used for the image.'),
    }),
  },
  output: {
    schema: z.object({
      generatedImageUrl: z.string().describe('The URL of the generated image.'),
      promptUsed: z.string().describe('The prompt used to generate the image.'),
    }),
  },
  prompt: `Generate an image of a virtual model wearing the provided clothing item in the specified environment.

Clothing Item:
{{media url=clothingItemUrl}}

Model Attributes:
- Gender: {{{modelGender}}}
- Body Type: {{{modelBodyType}}}
- Age Range: {{{modelAgeRange}}}
- Ethnicity: {{{modelEthnicity}}}

Environment Settings:
- Background: {{{environmentDescription}}}
- Lighting: {{{lightingStyle}}}
- Lens Style: {{{lensStyle}}}

The generated image should realistically depict the clothing item on the model with the specified attributes and environment settings.  Return the url to the image. Also return the prompt used to generate the image.
`
});

const generateClothingImageFlow = ai.defineFlow<
  typeof GenerateClothingImageInputSchema,
  typeof GenerateClothingImageOutputSchema
>(
  {
    name: 'generateClothingImageFlow',
    inputSchema: GenerateClothingImageInputSchema,
    outputSchema: GenerateClothingImageOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);

      // Check if output is null or undefined
      if (!output) {
        console.error("Error: Image generation failed, output is null or undefined.");
        throw new Error("Image generation failed: No output received from the AI.");
      }

      // Check if generatedImageUrl is valid
      if (!output.generatedImageUrl) {
        console.error("Error: generatedImageUrl is null or undefined.");
        console.log("Full Output:", output); // Log the entire output object for inspection
        throw new Error("Image generation failed: No generated image URL received from the AI.");
      }

    // Log the generated image URL and prompt
    console.log("Generated Image URL:", output?.generatedImageUrl);
    console.log("Prompt Used:", output?.promptUsed);

      return output!;
    } catch (error) {
      console.error("Error in generateClothingImageFlow:", error);
      // Re-throw the error to be caught in the component
      throw error;
    }
  }
);
