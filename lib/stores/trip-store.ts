import { create } from "zustand";

interface TripIntent {
  destination: string;
  description: string;
  budget: number;
  startDate: string;
  endDate: string;
  // These are now optional — extracted from description by AI
  currency?: string;
  travelers?: number;
  travelStyle?: string;
  interests?: string[];
}

interface GeneratedItinerary {
  id: string;
  title: string;
  destination: string;
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalBudget: number;
  currency: string;
  travelers: number;
  travelStyle: string;
  days: any[];
  status: string;
  weather?: any[];
  cityInfo?: any;
  exchangeRate?: number;
}

interface TripStore {
  // State
  tripIntent: TripIntent | null;
  generatedItinerary: GeneratedItinerary | null;
  isGenerating: boolean;
  error: string | null;

  // Actions
  setTripIntent: (intent: TripIntent) => void;
  generateItinerary: (intent: TripIntent) => Promise<GeneratedItinerary | null>;
  setGeneratedItinerary: (itinerary: GeneratedItinerary | null) => void;
  clearItinerary: () => void;
  clearError: () => void;
}

export const useTripStore = create<TripStore>((set, get) => ({
  tripIntent: null,
  generatedItinerary: null,
  isGenerating: false,
  error: null,

  setTripIntent: (intent) => set({ tripIntent: intent }),

  generateItinerary: async (intent) => {
    set({ isGenerating: true, error: null, tripIntent: intent });

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(intent),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Generation failed (${res.status})`);
      }

      const itinerary = await res.json();
      set({ generatedItinerary: itinerary, isGenerating: false });
      return itinerary;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate itinerary";
      set({ error: message, isGenerating: false });
      return null;
    }
  },

  setGeneratedItinerary: (itinerary) => set({ generatedItinerary: itinerary }),

  clearItinerary: () =>
    set({
      tripIntent: null,
      generatedItinerary: null,
      isGenerating: false,
      error: null,
    }),

  clearError: () => set({ error: null }),
}));
