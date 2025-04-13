import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define specific literal types based on UI options and expected schema
export type Gender = "male" | "female" | "non-binary";
export type BodyType = "slim" | "athletic" | "average" | "plus-size";
export type AgeRange = "18-25" | "26-35" | "36-45" | "46-60" | "60+";
export type Ethnicity = "caucasian" | "black" | "asian" | "hispanic" | "middle-eastern" | "mixed";
export type EnvironmentDescription = "studio" | "outdoor" | "urban" | "beach"; // Assuming these cover the schema
export type LightingStyle = "natural" | "studio" | "soft" | "dramatic" | "bright";
export type LensStyle = "portrait" | "fashion" | "product" | "editorial" | "casual";


// Update type definitions to use literal types
type ModelSettings = {
  gender: Gender;
  bodyType: BodyType;
  ageRange: AgeRange;
  ethnicity: Ethnicity;
};

type EnvironmentSettings = {
  description: EnvironmentDescription; // Use specific type if schema requires it, otherwise string might be okay if description is freeform
  lighting: LightingStyle;
  lensStyle: LensStyle;
};

type HistoryEntry = {
  id: string;
  originalImage: string; // Can be base64 or URL
  generatedImage: string; // Should be the persistent URL
  timestamp: number;
  // Optional: Could store settings used for this generation
  // modelSettings?: ModelSettings;
  // environmentSettings?: EnvironmentSettings;
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
  // History
  history: Array<HistoryEntry>;
  // Actions
  setOriginalImage: (url: string | null) => void; // Allow null for clearing
  setGeneratedImage: (url: string | null) => void; // Allow null for clearing
  setModelSettings: (settings: Partial<ModelSettings>) => void;
  setEnvironmentSettings: (settings: Partial<EnvironmentSettings>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: { message: string } | null) => void;
  addToHistory: (entry: { originalImage: string; generatedImage: string }) => void;
  clearHistory: () => void;
  // Optional: Action to restore state from history
  // restoreFromHistory: (id: string) => void;
};

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({ // Added get to access state in actions if needed
      // Initial state (ensure values match literal types)
      originalImage: null,
      generatedImage: null,
      modelSettings: {
        gender: 'female',
        bodyType: 'average',
        ageRange: '26-35', // Corrected initial value
        ethnicity: 'caucasian',
      },
      environmentSettings: {
        description: 'studio', // Corrected initial value (assuming 'studio' is valid)
        lighting: 'soft',
        lensStyle: 'portrait',
      },
      isLoading: false,
      error: null,
      history: [],

      // Actions
      setOriginalImage: (url) => set({ originalImage: url, generatedImage: null, error: null }), // Clear generated/error on new upload
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
      addToHistory: (entry: { originalImage: string; generatedImage: string }) =>
        set((state) => {
          // Prevent adding duplicates based on generated image URL? (Optional)
          // if (state.history.some(h => h.generatedImage === entry.generatedImage)) {
          //   return {}; // Don't add if already exists
          // }
          const newHistoryEntry: HistoryEntry = {
            id: Date.now().toString(),
            originalImage: entry.originalImage,
            generatedImage: entry.generatedImage,
            timestamp: Date.now(),
            // Optional: Capture settings at time of generation
            // modelSettings: state.modelSettings,
            // environmentSettings: state.environmentSettings,
          };
          return {
            history: [newHistoryEntry, ...state.history].slice(0, 20), // Limit history size
          };
        }),
      clearHistory: () => set({ history: [] }),
      // Optional: Implement restoreFromHistory action
      // restoreFromHistory: (id) => {
      //   const historyEntry = get().history.find(h => h.id === id);
      //   if (historyEntry) {
      //     set({
      //       originalImage: historyEntry.originalImage,
      //       generatedImage: historyEntry.generatedImage,
      //       // Optional: Restore settings if saved
      //       // modelSettings: historyEntry.modelSettings || get().modelSettings,
      //       // environmentSettings: historyEntry.environmentSettings || get().environmentSettings,
      //       isLoading: false,
      //       error: null,
      //     });
      //   }
      // },
    }),
    {
      name: 'styleai-storage',
      // Only persist settings and history
      partialize: (state) => ({
        modelSettings: state.modelSettings,
        environmentSettings: state.environmentSettings,
        history: state.history,
      }),
    }
  )
);
