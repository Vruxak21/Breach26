"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  ChevronRight,
  Compass,
  Heart,
  MessageSquare,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const MAX_CHARACTERS = 500;

const EXAMPLE_PROMPTS = [
  "Plan a 5-day relaxing trip to Bali with beaches and cafes, budget around ₹80,000 for 2 people in September. We love sunsets, infinity pools, and spa days.",
  "Plan a weekend getaway to Manali from Delhi in December for 4 friends. We want snow activities, bonfire nights, and a cozy stay with a mountain view.",
  "Plan a 4-day Kerala backwaters trip in August for a family of 3. Focus on houseboats, nature, local food, and slow-paced experiences.",
];

const INTEREST_TAGS = [
  "Beaches",
  "Hiking",
  "Food & Dining",
  "Nightlife",
  "Museums",
  "Shopping",
  "Wellness & Spa",
  "Water Sports",
  "Wildlife",
  "Photography",
  "Architecture",
  "Festivals",
] as const;

type GroupType = "solo" | "couple" | "family" | "friends" | "group";

export default function PlannerPage() {
  const router = useRouter();

  const [description, setDescription] = useState<string>("");
  const [budgetRange, setBudgetRange] = useState<string>("");
  const [travelStyle, setTravelStyle] = useState<string>("");
  const [travelers, setTravelers] = useState<number>(2);
  const [groupType, setGroupType] = useState<GroupType>("couple");
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [interests, setInterests] = useState<string[]>([]);

  const characterCount = description.length;

  const handleExampleClick = (index: number) => {
    const prompt = EXAMPLE_PROMPTS[index];
    setDescription(prompt.slice(0, MAX_CHARACTERS));
  };

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const incrementTravelers = () => {
    setTravelers((prev) => Math.min(prev + 1, 12));
  };

  const decrementTravelers = () => {
    setTravelers((prev) => Math.max(prev - 1, 1));
  };

  const handleGenerate = () => {
    if (!description.trim()) {
      window.alert("Please describe your trip for the AI planner.");
      return;
    }

    if (!budgetRange || !travelStyle) {
      window.alert("Please select a budget range and travel style.");
      return;
    }

    if (!departureDate || !returnDate) {
      window.alert("Please choose your travel dates.");
      return;
    }

    router.push("/itinerary/t1/build");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-10">
      {/* Breadcrumb */}
      <div className="pt-8">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 text-sm text-slate-500">
          <button
            type="button"
            className="cursor-pointer text-slate-500 hover:text-slate-800"
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-medium text-slate-900">Plan a Trip</span>
        </div>
      </div>

      {/* Hero heading */}
      <section className="mx-auto mt-8 mb-10 max-w-3xl px-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5] shadow-sm">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
        <h1 className="font-display mt-6 text-4xl font-bold tracking-tight text-[#111111] sm:text-5xl">
          Plan Your Perfect Trip
        </h1>
        <p className="mt-3 text-base text-[#6B7280] sm:text-lg">
          Describe your dream trip in plain English — our AI handles the rest.
        </p>
      </section>

      {/* Main form card */}
      <section className="mx-auto max-w-3xl px-6">
        <div className="rounded-3xl border border-[#E8E8E2] bg-white p-6 shadow-sm sm:p-8">
          {/* Section 1: Describe trip */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#374151]">
              <MessageSquare className="h-4 w-4 text-[#4F46E5]" />
              <span>Tell AI about your trip</span>
            </label>
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value.slice(0, MAX_CHARACTERS))
              }
              placeholder={
                "Plan a 5-day relaxing trip to Goa with beaches and seafood,\n" +
                "budget around ₹30,000 for 2 people in March.\n" +
                "I love sunset views and authentic local food."
              }
              className="tm-input min-h-[140px] resize-none rounded-2xl p-4 leading-relaxed"
            />

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleExampleClick(0)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-slate-900"
                >
                  5 days in Bali 🏖️
                </button>
                <button
                  type="button"
                  onClick={() => handleExampleClick(1)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-slate-900"
                >
                  Weekend in Manali ❄️
                </button>
                <button
                  type="button"
                  onClick={() => handleExampleClick(2)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-slate-900"
                >
                  Kerala backwaters 🌿
                </button>
              </div>

              <span className="ml-auto text-xs text-slate-400">
                {characterCount} / {MAX_CHARACTERS} characters
              </span>
            </div>
          </div>

          <div className="my-6 border-t border-[#E8E8E2]" />

          {/* Section 2: Trip preferences */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Budget */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Wallet className="h-4 w-4 text-indigo-500" />
                  <span>Budget Range</span>
                </div>
              </div>
              <div className="mt-3">
                <Select
                  value={budgetRange}
                  onValueChange={setBudgetRange}
                >
                  <SelectTrigger className="h-auto w-full border-0 bg-transparent p-0 text-sm text-slate-900 focus:ring-0">
                    <SelectValue placeholder="Choose your budget" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="under-10k">
                      <span>Under ₹10,000</span>
                      <span className="text-xs text-slate-400">
                        · Budget travelers
                      </span>
                    </SelectItem>
                    <SelectItem value="10k-30k">
                      <span>₹10,000 – ₹30,000</span>
                      <span className="text-xs text-slate-400">
                        · Mid-range comfort
                      </span>
                    </SelectItem>
                    <SelectItem value="30k-60k">
                      <span>₹30,000 – ₹60,000</span>
                      <span className="text-xs text-slate-400">
                        · Comfortable stays
                      </span>
                    </SelectItem>
                    <SelectItem value="60k-1L">
                      <span>₹60,000 – ₹1,00,000</span>
                      <span className="text-xs text-slate-400">
                        · Premium experience
                      </span>
                    </SelectItem>
                    <SelectItem value="above-1L">
                      <span>Above ₹1,00,000</span>
                      <span className="text-xs text-slate-400">
                        · Luxury getaway
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Travel style */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Compass className="h-4 w-4 text-indigo-500" />
                  <span>Travel Style</span>
                </div>
              </div>
              <div className="mt-3">
                <Select
                  value={travelStyle}
                  onValueChange={setTravelStyle}
                >
                  <SelectTrigger className="h-auto w-full border-0 bg-transparent p-0 text-sm text-slate-900 focus:ring-0">
                    <SelectValue placeholder="How do you like to travel?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="relaxed">
                      Relaxed &amp; Leisurely
                    </SelectItem>
                    <SelectItem value="adventure">
                      Adventure &amp; Thrills
                    </SelectItem>
                    <SelectItem value="cultural">
                      Cultural Immersion
                    </SelectItem>
                    <SelectItem value="luxury">
                      Luxury &amp; Comfort
                    </SelectItem>
                    <SelectItem value="budget">
                      Budget Backpacking
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Group size */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>Travelers</span>
              </div>

              <div className="mt-3 flex items-center gap-4">
                <button
                  type="button"
                  onClick={decrementTravelers}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  -
                </button>
                <span className="min-w-[2rem] text-center text-2xl font-semibold text-slate-900">
                  {travelers}
                </span>
                <button
                  type="button"
                  onClick={incrementTravelers}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  +
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { label: "Solo", value: "solo" },
                  { label: "Couple", value: "couple" },
                  { label: "Family", value: "family" },
                  { label: "Friends", value: "friends" },
                  { label: "Group", value: "group" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setGroupType(item.value as GroupType)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition",
                      groupType === item.value
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200" />

          {/* Travel dates */}
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Travel Dates
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Departure */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <CalendarIcon className="h-4 w-4 text-indigo-500" />
                  <span>Departure</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "mt-3 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm",
                        !departureDate && "text-slate-400",
                      )}
                    >
                      <span>
                        {departureDate
                          ? formatDate(departureDate, "long")
                          : "Select departure date"}
                      </span>
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto bg-white p-2">
                    <Calendar
                      mode="single"
                      selected={departureDate}
                      onSelect={setDepartureDate}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Return */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <CalendarIcon className="h-4 w-4 text-indigo-500" />
                  <span>Return</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "mt-3 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm",
                        !returnDate && "text-slate-400",
                      )}
                    >
                      <span>
                        {returnDate
                          ? formatDate(returnDate, "long")
                          : "Select return date"}
                      </span>
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto bg-white p-2">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={setReturnDate}
                      disabled={(date) =>
                        departureDate ? date < departureDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200" />

          {/* Interests */}
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Heart className="h-4 w-4 text-rose-400" />
              <span>What interests you?</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTEREST_TAGS.map((tag) => {
                const isActive = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm transition",
                      isActive
                        ? "border-indigo-400 bg-indigo-50 text-indigo-600"
                        : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-slate-800",
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate button */}
          <div className="mt-8">
            <button
              type="button"
              onClick={handleGenerate}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-4 text-base font-semibold text-white shadow-md transition duration-300 hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-400/40 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="h-5 w-5" />
              <span>Generate My Itinerary</span>
            </button>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Powered by Gemini AI · Usually takes 10–15 seconds</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

