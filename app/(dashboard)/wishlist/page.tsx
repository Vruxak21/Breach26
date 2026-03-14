"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Loader2,
  Star,
  Trash2,
  Hotel,
  MapPin,
  Calendar,
  Plane,
  Clock,
  ChevronDown,
  ChevronRight,
  Globe,
  Bookmark,
} from "lucide-react";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

interface WishlistItemData {
  id: string;
  type: string;
  externalId?: string | null;
  itineraryId?: string | null;
  data: any;
  addedAt: string;
  itinerary?: {
    id: string;
    title: string;
    destination: string;
    country: string;
    coverImage: string;
    totalDays: number;
  } | null;
}

interface TripGroup {
  tripId: string | null;
  tripTitle: string;
  tripDestination: string;
  tripCoverImage: string;
  tripCountry: string;
  tripDays: number;
  items: WishlistItemData[];
}

const typeIcons: Record<string, any> = { hotel: Hotel, activity: MapPin, event: Calendar, flight: Plane };

export default function WishlistPage() {
  const { items, isLoaded, fetchItems, removeItem, resetNewCount } = useWishlistStore();
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) fetchItems();
    resetNewCount();
  }, [isLoaded, fetchItems, resetNewCount]);

  const handleRemove = async (itemId: string) => {
    setDeletingId(itemId);
    await removeItem(itemId);
    setDeletingId(null);
  };

  // Group items by trip
  const tripGroups = useMemo(() => {
    const groups: Record<string, TripGroup> = {};

    (items as WishlistItemData[]).forEach((item) => {
      const key = item.itineraryId || "__unsaved__";

      if (!groups[key]) {
        groups[key] = {
          tripId: item.itineraryId || null,
          tripTitle: item.itinerary?.title || "Unsaved Items",
          tripDestination: item.itinerary?.destination || "No trip assigned",
          tripCoverImage: item.itinerary?.coverImage || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
          tripCountry: item.itinerary?.country || "",
          tripDays: item.itinerary?.totalDays || 0,
          items: [],
        };
      }

      groups[key].items.push(item);
    });

    // Sort: real trips first, "Unsaved" last
    const sorted = Object.values(groups).sort((a, b) => {
      if (!a.tripId) return 1;
      if (!b.tripId) return -1;
      return b.items.length - a.items.length;
    });

    return sorted;
  }, [items]);

  const toggleTrip = (tripId: string) => {
    setExpandedTrips((prev) => {
      const next = new Set(prev);
      if (next.has(tripId)) {
        next.delete(tripId);
      } else {
        next.add(tripId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
        <p className="mt-1 text-sm text-slate-500">
          {items.length} saved item{items.length !== 1 ? "s" : ""} across {tripGroups.length} trip{tripGroups.length !== 1 ? "s" : ""}
        </p>
      </div>

      {!isLoaded ? (
        <div className="flex flex-col items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center">
          <Heart className="h-8 w-8 text-slate-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-600">No wishlist items yet</h3>
          <p className="mt-1 text-xs text-slate-400">Save hotels, flights, and more while planning</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tripGroups.map((group) => {
            const groupKey = group.tripId || "__unsaved__";
            const isExpanded = expandedTrips.has(groupKey);

            return (
              <div
                key={groupKey}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all"
              >
                {/* Trip Header — Playlist Card */}
                <button
                  onClick={() => toggleTrip(groupKey)}
                  className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50"
                >
                  {/* Cover Image */}
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={group.tripCoverImage}
                      alt={group.tripTitle}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute bottom-1 right-1.5 flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 shadow-sm">
                      <Bookmark className="h-2.5 w-2.5" />
                      {group.items.length}
                    </span>
                  </div>

                  {/* Trip Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-900">{group.tripTitle}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <Globe className="h-3 w-3" />
                      {group.tripDestination}
                      {group.tripCountry && `, ${group.tripCountry}`}
                    </p>
                    {group.tripDays > 0 && (
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {group.tripDays} day{group.tripDays !== 1 ? "s" : ""} trip
                      </p>
                    )}
                  </div>

                  {/* Item type badges */}
                  <div className="flex gap-1.5">
                    {Array.from(new Set(group.items.map((i) => i.type))).map((type) => {
                      const Icon = typeIcons[type] || MapPin;
                      const count = group.items.filter((i) => i.type === type).length;
                      return (
                        <span
                          key={type}
                          className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600"
                        >
                          <Icon className="h-3 w-3" />
                          {count}
                        </span>
                      );
                    })}
                  </div>

                  {/* Expand/Collapse icon */}
                  <div className="shrink-0 text-slate-400">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </div>
                </button>

                {/* Expanded Items */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {group.items.map((item) => {
                        const data = typeof item.data === "string" ? JSON.parse(item.data) : item.data;
                        const Icon = typeIcons[item.type] || MapPin;
                        const isHotel = item.type === "hotel";
                        const isFlight = item.type === "flight";

                        return (
                          <div
                            key={item.id}
                            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
                          >
                            {/* Image section */}
                            <div className="relative h-32">
                              {isHotel ? (
                                <img
                                  src={data.image || data.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=60"}
                                  alt={data.name || "Hotel"}
                                  className="h-full w-full object-cover"
                                />
                              ) : isFlight ? (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                                  <Plane className="h-10 w-10 text-white/30" />
                                </div>
                              ) : (
                                <img
                                  src={data.image || data.images?.[0] || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=60"}
                                  alt={data.name || "Item"}
                                  className="h-full w-full object-cover"
                                />
                              )}
                              <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-slate-700 shadow-sm">
                                <Icon className="h-3 w-3" />{item.type}
                              </span>
                              <button
                                onClick={() => handleRemove(item.id)}
                                disabled={deletingId === item.id}
                                className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 hover:bg-rose-50 transition"
                              >
                                {deletingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              </button>
                            </div>

                            <div className="p-3">
                              <h4 className="text-sm font-semibold text-slate-900">{data.name || "Saved Item"}</h4>

                              {/* Hotel details */}
                              {isHotel && (
                                <>
                                  {data.city && (
                                    <p className="mt-0.5 text-xs text-slate-500">
                                      <MapPin className="mr-1 inline h-3 w-3" />
                                      {data.city}{data.country ? `, ${data.country}` : ""}
                                    </p>
                                  )}
                                  <div className="mt-2 flex items-center justify-between">
                                    {data.rating && (
                                      <div className="flex items-center gap-1 text-xs text-amber-600">
                                        <Star className="h-3 w-3 fill-amber-400" />
                                        {typeof data.rating === "number" ? data.rating.toFixed(1) : data.rating}
                                      </div>
                                    )}
                                    {data.pricePerNight && (
                                      <span className="text-xs font-bold text-indigo-600">₹{data.pricePerNight}/night</span>
                                    )}
                                  </div>
                                </>
                              )}

                              {/* Flight details */}
                              {isFlight && (
                                <>
                                  {data.airline && (
                                    <p className="mt-0.5 text-xs text-slate-500">
                                      {typeof data.airline === "string" ? data.airline : data.airline?.name || "Airline"}
                                    </p>
                                  )}
                                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                                    <span className="font-medium">{data.departure?.iata || "—"}</span>
                                    <span className="text-slate-300">→</span>
                                    <span className="font-medium">{data.arrival?.iata || "—"}</span>
                                    {data.departure?.scheduled && (
                                      <span className="ml-auto flex items-center gap-1 text-slate-400">
                                        <Clock className="h-3 w-3" />
                                        {data.departure.scheduled.slice(11, 16)}
                                      </span>
                                    )}
                                  </div>
                                  {data.status && (
                                    <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                                      {data.status}
                                    </span>
                                  )}
                                </>
                              )}

                              {/* Generic fallback */}
                              {!isHotel && !isFlight && (
                                <>
                                  {data.city && <p className="mt-0.5 text-xs text-slate-500">{data.city}</p>}
                                  {data.rating && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                                      <Star className="h-3 w-3 fill-amber-400" />{data.rating.toFixed(1)}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
