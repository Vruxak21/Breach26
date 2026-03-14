"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Loader2, MapPin, Star, Clock } from "lucide-react";

const ActivityMap = dynamic(() => import("@/components/map/ActivityMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto mt-20" />
    </div>
  ),
});

interface MapActivity {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description?: string;
  image?: string;
  rating?: number;
  duration?: number;
  city?: string;
  price?: number;
  currency?: string;
}

interface DayActivity {
  name: string;
  description?: string;
  time?: string;
  duration?: number;
  category?: string;
  estimatedCost?: number;
  lat?: number;
  lng?: number;
}

interface Day {
  day: number;
  date: string;
  title?: string;
  activities: DayActivity[];
}

export function ItineraryMapRegion({
  days,
  destination,
  country,
}: {
  days: Day[];
  destination: string;
  country?: string;
}) {
  const [mapActivities, setMapActivities] = useState<MapActivity[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredActivity, setHoveredActivity] = useState<MapActivity | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function buildMap() {
      try {
        setIsLoading(true);

        // 1. Geocode the destination to get map center
        const query = country ? `${destination}, ${country}` : destination;
        const geoRes = await fetch(`/api/geocode?query=${encodeURIComponent(query)}`);
        const geoData = geoRes.ok ? await geoRes.json() : [];
        let center: [number, number] | null = null;

        if (geoData.length > 0) {
          center = [parseFloat(geoData[0].lat), parseFloat(geoData[0].lng)];
        }

        // 2. Extract pinnable activities from trip.days (the AI-generated itinerary)
        const pinnedActivities: MapActivity[] = [];
        for (const day of days) {
          for (const act of day.activities || []) {
            if (act.lat && act.lng && act.lat !== 0 && act.lng !== 0) {
              pinnedActivities.push({
                id: `day${day.day}-${act.name}`,
                name: act.name,
                category: act.category || "culture",
                lat: act.lat,
                lng: act.lng,
                description: act.description || "",
                duration: act.duration,
              });
            }
          }
        }

        // 3. Also fetch nearby recommendations (restaurants, sightseeing) via Geoapify
        let nearbyPlaces: MapActivity[] = [];
        if (center) {
          try {
            const placesRes = await fetch(
              `/api/places?lat=${center[0]}&lng=${center[1]}&categories=tourism.sights,tourism.attraction,catering.restaurant&limit=10`
            );
            const placesData = placesRes.ok ? await placesRes.json() : [];
            nearbyPlaces = (Array.isArray(placesData) ? placesData : []).map((p: any) => ({
              id: p.id || `nearby-${p.name}`,
              name: p.name,
              category: p.category || "culture",
              lat: p.lat,
              lng: p.lng,
              description: p.description || "",
              rating: p.rating,
              image: p.image,
              duration: p.duration,
            }));
          } catch (e) {
            console.error("Nearby places fetch error:", e);
          }
        }

        if (!isMounted) return;

        // 4. Combine: itinerary pins first, then nearby recommendations
        const allActivities = [...pinnedActivities, ...nearbyPlaces];

        // Use first itinerary activity as center if available, else destination center
        if (pinnedActivities.length > 0 && !center) {
          center = [pinnedActivities[0].lat, pinnedActivities[0].lng];
        }

        if (center) setMapCenter(center);
        setMapActivities(allActivities);
      } catch (error) {
        console.error("Map Region Error:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    buildMap();
    return () => { isMounted = false; };
  }, [days, destination, country]);

  return (
    <div className="relative h-full min-h-[300px] w-full bg-slate-50" data-html2canvas-ignore="true">
      {isLoading || !mapCenter ? (
        <div className="flex h-full min-h-[300px] flex-col items-center justify-center bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
              <p className="mt-3 text-sm text-slate-500">Mapping your itinerary...</p>
            </div>
          ) : (
            <div className="text-center text-slate-500 flex flex-col items-center">
              <MapPin className="mb-2 size-8 text-indigo-500 opacity-50" />
              <p className="font-medium text-slate-700">Map unavailable</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <ActivityMap
            activities={mapActivities}
            center={mapCenter}
            onHover={setHoveredActivity}
            onLeave={() => setHoveredActivity(null)}
          />

          <div className="absolute top-3 left-3 z-[1000] rounded-xl bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-lg border border-slate-200 backdrop-blur-sm">
            {mapActivities.length} locations mapped
          </div>

          {hoveredActivity && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[340px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex gap-4 p-4">
                {hoveredActivity.image && (
                  <img
                    src={hoveredActivity.image}
                    alt={hoveredActivity.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{hoveredActivity.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{hoveredActivity.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    {hoveredActivity.rating && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                        <Star className="h-3 w-3 fill-amber-400" />
                        {hoveredActivity.rating.toFixed(1)}
                      </span>
                    )}
                    {hoveredActivity.duration && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {hoveredActivity.duration} min
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 capitalize">
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
  );
}
