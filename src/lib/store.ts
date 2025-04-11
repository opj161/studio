import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ModelSettings = {
  gender: string;
  bodyType: string;
  ageRange: string;
  ethnicity: string;
};

type EnvironmentSettings = {
  description: string;
  lighting: string;
  lensStyle: string;
};

type GenerationState = {
  // Images
  originalImage: string | null;
  generatedImage: string | null;
  // Settings
  modelSettings: ModelSettings;
  environmentSettings: EnvironmentSettings;
  // UI state
  isLoading: boolean;
  error: { message: string } | null;
  // Remove generationProgress state
  // generationProgress: number | null;
  // History (limited to prevent localStorage overflow)
  history: Array<{
    id: string;
    originalImage: string;
    generatedImage: string;
    timestamp: number;
  }>;
  // Actions
  setOriginalImage: (url: string) => void;
  setGeneratedImage: (url: string) => void;
  setModelSettings: (settings: Partial<ModelSettings>) => void;
  setEnvironmentSettings: (settings: Partial<EnvironmentSettings>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: { message: string } | null) => void;
  // Remove setGenerationProgress action type
  // setGenerationProgress: (progress: number | null) => void;
  addToHistory: (entry: { originalImage: string; generatedImage: string }) => void;
  clearHistory: () => void;
};

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set) => ({
      // Initial state
      originalImage: null,
      generatedImage: null,
      modelSettings: {
        gender: 'female',
        bodyType: 'average',
        ageRange: '25-35',
        ethnicity: 'caucasian',
      },
      environmentSettings: {
        description: 'studio with white background',
        lighting: 'soft',
        lensStyle: 'portrait',
      },
      isLoading: false,
      error: null,
      // Remove initial generationProgress state
      // generationProgress: null,
      history: [],

      // Actions
      setOriginalImage: (url) => set({ originalImage: url }),
      setGeneratedImage: (url) => set({ generatedImage: url }),
      setModelSettings: (settings) =>
        set((state) => ({
          modelSettings: { ...state.modelSettings, ...settings }
        })),
      setEnvironmentSettings: (settings) =>
        set((state) => ({
          environmentSettings: { ...state.environmentSettings, ...settings }
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      // Remove setGenerationProgress action implementation
      // setGenerationProgress: (progress) => set({ generationProgress: progress }),
      addToHistory: (entry: { originalImage: string; generatedImage: string }) =>
        set((state) => ({
          history: [
            {
              id: Date.now().toString(),
              originalImage: entry.originalImage, // Store original source (URL or base64)
              generatedImage: entry.generatedImage, // Store the persistent URL
              timestamp: Date.now(),
            },
            ...state.history,
          ].slice(0, 20), // Limit to 20 entries
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'styleai-storage',
      // Only persist these keys to avoid localStorage overflow
      partialize: (state) => ({
        modelSettings: state.modelSettings,
        environmentSettings: state.environmentSettings,
        history: state.history,
      }),
    }
  )
);
