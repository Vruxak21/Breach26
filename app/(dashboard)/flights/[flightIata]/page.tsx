"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Plane,
  MapPin,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Navigation,
} from "lucide-react";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { motion } from "framer-motion";

interface FlightDetail {
  flightIata: string;
  flightNumber: string;
  flightIcao: string;
  airline: { name: string; iata: string; icao: string };
  departure: {
    airport: string;
    iata: string;
    icao: string;
    terminal: string;
    gate: string;
    scheduled: string;
    estimated: string;
    actual: string;
    delay: number | null;
    timezone: string;
  };
  arrival: {
    airport: string;
    iata: string;
    icao: string;
    terminal: string;
    gate: string;
    scheduled: string;
    estimated: string;
    actual: string;
    delay: number | null;
    timezone: string;
  };
  status: string;
  aircraft: { registration: string; iata: string; icao: string } | null;
  live: {
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    isGround: boolean;
    updatedAt: string;
  } | null;
  flightDate: string;
}

function formatTime(dateStr: string) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  } catch {
    return dateStr.slice(11, 16) || "—";
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "active":
    case "en-route":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "landed":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "cancelled":
    case "diverted":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "incident":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-amber-100 text-amber-700 border-amber-200";
  }
}

export default function FlightDetailPage() {
  const { flightIata } = useParams<{ flightIata: string }>();
  const router = useRouter();
  const { addItem, isInWishlist, fetchItems, isLoaded } = useWishlistStore();

  const [flight, setFlight] = useState<FlightDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!isLoaded) fetchItems();
  }, [isLoaded, fetchItems]);

  useEffect(() => {
    if (isLoaded && flightIata) {
      setWishlisted(isInWishlist(flightIata));
    }
  }, [isLoaded, flightIata, isInWishlist]);

  useEffect(() => {
    if (!flightIata) return;

    fetch(`/api/flights/${flightIata}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setFlight(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [flightIata]);

  const handleWishlist = async () => {
    if (!flight || wishlisted || adding) return;
    setAdding(true);
    const result = await addItem(
      "flight",
      {
        name: `${flight.airline.name} ${flight.flightIata}`,
        airline: flight.airline.name,
        flightNumber: flight.flightIata,
        departure: {
          airport: flight.departure.airport,
          iata: flight.departure.iata,
          scheduled: flight.departure.scheduled,
        },
        arrival: {
          airport: flight.arrival.airport,
          iata: flight.arrival.iata,
          scheduled: flight.arrival.scheduled,
        },
        status: flight.status,
        flightDate: flight.flightDate,
      },
      flightIata
    );
    if (result) setWishlisted(true);
    setAdding(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <Plane className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
        </div>
        <p className="text-sm text-slate-500">Loading flight details...</p>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Plane className="h-10 w-10 text-slate-300" />
        <p className="text-sm text-slate-500">Flight not found</p>
        <button
          onClick={() => router.back()}
          className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Airline Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white shadow-xl md:p-8"
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute -right-4 bottom-4 h-20 w-20 rounded-full bg-white/5" />
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">{flight.flightIata}</h1>
                <p className="text-sm text-indigo-200">{flight.airline.name}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(flight.status)}`}>
                {flight.status.charAt(0).toUpperCase() + flight.status.slice(1)}
              </span>
              {flight.flightDate && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                  {formatDate(flight.flightDate)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleWishlist}
            disabled={wishlisted || adding}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow transition ${
              wishlisted
                ? "bg-white/20 text-white border border-white/30 cursor-default"
                : "bg-white text-indigo-700 hover:bg-indigo-50"
            }`}
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : wishlisted ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
            {wishlisted ? "In Wishlist" : "Add to Wishlist"}
          </button>
        </div>
      </motion.div>

      {/* Flight Route Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-8 md:grid-cols-[1fr_auto_1fr]">
          {/* Departure */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Departure</span>
            <div>
              <p className="text-3xl font-bold text-slate-900">{flight.departure.iata || "—"}</p>
              <p className="text-sm text-slate-600">{flight.departure.airport}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="font-medium">Scheduled:</span> {formatTime(flight.departure.scheduled)}
              </div>
              {flight.departure.estimated && flight.departure.estimated !== flight.departure.scheduled && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Estimated:</span> {formatTime(flight.departure.estimated)}
                </div>
              )}
              {flight.departure.actual && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Actual:</span> {formatTime(flight.departure.actual)}
                </div>
              )}
              {flight.departure.terminal && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  Terminal {flight.departure.terminal} {flight.departure.gate ? `· Gate ${flight.departure.gate}` : ""}
                </div>
              )}
              {flight.departure.delay && flight.departure.delay > 0 && (
                <div className="flex items-center gap-2 text-sm text-rose-600">
                  <AlertTriangle className="h-4 w-4" />
                  Delayed by {flight.departure.delay} min
                </div>
              )}
            </div>
          </div>

          {/* Center Arrow */}
          <div className="hidden items-center justify-center md:flex">
            <div className="flex flex-col items-center gap-2 text-slate-300">
              <div className="h-16 w-px bg-gradient-to-b from-emerald-300 to-indigo-300" />
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-emerald-50 to-indigo-50 shadow-sm">
                <ArrowRight className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="h-16 w-px bg-gradient-to-b from-indigo-300 to-blue-300" />
            </div>
          </div>
          <div className="flex items-center justify-center md:hidden">
            <div className="flex items-center gap-2 text-slate-300">
              <div className="h-px w-12 bg-gradient-to-r from-emerald-300 to-indigo-300" />
              <Plane className="h-4 w-4 rotate-90 text-indigo-400" />
              <div className="h-px w-12 bg-gradient-to-r from-indigo-300 to-blue-300" />
            </div>
          </div>

          {/* Arrival */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Arrival</span>
            <div>
              <p className="text-3xl font-bold text-slate-900">{flight.arrival.iata || "—"}</p>
              <p className="text-sm text-slate-600">{flight.arrival.airport}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="font-medium">Scheduled:</span> {formatTime(flight.arrival.scheduled)}
              </div>
              {flight.arrival.estimated && flight.arrival.estimated !== flight.arrival.scheduled && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Estimated:</span> {formatTime(flight.arrival.estimated)}
                </div>
              )}
              {flight.arrival.actual && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Actual:</span> {formatTime(flight.arrival.actual)}
                </div>
              )}
              {flight.arrival.terminal && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  Terminal {flight.arrival.terminal} {flight.arrival.gate ? `· Gate ${flight.arrival.gate}` : ""}
                </div>
              )}
              {flight.arrival.delay && flight.arrival.delay > 0 && (
                <div className="flex items-center gap-2 text-sm text-rose-600">
                  <AlertTriangle className="h-4 w-4" />
                  Delayed by {flight.arrival.delay} min
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Aircraft & Additional Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        {flight.aircraft && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Info className="h-4 w-4 text-indigo-500" /> Aircraft
            </h3>
            <div className="space-y-1.5 text-sm text-slate-600">
              {flight.aircraft.iata && (
                <p>Type: <span className="font-medium text-slate-800">{flight.aircraft.iata}</span></p>
              )}
              {flight.aircraft.registration && (
                <p>Registration: <span className="font-medium text-slate-800">{flight.aircraft.registration}</span></p>
              )}
              {flight.aircraft.icao && (
                <p>ICAO: <span className="font-medium text-slate-800">{flight.aircraft.icao}</span></p>
              )}
            </div>
          </motion.div>
        )}

        {flight.live && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <Navigation className="h-4 w-4" /> Live Tracking
            </h3>
            <div className="space-y-1.5 text-sm text-emerald-700">
              <p>Altitude: <span className="font-medium">{flight.live.altitude?.toLocaleString()} ft</span></p>
              <p>Speed: <span className="font-medium">{flight.live.speed?.toLocaleString()} km/h</span></p>
              <p>{flight.live.isGround ? "✈️ On Ground" : "🛫 In Air"}</p>
              {flight.live.updatedAt && (
                <p className="text-xs text-emerald-500">Updated: {formatTime(flight.live.updatedAt)}</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
