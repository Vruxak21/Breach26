"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  Cloud,
  CloudRain,
  CloudSun,
  DollarSign,
  MapPin,
  Shield,
  Sparkles,
  Sun,
  Users,
  Loader2,
  Hotel,
  Plane,
  Star,
  Clock,
} from "lucide-react";
import { useTripStore } from "@/lib/stores/trip-store";

const categoryBadgeMap: Record<string, { bg: string; color: string }> = {
  beach:     { bg: "#EFF6FF", color: "#1D4ED8" },
  food:      { bg: "#FFF7ED", color: "#C2410C" },
  culture:   { bg: "#FAF5FF", color: "#6D28D9" },
  nature:    { bg: "#F0FDF4", color: "#15803D" },
  adventure: { bg: "#FFF1F2", color: "#BE123C" },
  museum:    { bg: "#F5F3FF", color: "#5B21B6" },
  transport: { bg: "#F8FAFC", color: "#475569" },
};

function getCategoryStyle(category: string) {
  const key = category?.toLowerCase() || "";
  return categoryBadgeMap[key] || { bg: "#F5F5F0", color: "#6B6B65" };
}

export default function ProposalPage() {
  const router = useRouter();
  const { generatedItinerary, isGenerating } = useTripStore();
  const [saving, setSaving] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    if (!generatedItinerary && !isGenerating) {
      router.push("/planner");
    }
  }, [generatedItinerary, isGenerating, router]);

  useEffect(() => {
    if (!generatedItinerary) return;
    setLoadingExtras(true);

    const itin = generatedItinerary;
    const fetchExtras = async () => {
      try {
        const hotelRes = await fetch(
          `/api/hotels?city=${encodeURIComponent(itin.destination)}&checkin=${itin.startDate || ""}&checkout=${itin.endDate || ""}&guests=${itin.travelers || 2}`
        );
        if (hotelRes.ok) {
          const d = await hotelRes.json();
          setHotels(Array.isArray(d) ? d.slice(0, 4) : []);
        }
      } catch {}
      try {
        const flightRes = await fetch(
          `/api/flights?dep=DEL&arr=${encodeURIComponent(itin.destination?.slice(0, 3)?.toUpperCase() || "")}&date=${itin.startDate || ""}`
        );
        if (flightRes.ok) {
          const d = await flightRes.json();
          setFlights(Array.isArray(d) ? d.slice(0, 4) : []);
        }
      } catch {}
      setLoadingExtras(false);
    };
    fetchExtras();
  }, [generatedItinerary]);

  if (isGenerating || !generatedItinerary) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-5">
        <div className="relative">
          <div
            className="h-16 w-16 animate-spin rounded-full border-4"
            style={{ borderColor: "var(--accent-100)", borderTopColor: "var(--accent-500)" }}
          />
          <Sparkles
            className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2"
            style={{ color: "var(--accent-500)" }}
          />
        </div>
        <div className="text-center">
          <p
            className="text-[22px] font-700"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-primary)" }}
          >
            Crafting your perfect itinerary...
          </p>
          <p className="mt-1.5 text-[14px]" style={{ color: "var(--text-muted)" }}>
            Gathering local insights, weather, and the best experiences
          </p>
        </div>
      </div>
    );
  }

  const itin = generatedItinerary;
  const days = Array.isArray(itin.days) ? itin.days : [];

  const handleAccept = async () => {
    setSaving(true);
    try {
      await fetch(`/api/itinerary/${itin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      router.push(`/itinerary/${itin.id}/view`);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/planner")}
          className="flex items-center gap-1.5 text-[14px] font-medium transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Planner
        </button>
        <span
          className="rounded-full px-3 py-1 text-[11px] font-700 uppercase tracking-wide"
          style={{ background: "var(--warning-bg)", color: "var(--warning-text)", border: "1px solid var(--warning-border)" }}
        >
          Draft Proposal
        </span>
      </div>

      {/* Trip Overview Card */}
      <div
        className="relative overflow-hidden rounded-2xl p-7 md:p-9"
        style={{
          background: "var(--bg-base)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-sm)",
          borderTop: "4px solid var(--accent-500)",
        }}
      >
        {/* Decorative accent blob */}
        <div
          className="absolute -top-12 -right-12 h-48 w-48 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--accent-300)" }}
        />
        <div className="relative">
          <h1
            className="text-[32px] font-700 leading-tight"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-primary)" }}
          >
            {itin.title}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { icon: MapPin, text: `${itin.destination}${itin.country ? `, ${itin.country}` : ""}` },
              { icon: Calendar, text: `${itin.totalDays} days` },
              { icon: Users, text: `${itin.travelers} travelers` },
              { icon: DollarSign, text: `${itin.totalBudget?.toLocaleString()} ${itin.currency}` },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium"
                style={{ background: "var(--bg-wash)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                {text}
              </span>
            ))}
          </div>

          {/* Info pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {itin.cityInfo?.safetyScore && (
              <span
                className="flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium"
                style={{ background: "var(--success-bg)", color: "var(--success-text)" }}
              >
                <Shield className="h-3 w-3" />
                Safety: {itin.cityInfo.safetyScore}/10
              </span>
            )}
            {itin.weather?.[0] && (
              <span
                className="flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium"
                style={{ background: "var(--info-bg)", color: "var(--info-text)" }}
              >
                {itin.weather[0].condition === "Clear" ? <Sun className="h-3 w-3" /> : <Cloud className="h-3 w-3" />}
                {itin.weather[0].condition} {itin.weather[0].tempMax}°C
              </span>
            )}
            {itin.exchangeRate && (
              <span
                className="flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium"
                style={{ background: "var(--bg-wash)", color: "var(--text-muted)" }}
              >
                <DollarSign className="h-3 w-3" />
                1 USD = {itin.exchangeRate.toFixed(2)} {itin.currency}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Weather */}
      {itin.weather && itin.weather.length > 0 && (
        <section>
          <h2
            className="mb-4 text-[22px] font-600"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-primary)" }}
          >
            Weather Forecast
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {itin.weather.slice(0, 7).map((w: any) => (
              <div
                key={w.date}
                className="flex min-w-[100px] shrink-0 flex-col items-center rounded-xl p-3 text-center"
                style={{ border: "1px solid var(--border-default)", background: "var(--bg-base)", boxShadow: "var(--shadow-xs)" }}
              >
                <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {new Date(w.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <span className="mt-1.5 flex justify-center text-[24px]">
                  {w.condition === "Clear" || w.condition === "Sunny" ? (
                    <Sun className="h-6 w-6 text-amber-500" />
                  ) : w.condition === "Rainy" || w.condition.includes("Rain") ? (
                    <CloudRain className="h-6 w-6 text-blue-400" />
                  ) : w.condition.includes("Cloudy") ? (
                    <CloudSun className="h-6 w-6 text-slate-400" />
                  ) : (
                    <Cloud className="h-6 w-6 text-slate-400" />
                  )}
                </span>
                <span className="mt-1 text-[12px] font-600" style={{ color: "var(--text-primary)" }}>{w.tempMin}°–{w.tempMax}°</span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{w.condition}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Day-by-Day Itinerary */}
      <section>
        <h2
          className="mb-5 text-[22px] font-600"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-primary)" }}
        >
          Day-by-Day Itinerary
        </h2>
        <div className="space-y-4">
          {days.map((day: any, dayIndex: number) => (
            <div
              key={dayIndex}
              className="rounded-xl p-5 md:p-6"
              style={{ background: "var(--bg-base)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-700"
                    style={{ background: "var(--primary-50)", color: "var(--primary-700)" }}
                  >
                    {day.day || dayIndex + 1}
                  </span>
                  <h3 className="text-[16px] font-600" style={{ color: "var(--text-primary)" }}>
                    {day.title || "Exploration"}
                  </h3>
                </div>
                {day.date && (
                  <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>{day.date}</span>
                )}
              </div>
              <div className="space-y-2.5">
                {(day.activities || []).map((act: any, actIndex: number) => {
                  const catStyle = getCategoryStyle(act.category || "");
                  return (
                    <div
                      key={actIndex}
                      className="flex items-start gap-3 rounded-xl p-3.5"
                      style={{ background: "var(--bg-subtle)" }}
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[11px] font-600"
                        style={{ background: "var(--bg-base)", color: "var(--text-muted)", border: "1px solid var(--border-light)" }}
                      >
                        {act.time || `${9 + actIndex}:00`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-600" style={{ color: "var(--text-primary)" }}>{act.name}</p>
                        {act.description && (
                          <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{act.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {act.category && (
                            <span
                              className="rounded-md px-2 py-0.5 text-[10px] font-700 uppercase tracking-wide"
                              style={{ background: catStyle.bg, color: catStyle.color }}
                            >
                              {act.category}
                            </span>
                          )}
                          {act.duration && (
                            <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                              <Clock className="h-3 w-3" />
                              {act.duration} min
                            </span>
                          )}
                          {act.estimatedCost > 0 && (
                            <span
                              className="text-[11px] font-500"
                              style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}
                            >
                              ~₹{act.estimatedCost}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hotels */}
      <section>
        <h2
          className="mb-4 flex items-center gap-2 text-[22px] font-600"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-primary)" }}
        >
          <Hotel className="h-5 w-5" style={{ color: "var(--warning-icon)" }} />
          Recommended Hotels
        </h2>
        {loadingExtras ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => <div key={i} className="h-52 tm-skeleton rounded-xl" />)}
          </div>
        ) : hotels.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {hotels.map((hotel: any, i: number) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl transition-all"
                style={{ background: "var(--bg-base)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="h-36 w-full overflow-hidden">
                  <img
                    src={hotel.image || hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                    alt={hotel.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-[14px] font-600" style={{ color: "var(--text-primary)" }}>{hotel.name}</h4>
                  {hotel.address && (
                    <p className="mt-0.5 flex items-center gap-1 text-[12px]" style={{ color: "var(--text-muted)" }}>
                      <MapPin className="h-3 w-3" /> {hotel.address}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[12px]">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span style={{ color: "var(--warning-text)" }}>{hotel.rating || "4.0"}</span>
                    </div>
                    <span
                      className="text-[15px] font-700"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--primary-600)" }}
                    >
                      ₹{hotel.pricePerNight || hotel.min_price || "—"}/night
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl py-10 text-center"
            style={{ border: "2px dashed var(--border-default)", background: "var(--bg-subtle)" }}
          >
            <Hotel className="mx-auto h-8 w-8" style={{ color: "var(--text-subtle)" }} />
            <p className="mt-2 text-[13px]" style={{ color: "var(--text-muted)" }}>No hotels found. Try searching manually.</p>
          </div>
        )}
      </section>

      {/* Flights */}
      <section>
        <h2
          className="mb-4 flex items-center gap-2 text-[22px] font-600"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-primary)" }}
        >
          <Plane className="h-5 w-5" style={{ color: "var(--primary-500)" }} />
          Available Flights
        </h2>
        {loadingExtras ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-20 tm-skeleton rounded-xl" />)}
          </div>
        ) : flights.length > 0 ? (
          <div className="space-y-3">
            {flights.map((flight: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl p-4 transition-all"
                style={{ background: "var(--bg-base)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-xs)" }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "var(--primary-50)", color: "var(--primary-500)" }}
                >
                  <Plane className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-600" style={{ color: "var(--text-primary)" }}>
                    {flight.airline?.name || flight.airline || "Airline"}
                  </p>
                  <p className="mt-0.5 text-[12px]" style={{ color: "var(--text-muted)" }}>
                    {flight.departure?.iata || flight.dep_iata || "—"} → {flight.arrival?.iata || flight.arr_iata || "—"}
                  </p>
                  <div className="mt-1 flex items-center gap-3 text-[11px]" style={{ color: "var(--text-subtle)" }}>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {flight.departure?.scheduled?.slice(11, 16) || flight.dep_time || "—"}
                    </span>
                    <span>{flight.flight?.iata || flight.flight_iata || ""}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="text-[18px] font-700"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--primary-600)" }}
                  >
                    {flight.price ? `₹${flight.price}` : "Check"}
                  </p>
                  <span className="text-[11px]" style={{ color: "var(--text-subtle)" }}>{flight.status || "Scheduled"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl py-10 text-center"
            style={{ border: "2px dashed var(--border-default)", background: "var(--bg-subtle)" }}
          >
            <Plane className="mx-auto h-8 w-8" style={{ color: "var(--text-subtle)" }} />
            <p className="mt-2 text-[13px]" style={{ color: "var(--text-muted)" }}>No flights found for this route.</p>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div
        className="flex flex-wrap items-center gap-3 rounded-xl p-5"
        style={{ background: "var(--bg-base)", border: "1px solid var(--border-default)", boxShadow: "var(--shadow-sm)" }}
      >
        <button
          onClick={handleAccept}
          disabled={saving}
          className="flex items-center gap-2 text-[15px] font-600 text-white transition-all disabled:opacity-50"
          style={{
            background: "var(--accent-500)",
            borderRadius: "var(--radius-sm)",
            padding: "11px 24px",
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "var(--shadow-accent)",
          }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Accept &amp; Create Trip
        </button>
        <button
          onClick={() => router.push("/planner")}
          className="flex items-center gap-2 text-[15px] font-medium transition-all"
          style={{
            background: "var(--bg-base)",
            border: "1px solid var(--border-default)",
            color: "var(--text-secondary)",
            borderRadius: "var(--radius-sm)",
            padding: "11px 24px",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--bg-base)";
          }}
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}
