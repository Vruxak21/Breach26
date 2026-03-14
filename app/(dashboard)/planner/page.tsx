"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  DollarSign,
  HeartPulse,
  Loader2,
  MapPin,
  Scale,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useTripStore } from "@/lib/stores/trip-store";

const interestOptions = [
  "Beaches", "Temples", "Nightlife", "Food", "History",
  "Adventure", "Nature", "Shopping", "Art", "Wellness",
  "Photography", "Sports", "Wildlife", "Architecture", "Festivals",
];

const travelStyles = [
  { value: "relaxed", label: "Relaxed", icon: HeartPulse },
  { value: "balanced", label: "Balanced", icon: Scale },
  { value: "packed", label: "Action-Packed", icon: Activity },
  { value: "luxury", label: "Luxury", icon: Sparkles },
  { value: "budget", label: "Budget", icon: Wallet },
];

const examplePrompts = [
  "5 days in Bali with beaches, temples and local food",
  "A romantic week in Paris with museums and fine dining",
  "4 days adventure trip in Swiss Alps with hiking",
  "Cultural exploration of Kyoto during cherry blossom season",
];

function PlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { generateItinerary, isGenerating, error, clearError } = useTripStore();

  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(50000);
  const [currency, setCurrency] = useState("INR");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState("balanced");
  const [interests, setInterests] = useState<string[]>([]);

  useEffect(() => {
    if (searchParams.get("destination")) {
      setDestination(searchParams.get("destination")!);
    }
  }, [searchParams]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!destination.trim()) return;

    const result = await generateItinerary({
      destination: destination.trim(),
      description: description.trim(),
      budget,
      currency,
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
      travelers,
      travelStyle,
      interests,
    });

    if (result) router.push("/proposal");
  };

  const inputStyle = {
    background: "var(--bg-wash)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-sans)",
    fontSize: "15px",
    color: "var(--text-primary)",
    padding: "11px 14px",
    outline: "none",
    width: "100%",
    transition: "all 150ms",
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "var(--primary-500)";
    e.target.style.boxShadow = "var(--shadow-primary)";
    e.target.style.background = "var(--bg-base)";
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "var(--border-default)";
    e.target.style.boxShadow = "none";
    e.target.style.background = "var(--bg-wash)";
  };

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      {/* Header */}
      <div>
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-4"
          style={{ background: "var(--accent-50)", border: "1px solid var(--accent-200)", color: "var(--accent-700)" }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-[12px] font-600 uppercase tracking-wider">AI Trip Planner</span>
        </div>
        <h1
          className="text-[40px] font-700 leading-tight"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-primary)" }}
        >
          Plan Your Dream Trip
        </h1>
        <p className="mt-2 text-[15px]" style={{ color: "var(--text-muted)" }}>
          Tell us where you want to go and our AI will craft a perfect personalized itinerary.
        </p>
      </div>

      {/* Example Prompts */}
      <div className="flex flex-wrap gap-2">
        {examplePrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => {
              const dest = prompt.split(" in ")[1]?.split(" with ")[0] || "";
              setDestination(dest);
              setDescription(prompt);
            }}
            className="rounded-full px-3 py-1.5 text-[12px] font-medium transition-all"
            style={{
              border: "1px solid var(--border-default)",
              background: "var(--bg-base)",
              color: "var(--text-muted)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-300)";
              (e.currentTarget as HTMLElement).style.background = "var(--accent-50)";
              (e.currentTarget as HTMLElement).style.color = "var(--accent-700)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
              (e.currentTarget as HTMLElement).style.background = "var(--bg-base)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 text-[14px]"
          style={{
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            color: "var(--danger-text)",
          }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">{error}</div>
          <button onClick={clearError} style={{ color: "var(--danger-text)", opacity: 0.7 }}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleGenerate}
        className="space-y-6 rounded-xl p-7"
        style={{ background: "var(--bg-base)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-sm)" }}
      >
        {/* Destination */}
        <div className="space-y-1.5">
          <label className="tm-label-field">Destination *</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where do you want to go?"
              required
              style={{ ...inputStyle, paddingLeft: "40px" }}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="tm-label-field">Describe your trip</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about your ideal trip — activities, food, experiences..."
            rows={3}
            style={{
              ...inputStyle,
              padding: "11px 14px",
              minHeight: "100px",
              resize: "vertical",
            }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </div>

        {/* Dates + Travelers */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Start Date", icon: Calendar, type: "date", value: startDate, onChange: (v: string) => setStartDate(v) },
            { label: "End Date", icon: Calendar, type: "date", value: endDate, onChange: (v: string) => setEndDate(v) },
          ].map(({ label, icon: Icon, type, value, onChange }) => (
            <div key={label} className="space-y-1.5">
              <label className="tm-label-field">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type={type}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: "40px" }}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="tm-label-field">Travelers</label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="number"
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                min={1}
                max={20}
                style={{ ...inputStyle, paddingLeft: "40px" }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
          </div>
        </div>

        {/* Budget + Currency */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="tm-label-field">Budget</label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                min={1000}
                style={{ ...inputStyle, paddingLeft: "40px" }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="tm-label-field">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {/* Travel Style */}
        <div className="space-y-2.5">
          <label className="tm-label-field">Travel Style</label>
          <div className="flex flex-wrap gap-2">
            {travelStyles.map((style) => (
              <button
                key={style.value}
                type="button"
                onClick={() => setTravelStyle(style.value)}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-medium transition-all"
                style={{
                  border: `1px solid ${travelStyle === style.value ? "var(--primary-400)" : "var(--border-default)"}`,
                  background: travelStyle === style.value ? "var(--primary-50)" : "var(--bg-base)",
                  color: travelStyle === style.value ? "var(--primary-700)" : "var(--text-secondary)",
                }}
              >
                <style.icon className="h-4 w-4 shrink-0" />
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-2.5">
          <label className="tm-label-field">Interests</label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => {
              const isSelected = interests.includes(interest.toLowerCase());
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest.toLowerCase())}
                  className="rounded-full px-3 py-1.5 text-[12px] font-medium transition-all"
                  style={{
                    border: `1px solid ${isSelected ? "var(--accent-300)" : "var(--border-default)"}`,
                    background: isSelected ? "var(--accent-50)" : "var(--bg-base)",
                    color: isSelected ? "var(--accent-700)" : "var(--text-muted)",
                  }}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <button
          type="submit"
          disabled={isGenerating || !destination.trim()}
          className="flex w-full items-center justify-center gap-2.5 text-[15px] font-600 text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: isGenerating ? "var(--accent-400)" : "var(--accent-500)",
            borderRadius: "var(--radius-sm)",
            padding: "14px 24px",
            fontFamily: "var(--font-sans)",
            boxShadow: "var(--shadow-accent)",
            border: "none",
            cursor: isGenerating || !destination.trim() ? "not-allowed" : "pointer",
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating your itinerary...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Generate My Itinerary
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div
            className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--accent-200)", borderTopColor: "var(--accent-500)" }}
          />
        </div>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}
