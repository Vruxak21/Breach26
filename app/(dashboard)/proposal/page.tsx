"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Check,
  Cloud,
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
  Heart,
  CheckCircle2,
} from "lucide-react";
import { useTripStore } from "@/lib/stores/trip-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

// Map common city/destination names to their IATA airport codes
function getCityIataCode(destination: string): string {
  const cityMap: Record<string, string> = {
    // India
    "ahmedabad": "AMD", "mumbai": "BOM", "delhi": "DEL", "new delhi": "DEL",
    "bangalore": "BLR", "bengaluru": "BLR", "chennai": "MAA", "kolkata": "CCU",
    "hyderabad": "HYD", "pune": "PNQ", "jaipur": "JAI", "goa": "GOI",
    "lucknow": "LKO", "kochi": "COK", "cochin": "COK", "thiruvananthapuram": "TRV",
    "varanasi": "VNS", "srinagar": "SXR", "udaipur": "UDR", "jodhpur": "JDH",
    "amritsar": "ATQ", "patna": "PAT", "bhopal": "BHO", "indore": "IDR",
    "chandigarh": "IXC", "nagpur": "NAG", "coimbatore": "CJB", "mangalore": "IXE",
    // International Asia
    "dubai": "DXB", "abu dhabi": "AUH", "singapore": "SIN", "bangkok": "BKK",
    "kuala lumpur": "KUL", "tokyo": "NRT", "seoul": "ICN", "hong kong": "HKG",
    "shanghai": "PVG", "beijing": "PEK", "bali": "DPS", "jakarta": "CGK",
    "manila": "MNL", "hanoi": "HAN", "colombo": "CMB", "kathmandu": "KTM",
    "dhaka": "DAC", "doha": "DOH", "muscat": "MCT", "riyadh": "RUH",
    // Europe
    "london": "LHR", "paris": "CDG", "amsterdam": "AMS", "frankfurt": "FRA",
    "munich": "MUC", "zurich": "ZRH", "geneva": "GVA", "rome": "FCO",
    "milan": "MXP", "barcelona": "BCN", "madrid": "MAD", "lisbon": "LIS",
    "vienna": "VIE", "prague": "PRG", "istanbul": "IST", "athens": "ATH",
    "berlin": "BER", "brussels": "BRU", "dublin": "DUB", "helsinki": "HEL",
    "oslo": "OSL", "stockholm": "ARN", "copenhagen": "CPH", "warsaw": "WAW",
    // Americas
    "new york": "JFK", "los angeles": "LAX", "san francisco": "SFO",
    "chicago": "ORD", "miami": "MIA", "toronto": "YYZ", "vancouver": "YVR",
    "sao paulo": "GRU", "mexico city": "MEX",
    // Oceania / Africa
    "sydney": "SYD", "melbourne": "MEL", "auckland": "AKL",
    "cairo": "CAI", "nairobi": "NBO", "johannesburg": "JNB",
    // Regions / tourism names
    "swiss alps": "ZRH", "switzerland": "ZRH", "maldives": "MLE",
    "mauritius": "MRU", "seychelles": "SEZ", "phuket": "HKT",
  };

  const key = destination.toLowerCase().trim();
  if (cityMap[key]) return cityMap[key];

  // Try partial matching (if destination contains a known city name)
  for (const [city, code] of Object.entries(cityMap)) {
    if (key.includes(city) || city.includes(key)) return code;
  }

  // Fallback: take first 3 characters  
  return destination.slice(0, 3).toUpperCase();
}

export default function ProposalPage() {
  const router = useRouter();
  const { generatedItinerary, isGenerating } = useTripStore();
  const { addItem, isInWishlist, fetchItems, isLoaded } = useWishlistStore();
  const [saving, setSaving] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) fetchItems();
  }, [isLoaded, fetchItems]);

  useEffect(() => {
    if (!generatedItinerary && !isGenerating) {
      router.push("/planner");
    }
  }, [generatedItinerary, isGenerating, router]);

  // Fetch hotels and flights once itinerary is generated
  useEffect(() => {
    if (!generatedItinerary) return;
    setLoadingExtras(true);

    const itin = generatedItinerary;
    const fetchExtras = async () => {
      try {
        // Fetch hotels — using correct param names: destination, checkin, checkout
        const hotelRes = await fetch(
          `/api/hotels?destination=${encodeURIComponent(itin.destination)}&checkin=${itin.startDate || ""}&checkout=${itin.endDate || ""}&guests=${itin.travelers || 2}&currency=${itin.currency || "USD"}`
        );
        if (hotelRes.ok) {
          const d = await hotelRes.json();
          setHotels(Array.isArray(d) ? d.slice(0, 6) : []);
        }
      } catch {}
      try {
        // Fetch flights — using correct param names: dep_iata, arr_iata, date
        const destCode = getCityIataCode(itin.destination || "");
        const flightRes = await fetch(
          `/api/flights?dep_iata=DEL&arr_iata=${encodeURIComponent(destCode)}&date=${itin.startDate || ""}`
        );
        if (flightRes.ok) {
          const d = await flightRes.json();
          setFlights(Array.isArray(d) ? d.slice(0, 6) : []);
        }
      } catch {}
      setLoadingExtras(false);
    };
    fetchExtras();
  }, [generatedItinerary]);

  // Sync wishlisted state
  useEffect(() => {
    if (!isLoaded) return;
    const ids = new Set<string>();
    hotels.forEach((h) => {
      if (isInWishlist(h.externalId || h.id)) ids.add(h.externalId || h.id);
    });
    flights.forEach((f) => {
      const fId = f.flightNumber || f.flight?.iata || "";
      if (fId && isInWishlist(fId)) ids.add(fId);
    });
    setWishlistedIds(ids);
  }, [isLoaded, hotels, flights, isInWishlist]);

  const handleAddHotelWishlist = async (hotel: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const extId = hotel.externalId || hotel.id;
    if (wishlistedIds.has(extId) || addingId) return;
    setAddingId(extId);
    const result = await addItem(
      "hotel",
      {
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        rating: hotel.rating || hotel.stars,
        pricePerNight: hotel.pricePerNight,
        currency: hotel.currency,
        images: hotel.images,
        image: hotel.images?.[0],
      },
      extId,
      generatedItinerary?.id
    );
    if (result) setWishlistedIds((prev) => new Set(prev).add(extId));
    setAddingId(null);
  };

  const handleAddFlightWishlist = async (flight: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const fId = flight.flightNumber || flight.flight?.iata || "";
    if (!fId || wishlistedIds.has(fId) || addingId) return;
    setAddingId(fId);
    const result = await addItem(
      "flight",
      {
        name: `${flight.airline || "Airline"} ${fId}`,
        airline: flight.airline,
        flightNumber: fId,
        departure: flight.departure,
        arrival: flight.arrival,
        status: flight.status,
      },
      fId,
      generatedItinerary?.id
    );
    if (result) setWishlistedIds((prev) => new Set(prev).add(fId));
    setAddingId(null);
  };

  if (isGenerating || !generatedItinerary) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <Sparkles className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900">Crafting your perfect itinerary...</p>
          <p className="mt-1 text-sm text-slate-500">This may take a moment while we gather data</p>
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
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Planner
        </button>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          Draft Proposal
        </span>
      </div>

      {/* Trip Overview Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white shadow-lg md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">{itin.title}</h1>
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-indigo-100">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {itin.destination}{itin.country ? `, ${itin.country}` : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {itin.totalDays} days
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {itin.travelers} travelers
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            {itin.totalBudget?.toLocaleString()} {itin.currency}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {itin.cityInfo?.safetyScore && (
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs">
              <Shield className="h-3 w-3" />
              Safety: {itin.cityInfo.safetyScore}/10
            </span>
          )}
          {itin.weather?.[0] && (
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs">
              {itin.weather[0].condition === "Clear" ? <Sun className="h-3 w-3" /> : <Cloud className="h-3 w-3" />}
              {itin.weather[0].condition} {itin.weather[0].tempMax}°C
            </span>
          )}
          {itin.exchangeRate && (
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs">
              <DollarSign className="h-3 w-3" />
              1 USD = {itin.exchangeRate.toFixed(2)} {itin.currency}
            </span>
          )}
        </div>
      </div>

      {/* Weather */}
      {itin.weather && itin.weather.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Weather Forecast</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {itin.weather.slice(0, 7).map((w: any) => (
              <div key={w.date} className="flex min-w-[100px] shrink-0 flex-col items-center rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                <span className="text-xs text-slate-500">
                  {new Date(w.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                </span>
                <span className="mt-1 text-lg">
                  {w.condition === "Clear" ? "☀️" : w.condition === "Rainy" ? "🌧️" : w.condition === "Partly Cloudy" ? "⛅" : "☁️"}
                </span>
                <span className="mt-1 text-xs font-medium text-slate-900">{w.tempMin}° – {w.tempMax}°</span>
                <span className="text-[10px] text-slate-400">{w.condition}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Day-by-Day Itinerary */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Day-by-Day Itinerary</h2>
        <div className="space-y-4">
          {days.map((day: any, dayIndex: number) => (
            <div key={dayIndex} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">
                  Day {day.day || dayIndex + 1}: {day.title || "Exploration"}
                </h3>
                {day.date && <span className="text-xs text-slate-400">{day.date}</span>}
              </div>
              <div className="space-y-3">
                {(day.activities || []).map((act: any, actIndex: number) => (
                  <div key={actIndex} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                      {act.time || `${9 + actIndex}:00`}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{act.name}</p>
                      {act.description && <p className="mt-0.5 text-xs text-slate-500">{act.description}</p>}
                      <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-400">
                        {act.category && (
                          <span className="rounded-full bg-white px-2 py-0.5 border border-slate-200">{act.category}</span>
                        )}
                        {act.duration && <span>{act.duration} min</span>}
                        {act.estimatedCost > 0 && <span>~₹{act.estimatedCost}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hotels Section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Hotel className="h-5 w-5 text-amber-500" />
          Recommended Hotels
        </h2>
        {loadingExtras ? (
          <div className="flex items-center gap-2 py-6 justify-center text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Finding hotels...</span>
          </div>
        ) : hotels.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.map((hotel: any, i: number) => {
              const extId = hotel.externalId || hotel.id;
              const isWishlisted = wishlistedIds.has(extId);
              const isAdding = addingId === extId;
              return (
                <div
                  key={i}
                  onClick={() => router.push(`/hotels/${hotel.externalId || hotel.id}`)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg hover:border-indigo-200"
                >
                  <div className="h-36 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                      alt={hotel.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => handleAddHotelWishlist(hotel, e)}
                    disabled={isWishlisted || !!addingId}
                    className={`absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition ${
                      isWishlisted
                        ? "bg-rose-500 text-white"
                        : "bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white"
                    }`}
                  >
                    {isAdding ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-white" : ""}`} />
                    )}
                  </button>
                  <div className="p-4">
                    <h4 className="font-semibold text-slate-900 text-sm">{hotel.name}</h4>
                    {(hotel.city || hotel.description) && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 line-clamp-1">
                        <MapPin className="h-3 w-3 shrink-0" /> {hotel.city || hotel.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {hotel.rating || hotel.stars || "4.0"}
                      </div>
                      <span className="text-sm font-bold text-indigo-600">
                        {hotel.pricePerNight ? `₹${hotel.pricePerNight}/night` : "View Details →"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
            <Hotel className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No hotels found. Try searching manually.</p>
          </div>
        )}
      </section>

      {/* Flights Section */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Plane className="h-5 w-5 text-indigo-500" />
          Available Flights
        </h2>
        {loadingExtras ? (
          <div className="flex items-center gap-2 py-6 justify-center text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Searching flights...</span>
          </div>
        ) : flights.length > 0 ? (
          <div className="space-y-3">
            {flights.map((flight: any, i: number) => {
              const fId = flight.flightNumber || flight.flight?.iata || "";
              const isWishlisted = fId ? wishlistedIds.has(fId) : false;
              const isAdding = addingId === fId;
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (fId) router.push(`/flights/${fId}`);
                  }}
                  className={`group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-lg hover:border-indigo-200 ${fId ? "cursor-pointer" : ""}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                    <Plane className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {flight.airline?.name || flight.airline || "Airline"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {flight.departure?.iata || flight.dep_iata || "—"} → {flight.arrival?.iata || flight.arr_iata || "—"}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {flight.departure?.scheduled?.slice(11, 16) || flight.dep_time || "—"}
                      </span>
                      <span>{fId || ""}</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                        {flight.status || "Scheduled"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">
                        {flight.price ? `₹${flight.price}` : "Check"}
                      </p>
                    </div>
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleAddFlightWishlist(flight, e)}
                      disabled={isWishlisted || !!addingId || !fId}
                      className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition ${
                        isWishlisted
                          ? "bg-rose-500 text-white"
                          : "bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-200"
                      }`}
                    >
                      {isAdding ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-white" : ""}`} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
            <Plane className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No flights found for this route.</p>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <button
          onClick={handleAccept}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Accept & Create Trip
        </button>
        <button
          onClick={() => router.push("/planner")}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Regenerate
        </button>
      </div>
    </div>
  );
}
