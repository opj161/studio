/**
 * Common types used throughout the application
 */

// Model settings
export interface ModelSettings {
  gender: 'male' | 'female' | 'non-binary';
  bodyType: 'slim' | 'athletic' | 'average' | 'plus-size';
  ageRange: '18-25' | '26-35' | '36-45' | '46-60' | '60+';
  ethnicity: 'caucasian' | 'black' | 'asian' | 'hispanic' | 'middle-eastern' | 'mixed';
}

// Environment settings
export interface EnvironmentSettings {
  description: string;
  lighting: 'natural' | 'studio' | 'soft' | 'dramatic' | 'bright';
  lensStyle: 'portrait' | 'fashion' | 'product' | 'editorial' | 'casual';
}

// Generation result
export interface GenerationResult {
  originalImageUrl: string;
  generatedImageUrl: string;
  promptUsed: string;
  timestamp: number;
  modelSettings: ModelSettings;
  environmentSettings: EnvironmentSettings;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Generation history entry
export interface HistoryEntry {
  id: string;
  originalImage: string;
  generatedImage: string;
  timestamp: number;
  modelSettings?: ModelSettings;
  environmentSettings?: EnvironmentSettings;
}
