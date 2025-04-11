/**
 * PromptBuilder - A utility for constructing well-structured prompts for the AI model
 * 
 * This helps create consistent, high-quality prompts that lead to better generation results.
 */

import { ModelSettings, EnvironmentSettings } from '@/types';

export class PromptBuilder {
  private sections: string[] = [];
  
  constructor() {
    // Initialize with system context
    this.addSystemContext();
  }

  /**
   * Add system context to help guide the AI model
   */
  private addSystemContext(): this {
    this.sections.push(
      "Generate a photorealistic image of a virtual model wearing the provided clothing item with the following specifications:"
    );
    return this;
  }

  /**
   * Add model attributes section
   */
  public addModelAttributes(settings: ModelSettings): this {
    this.sections.push(
      "Model Attributes:",
      `- Gender: ${settings.gender}`,
      `- Body Type: ${settings.bodyType}`,
      `- Age Range: ${settings.ageRange}`,
      `- Ethnicity: ${settings.ethnicity}`
    );
    return this;
  }

  /**
   * Add environment settings section
   */
  public addEnvironmentSettings(settings: EnvironmentSettings): this {
    this.sections.push(
      "Environment Settings:",
      `- Background: ${settings.description}`,
      `- Lighting: ${settings.lighting}`,
      `- Lens Style: ${settings.lensStyle}`
    );
    return this;
  }

  /**
   * Add specific instructions for the AI model
   */
  public addInstructions(): this {
    this.sections.push(
      "Instructions:",
      "- Create a photorealistic image that clearly shows the model wearing the provided clothing item",
      "- Ensure the clothing item is clearly visible and properly fitted to the model",
      "- Maintain natural proportions and realistic lighting",
      "- The model should be in a natural pose that showcases the clothing item well",
      "- The image should be high quality and suitable for e-commerce use"
    );
    return this;
  }

  /**
   * Add custom section to the prompt
   */
  public addCustomSection(title: string, lines: string[]): this {
    this.sections.push(title, ...lines.map(line => `- ${line}`));
    return this;
  }

  /**
   * Build the final prompt string
   */
  public build(): string {
    return this.sections.join('\n\n');
  }

  /**
   * Create a complete prompt from model and environment settings
   */
  public static createPrompt(
    modelSettings: ModelSettings,
    environmentSettings: EnvironmentSettings
  ): string {
    return new PromptBuilder()
      .addModelAttributes(modelSettings)
      .addEnvironmentSettings(environmentSettings)
      .addInstructions()
      .build();
  }
}
