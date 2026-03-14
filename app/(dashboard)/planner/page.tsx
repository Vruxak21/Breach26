"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  DollarSign,
  Loader2,
  MapPin,
  Sparkles,
  X,
  AlertCircle,
} from "lucide-react";
import { useTripStore } from "@/lib/stores/trip-store";

const examplePrompts = [
  "5 days in Bali with beaches, temples and local food for 2 people, relaxed style",
  "A romantic week in Paris with museums and fine dining, luxury budget in EUR",
  "4 days adventure trip in Swiss Alps with hiking, 3 travelers, packed schedule",
  "Cultural exploration of Kyoto, budget-friendly, solo travel, interested in temples and street food",
];

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { generateItinerary, isGenerating, error, clearError } = useTripStore();

  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(50000);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (searchParams.get("destination")) {
      setDestination(searchParams.get("destination")!);
    }
  }, [searchParams]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!destination.trim()) return;

    const result = await generateItinerary({
      destination: destination.trim(),
      description: description.trim(),
      budget,
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
    });

    if (result) {
      router.push(`/proposal`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Plan Your Dream Trip</h1>
        <p className="mt-1 text-sm text-slate-500">
          Describe your ideal trip in detail — our AI extracts preferences, style, and more from your description
        </p>
      </div>

      {/* Example Prompts */}
      <div className="flex flex-wrap justify-center gap-2">
        {examplePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => {
              const dest = prompt.split(" in ")[1]?.split(" with ")[0]?.split(" for ")[0]?.split(",")[0] || "";
              setDestination(dest);
              setDescription(prompt);
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
          >
            {prompt.length > 60 ? prompt.slice(0, 57) + "..." : prompt}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{error}</div>
          <button onClick={clearError} className="text-rose-400 hover:text-rose-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleGenerate} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Destination */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Destination *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where do you want to go?"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Description — the main prompt input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Describe your trip *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us everything — travel style, number of travelers, interests, budget preferences, cuisine choices, activities you enjoy, things to avoid..."
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <p className="text-xs text-slate-400">
            💡 Include details like: number of travelers, travel style (relaxed, packed, luxury), interests (food, temples, nightlife), and currency preference
          </p>
        </div>

        {/* Dates + Budget */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Budget</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                min={1000}
                className="w-full rounded-xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isGenerating || !destination.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating your itinerary...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate My Itinerary
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    }>
      <PlannerContent />
    </Suspense>
  );
}
