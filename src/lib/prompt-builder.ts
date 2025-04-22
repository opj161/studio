/**
 * PromptBuilder - A utility for constructing well-structured prompts for the AI model.
 * Modified to closely mimic the structure and content of the successful WordPress plugin prompt.
 */

import { ModelSettings, EnvironmentSettings } from '@/types';

// Helper function to map React App age range to simpler WP-like terms
function mapAgeRange(ageRange: ModelSettings['ageRange']): string {
    const map: Record<ModelSettings['ageRange'], string> = {
        '18-25': 'young adult',
        '26-35': 'adult',
        '36-45': 'middle-aged adult',
        '46-60': 'older adult',
        '60+': 'senior',
    };
    return map[ageRange] || 'adult'; // Default to 'adult' if somehow invalid
}

// Helper function to get descriptive setting text
function getSettingDescription(descriptionKey: EnvironmentSettings['description']): string {
    switch (descriptionKey) {
        case 'studio':
            return "Clean studio setting with a neutral, non-distracting background (e.g., light gray, white, beige).";
        case 'outdoor': // Assuming this maps to 'outdoor_park_daytime' concept
            return "Outdoor nature setting with appropriate natural elements (trees, grass, daylight).";
        case 'urban': // Assuming this maps to 'city_street_daytime' concept
            return "Realistic city street scene during the daytime, potentially with blurred background elements like buildings or traffic.";
        case 'beach': // Assuming this maps to 'beach_daytime' concept
            return "Natural beach setting during the daytime with sand, water, and clear sky elements.";
        // Add more mappings here if the React app has other `description` options
        default:
            // Fallback for unmapped descriptions - less ideal but includes the info
            return `General setting described as: ${descriptionKey}.`;
    }
}


export class PromptBuilder {
  // Keep sections private if only manipulated internally by the static method
  private sections: string[] = [];

  // Constructor no longer adds default system context
  constructor() {}

  // Build the final prompt string (no change needed)
  public build(): string {
    // Filter potentially empty sections before joining (good practice)
    return this.sections.filter(section => section && section.trim() !== '').join('\n\n');
  }

  // --- Methods used by createPrompt ---

  // Builds the initial core instruction sentence embedding model details
  private buildCoreInstruction(settings: ModelSettings): string {
      const descriptors: string[] = [];

      // Add descriptors based on settings (React app types don't have 'unspecified')
      descriptors.push(settings.gender);
      descriptors.push(mapAgeRange(settings.ageRange)); // Use mapped age term
      descriptors.push(settings.ethnicity);
      descriptors.push(settings.bodyType);

      const subjectDescription = descriptors.join(', ') + ' fashion model';
      return `CREATE A PHOTOREALISTIC IMAGE of a ${subjectDescription} standing in a relaxed, natural pose wearing the provided clothing item.`;
  }

  // Adds the descriptive setting section
  private addSettingDescription(settings: EnvironmentSettings): this {
      const settingText = getSettingDescription(settings.description);
      if (settingText) {
          this.sections.push(`Setting: ${settingText}`);
      }
      return this;
  }

  // Adds the fixed "Style" block from the WP plugin
  private addStyleBlock(): this {
      const styleBlock = "The model should look authentic and relatable with a natural expression and a subtle smile. The clothing must fit perfectly and be the visual focus of the image.";
      this.sections.push(`Style: ${styleBlock}`);
      return this;
  }

  // Adds the "Technical details" block, incorporating lighting and lens style
  private addTechnicalDetailsBlock(settings: EnvironmentSettings): this {
      // Start with the WP plugin's base technical block
      let techBlock = "Professional fashion photography lighting with perfect exposure and color accuracy.";
      // Append lighting and lens style from React app settings for more detail
      techBlock += ` Specific lighting style: ${settings.lighting}. Camera lens style: ${settings.lensStyle}.`;

      this.sections.push(`Technical details: ${techBlock}`);
      return this;
  }


  /**
   * Create a complete prompt mimicking the WP plugin structure.
   */
  public static createPrompt(
    modelSettings: ModelSettings,
    environmentSettings: EnvironmentSettings
  ): string {
    const builder = new PromptBuilder();

    // 1. Build and add the core instruction (replaces old system context and model attributes list)
    const coreInstruction = builder.buildCoreInstruction(modelSettings);
    builder.sections.push(coreInstruction); // Start sections with the core instruction

    // 2. Add the descriptive setting section (replaces old environment list)
    builder.addSettingDescription(environmentSettings);

    // 3. Add the WP Style block (replaces old instructions list)
    builder.addStyleBlock();

    // 4. Add the WP Technical details block, enhanced with lighting/lens
    builder.addTechnicalDetailsBlock(environmentSettings);

    // 5. Build the final string
    return builder.build();
  }
}