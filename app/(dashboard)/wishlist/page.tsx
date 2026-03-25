"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { motion } from "framer-motion";
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
  const router = useRouter();
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  };

  return (
    <motion.div className="space-y-8" variants={container} initial="hidden" animate="show">
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-xl border border-(--color-border) bg-white p-6 shadow-(--shadow-lg) md:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(244,164,96,0.18),transparent_42%),radial-gradient(circle_at_88%_88%,rgba(227,83,54,0.1),transparent_38%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-(--color-text-tertiary)">
              CURATED SAVES
            </p>
            <h1 className="font-display text-3xl font-bold text-(--color-text-primary) md:text-4xl">
              Wishlist
            </h1>
            <p className="mt-2 text-[15px] text-(--color-text-secondary)">
              {items.length} saved item{items.length !== 1 ? "s" : ""} across {tripGroups.length} trip{tripGroups.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(244,164,96,0.4)] bg-(--color-sand-light) px-4 py-2 text-[13px] font-medium text-(--color-earth)">
            <Heart className="h-4 w-4" />
            Keep places you love
          </div>
        </div>
      </motion.section>

      {!isLoaded ? (
        <motion.div variants={item} className="flex flex-col items-center rounded-lg border border-(--color-border) bg-white py-16 shadow-(--shadow-sm)">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="mt-3 text-sm text-(--color-text-secondary)">Loading your saved picks...</p>
        </motion.div>
      ) : items.length === 0 ? (
        <motion.div variants={item} className="flex flex-col items-center rounded-lg border-2 border-dashed border-(--color-border) bg-(--color-surface) py-14 text-center">
          <Heart className="h-9 w-9 text-(--color-text-tertiary)" />
          <h3 className="mt-4 font-display text-xl font-semibold text-(--color-text-primary)">No wishlist items yet</h3>
          <p className="mt-1 text-sm text-(--color-text-secondary)">Save hotels, flights, and experiences while you plan.</p>
        </motion.div>
      ) : (
        <motion.div variants={container} className="space-y-4">
          {tripGroups.map((group) => {
            const groupKey = group.tripId || "__unsaved__";
            const isExpanded = expandedTrips.has(groupKey);

            return (
              <motion.div
                variants={item}
                key={groupKey}
                className="overflow-hidden rounded-lg border border-(--color-border) bg-white shadow-(--shadow-sm) transition-all duration-200 ease-out hover:shadow-(--shadow-md)"
              >
                <button
                  onClick={() => toggleTrip(groupKey)}
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors duration-150 ease-out hover:bg-(--color-surface) md:p-5"
                >
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-(--color-border)">
                    <img
                      src={group.tripCoverImage}
                      alt={group.tripTitle}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[rgba(28,15,8,0.45)] to-transparent" />
                    <span className="absolute bottom-1 right-1.5 inline-flex items-center gap-0.5 rounded-full bg-[rgba(255,255,255,0.92)] px-1.5 py-0.5 text-[9px] font-bold text-(--color-earth) shadow-(--shadow-xs)">
                      <Bookmark className="h-2.5 w-2.5" />
                      {group.items.length}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-lg font-semibold text-(--color-text-primary)">{group.tripTitle}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-(--color-text-secondary)">
                      <Globe className="h-3 w-3" />
                      {group.tripDestination}
                      {group.tripCountry && `, ${group.tripCountry}`}
                    </p>
                    {group.tripDays > 0 && (
                      <p className="mt-0.5 text-[11px] text-(--color-text-tertiary)">
                        {group.tripDays} day{group.tripDays !== 1 ? "s" : ""} trip
                      </p>
                    )}
                  </div>

                  <div className="hidden gap-1.5 sm:flex">
                    {Array.from(new Set(group.items.map((i) => i.type))).map((type) => {
                      const Icon = typeIcons[type] || MapPin;
                      const count = group.items.filter((i) => i.type === type).length;
                      return (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1 rounded-full border border-[rgba(244,164,96,0.35)] bg-(--color-sand-light) px-2 py-1 text-[10px] font-medium text-(--color-earth)"
                        >
                          <Icon className="h-3 w-3" />
                          {count}
                        </span>
                      );
                    })}
                  </div>

                  <div className="shrink-0 text-(--color-text-tertiary)">
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-(--color-border) bg-(--color-surface) p-4 md:p-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {group.items.map((item) => {
                        const data = typeof item.data === "string" ? JSON.parse(item.data) : item.data;
                        const Icon = typeIcons[item.type] || MapPin;
                        const isHotel = item.type === "hotel";
                        const isFlight = item.type === "flight";

                        const handleCardClick = () => {
                          if (isFlight) {
                            const flightId = item.externalId || data.flightNumber || data.flightIata;
                            if (flightId) router.push(`/flights/${flightId}`);
                          } else if (isHotel) {
                            const hotelId = item.externalId || data.hotelId || data.id;
                            if (hotelId) router.push(`/hotels/${hotelId}`);
                          }
                        };

                        return (
                          <div
                            key={item.id}
                            onClick={handleCardClick}
                            className="group cursor-pointer overflow-hidden rounded-md border border-(--color-border) bg-white shadow-(--shadow-xs) transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-(--shadow-md)"
                          >
                            <div className="relative h-32">
                              {isHotel ? (
                                <img
                                  src={data.image || data.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=60"}
                                  alt={data.name || "Hotel"}
                                  className="h-full w-full object-cover"
                                />
                              ) : isFlight ? (
                                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[rgba(163,80,45,0.88)] to-[rgba(227,83,54,0.85)]">
                                  <Plane className="h-10 w-10 text-white/40" />
                                </div>
                              ) : (
                                <img
                                  src={data.image || data.images?.[0] || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=60"}
                                  alt={data.name || "Item"}
                                  className="h-full w-full object-cover"
                                />
                              )}

                              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-[rgba(244,164,96,0.35)] bg-[rgba(255,255,255,0.93)] px-2 py-0.5 text-[10px] font-medium text-(--color-earth) shadow-(--shadow-xs)">
                                <Icon className="h-3 w-3" />
                                {item.type}
                              </span>

                              <button
                                onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                                disabled={deletingId === item.id}
                                className="absolute right-2 top-2 rounded-full bg-[rgba(255,255,255,0.93)] p-1.5 text-primary shadow-(--shadow-xs) opacity-0 transition-all duration-150 ease-out group-hover:opacity-100 hover:bg-(--color-sand-light)"
                                type="button"
                              >
                                {deletingId === item.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>

                            <div className="p-3.5">
                              <h4 className="line-clamp-1 text-[15px] font-semibold text-(--color-text-primary)">
                                {data.name || "Saved Item"}
                              </h4>

                              {isHotel && (
                                <>
                                  {data.city && (
                                    <p className="mt-1 text-xs text-(--color-text-secondary)">
                                      <MapPin className="mr-1 inline h-3 w-3" />
                                      {data.city}{data.country ? `, ${data.country}` : ""}
                                    </p>
                                  )}
                                  <div className="mt-2.5 flex items-center justify-between">
                                    {data.rating && (
                                      <div className="inline-flex items-center gap-1 text-xs text-(--color-earth)">
                                        <Star className="h-3 w-3 fill-(--color-sand) text-(--color-sand)" />
                                        {typeof data.rating === "number" ? data.rating.toFixed(1) : data.rating}
                                      </div>
                                    )}
                                    {data.pricePerNight && (
                                      <span className="text-xs font-bold text-primary">₹{data.pricePerNight}/night</span>
                                    )}
                                  </div>
                                </>
                              )}

                              {isFlight && (
                                <>
                                  {data.airline && (
                                    <p className="mt-1 text-xs text-(--color-text-secondary)">
                                      {typeof data.airline === "string" ? data.airline : data.airline?.name || "Airline"}
                                    </p>
                                  )}
                                  <div className="mt-2.5 flex items-center gap-2 text-xs text-(--color-text-secondary)">
                                    <span className="font-semibold text-(--color-earth)">{data.departure?.iata || "—"}</span>
                                    <span className="text-(--color-text-tertiary)">→</span>
                                    <span className="font-semibold text-(--color-earth)">{data.arrival?.iata || "—"}</span>
                                    {data.departure?.scheduled && (
                                      <span className="ml-auto inline-flex items-center gap-1 text-(--color-text-tertiary)">
                                        <Clock className="h-3 w-3" />
                                        {data.departure.scheduled.slice(11, 16)}
                                      </span>
                                    )}
                                  </div>
                                  {data.status && (
                                    <span className="mt-2.5 inline-block rounded-full border border-[rgba(244,164,96,0.35)] bg-(--color-sand-light) px-2 py-0.5 text-[10px] font-medium text-(--color-earth)">
                                      {data.status}
                                    </span>
                                  )}
                                </>
                              )}

                              {!isHotel && !isFlight && (
                                <>
                                  {data.city && <p className="mt-1 text-xs text-(--color-text-secondary)">{data.city}</p>}
                                  {data.rating && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-(--color-earth)">
                                      <Star className="h-3 w-3 fill-(--color-sand) text-(--color-sand)" />
                                      {typeof data.rating === "number" ? data.rating.toFixed(1) : data.rating}
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
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
