"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  MapPin,
  Search,
  Star,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { popularDestinations } from "@/lib/placeholder-data";

const ActivityMap = dynamic(() => import("@/components/map/ActivityMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center" style={{ background: "var(--bg-subtle)" }}>
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: "var(--accent-200)", borderTopColor: "var(--accent-500)" }}
      />
    </div>
  ),
});

interface Activity {
  id: string;
  name: string;
  city: string;
  category: string;
  price: number;
  currency: string;
  duration: number;
  rating: number;
  image: string;
  description: string;
  lat: number;
  lng: number;
}

interface TrendingDestination {
  id: string;
  slug: string;
  name: string;
  country: string;
  avgBudget: number;
  bestMonths: string;
  flightHoursFromIndia: number;
  coverImage: string;
  lat: number;
  lng: number;
}

const categories = ["All", "culture", "beach", "restaurant", "museum", "adventure", "nightlife", "shopping", "nature", "wellness"];

const categoryBadgeMap: Record<string, { bg: string; color: string }> = {
  beach:       { bg: "#EFF6FF", color: "#1D4ED8" },
  restaurant:  { bg: "#FFF7ED", color: "#C2410C" },
  adventure:   { bg: "#FFF1F2", color: "#BE123C" },
  culture:     { bg: "#FAF5FF", color: "#6D28D9" },
  nature:      { bg: "#F0FDF4", color: "#15803D" },
  nightlife:   { bg: "#FDF4FF", color: "#86198F" },
  shopping:    { bg: "#FFFBEB", color: "#92400E" },
  wellness:    { bg: "#F0FDFA", color: "#0F766E" },
  museum:      { bg: "#F5F3FF", color: "#5B21B6" },
};

function getCategoryStyle(cat: string) {
  return categoryBadgeMap[cat.toLowerCase()] || { bg: "#F5F5F0", color: "#6B6B65" };
}

const trendingCoordinates: Record<string, { lat: number; lng: number }> = {
  "goa-india": { lat: 15.2993, lng: 74.124 },
  "manali-india": { lat: 32.2432, lng: 77.1892 },
  "bali-indonesia": { lat: -8.3405, lng: 115.092 },
  "paris-france": { lat: 48.8566, lng: 2.3522 },
  "tokyo-japan": { lat: 35.6762, lng: 139.6503 },
  "dubai-uae": { lat: 25.2048, lng: 55.2708 },
};

function toSlug(name: string, country: string): string {
  return `${name}-${country}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hasSearched, setHasSearched] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [hoveredActivity, setHoveredActivity] = useState<Activity | null>(null);

  const trendingDestinations: TrendingDestination[] = popularDestinations
    .map((destination) => {
      const slug = toSlug(destination.name, destination.country);
      const coords = trendingCoordinates[slug];
      if (!coords) return null;

      return {
        id: slug,
        slug,
        ...destination,
        lat: coords.lat,
        lng: coords.lng,
      };
    })
    .filter((destination): destination is TrendingDestination => destination !== null);

  const [selectedTrendingId, setSelectedTrendingId] = useState(
    trendingDestinations[0]?.id ?? ""
  );

  const selectedTrendingDestination =
    trendingDestinations.find((destination) => destination.id === selectedTrendingId) ??
    trendingDestinations[0] ??
    null;

  const trendingMapActivities: Activity[] = trendingDestinations.map((destination) => ({
    id: destination.id,
    name: destination.name,
    city: destination.country,
    category: "culture",
    price: destination.avgBudget,
    currency: "INR",
    duration: Math.round(destination.flightHoursFromIndia * 60),
    rating: 4.6,
    image: destination.coverImage,
    description: `Best months ${destination.bestMonths}. Avg trip budget INR ${destination.avgBudget.toLocaleString("en-IN")}.`,
    lat: destination.lat,
    lng: destination.lng,
  }));

  const trendingMapCenter: [number, number] = selectedTrendingDestination
    ? [selectedTrendingDestination.lat, selectedTrendingDestination.lng]
    : [20, 0];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const geoRes = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
      const geoData = geoRes.ok ? await geoRes.json() : [];

      if (!geoData.length) {
        setActivities([]);
        setIsLoading(false);
        return;
      }

      const { lat, lng } = geoData[0];
      setMapCenter([parseFloat(lat), parseFloat(lng)]);

      const placesRes = await fetch(`/api/places?lat=${lat}&lng=${lng}&limit=30`);
      const placesData = placesRes.ok ? await placesRes.json() : [];
      setActivities(Array.isArray(placesData) ? placesData : []);
    } catch {
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActivities =
    selectedCategory === "All"
      ? activities
      : activities.filter((a) => a.category === selectedCategory);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      {/* Top bar */}
      <div
        className="shrink-0 px-4 py-3.5 space-y-3"
        style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border-light)" }}
      >
        {/* Search input row */}
        <div className="flex items-center gap-3">
          <h1
            className="hidden sm:block text-[20px] font-700 whitespace-nowrap"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-primary)" }}
          >
            Explore
          </h1>
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a destination (e.g. Goa, Bali, Paris)..."
                style={{
                  width: "100%",
                  borderRadius: "var(--radius-full)",
                  border: "1px solid var(--border-default)",
                  background: "var(--bg-wash)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  color: "var(--text-primary)",
                  padding: "10px 14px 10px 40px",
                  outline: "none",
                  transition: "all 150ms",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--primary-500)";
                  e.target.style.boxShadow = "var(--shadow-md)";
                  e.target.style.background = "var(--bg-base)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-default)";
                  e.target.style.boxShadow = "none";
                  e.target.style.background = "var(--bg-wash)";
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 text-[14px] font-600 text-white transition-all disabled:opacity-60"
              style={{
                background: "var(--accent-500)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 18px",
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="shrink-0 rounded-full px-3 py-1 text-[12px] font-600 uppercase tracking-wide transition-all"
                style={{
                  border: `1px solid ${isActive ? "var(--primary-300)" : "var(--border-default)"}`,
                  background: isActive ? "var(--primary-50)" : "var(--bg-base)",
                  color: isActive ? "var(--primary-700)" : "var(--text-muted)",
                }}
              >
                {cat === "All" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map area */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {!hasSearched ? (
          <div className="grid h-full min-h-0 overflow-hidden grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[1.5fr_420px] lg:grid-rows-1">
            <div className="relative min-h-0 h-full overflow-hidden">
              <div className="absolute inset-0">
                <ActivityMap
                  activities={trendingMapActivities}
                  center={trendingMapCenter}
                  zoom={2}
                  onHover={(activity) => setSelectedTrendingId(activity.id)}
                  onLeave={() => undefined}
                />
              </div>

              <div
                className="absolute left-3 top-3 z-[900] rounded-xl px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid var(--border-default)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <p className="text-[11px] font-600 uppercase tracking-[0.14em]" style={{ color: "var(--text-subtle)" }}>
                  Trending now
                </p>
                <p className="mt-0.5 text-[13px] font-600" style={{ color: "var(--text-secondary)" }}>
                  {trendingDestinations.length} destinations on world map
                </p>
              </div>
            </div>

            <div className="flex h-full min-h-0 flex-col overflow-hidden border-t lg:border-t-0 lg:border-l" style={{ borderColor: "var(--border-light)", background: "var(--bg-subtle)" }}>
              <div className="px-4 py-3">
                <h2
                  className="text-[20px] font-600"
                  style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-secondary)" }}
                >
                  Explore the globe
                </h2>
                <p className="mt-1 text-[13px]" style={{ color: "var(--text-muted)" }}>
                  Start with a trending destination or search above for local activities.
                </p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 pb-4">
                {trendingDestinations.map((destination) => {
                  const active = selectedTrendingDestination?.id === destination.id;

                  return (
                    <button
                      key={destination.id}
                      type="button"
                      onClick={() => setSelectedTrendingId(destination.id)}
                      className="w-full rounded-2xl border text-left transition"
                      style={{
                        borderColor: active ? "#FDBA74" : "var(--border-default)",
                        background: "var(--bg-base)",
                        boxShadow: active ? "0 10px 26px rgba(249, 115, 22, 0.12)" : "var(--shadow-xs)",
                      }}
                    >
                      <div className="relative h-28 overflow-hidden rounded-t-2xl">
                        <Image
                          src={destination.coverImage}
                          alt={`${destination.name}, ${destination.country}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                        <p className="absolute bottom-2 left-3 text-sm font-600 text-white">
                          {destination.name}
                        </p>
                      </div>

                      <div className="space-y-2 px-3 py-3">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="inline-flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                            <MapPin className="h-3.5 w-3.5" />
                            {destination.country}
                          </span>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-700 uppercase tracking-wide" style={{ background: "#FEF3C7", color: "#92400E" }}>
                            {destination.bestMonths}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[12px]" style={{ color: "var(--text-secondary)" }}>
                          <span>Avg budget</span>
                          <span className="font-600">INR {destination.avgBudget.toLocaleString("en-IN")}</span>
                        </div>

                        <Link
                          href={`/destination/${destination.slug}`}
                          className="inline-flex items-center gap-1 text-[12px] font-600"
                          style={{ color: "var(--accent-600)" }}
                        >
                          View destination
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div
            className="flex h-full flex-col items-center justify-center"
            style={{ background: "var(--bg-subtle)" }}
          >
            <div
              className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: "var(--accent-100)", borderTopColor: "var(--accent-500)" }}
            />
            <p className="mt-4 text-[14px]" style={{ color: "var(--text-muted)" }}>Searching activities...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div
            className="flex h-full flex-col items-center justify-center text-center"
            style={{ background: "var(--bg-subtle)" }}
          >
            <MapPin className="h-12 w-12 mb-3" style={{ color: "var(--text-subtle)" }} />
            <h2
              className="text-[22px] font-600"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-secondary)" }}
            >
              No activities found
            </h2>
            <p className="mt-1.5 text-[13px]" style={{ color: "var(--text-muted)" }}>
              Try a different destination or category
            </p>
          </div>
        ) : (
          <>
            <ActivityMap
              activities={filteredActivities}
              center={mapCenter}
              onHover={setHoveredActivity}
              onLeave={() => setHoveredActivity(null)}
            />

            {/* Count badge */}
            <div
              className="absolute top-3 left-3 z-[1000] rounded-lg px-3 py-1.5 text-[12px] font-600"
              style={{
                background: "rgba(255,255,255,0.97)",
                boxShadow: "var(--shadow-sm)",
                border: "1px solid var(--border-default)",
                backdropFilter: "blur(8px)",
                color: "var(--text-secondary)",
              }}
            >
              {filteredActivities.length} activities found
            </div>

            {/* Hovered activity card */}
            {hoveredActivity && (
              <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[340px] overflow-hidden rounded-xl"
                style={{ background: "var(--bg-base)", boxShadow: "var(--shadow-xl)", border: "1px solid var(--border-default)" }}
              >
                <div className="flex gap-4 p-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={hoveredActivity.image}
                      alt={hoveredActivity.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-600 truncate" style={{ color: "var(--text-primary)" }}>
                      {hoveredActivity.name}
                    </h3>
                    <p className="mt-0.5 text-[12px] line-clamp-2" style={{ color: "var(--text-muted)" }}>
                      {hoveredActivity.description}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px]">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                        style={{ background: "#FFFBEB", color: "#92400E" }}
                      >
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {hoveredActivity.rating?.toFixed(1) || "4.0"}
                      </span>
                      <span className="flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <Clock className="h-3 w-3" />
                        {hoveredActivity.duration} min
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 font-600 uppercase text-[10px] tracking-wide"
                        style={{ ...getCategoryStyle(hoveredActivity.category) }}
                      >
                        {hoveredActivity.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
