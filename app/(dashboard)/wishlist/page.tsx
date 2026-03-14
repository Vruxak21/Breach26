"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2, Star, Trash2, Hotel, MapPin, Calendar, Plane, Clock } from "lucide-react";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

interface WishlistItemData {
  id: string;
  type: string;
  externalId?: string | null;
  data: any;
  addedAt: string;
}

const typeIcons: Record<string, any> = { hotel: Hotel, activity: MapPin, event: Calendar, flight: Plane };

export default function WishlistPage() {
  const { items, isLoaded, fetchItems, removeItem, resetNewCount } = useWishlistStore();
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) fetchItems();
    // Clear badge when visiting wishlist page
    resetNewCount();
  }, [isLoaded, fetchItems, resetNewCount]);

  const handleRemove = async (itemId: string) => {
    setDeletingId(itemId);
    await removeItem(itemId);
    setDeletingId(null);
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
        <p className="mt-1 text-sm text-slate-500">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex gap-2">
        {["all", "hotel", "activity", "event", "flight"].map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${filter === tab ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>
            {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1) + "s"}
          </button>
        ))}
      </div>

      {!isLoaded ? (
        <div className="flex flex-col items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center">
          <Heart className="h-8 w-8 text-slate-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-600">No wishlist items yet</h3>
          <p className="mt-1 text-xs text-slate-400">Save hotels, flights, and more while planning</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const data = typeof item.data === "string" ? JSON.parse(item.data) : item.data;
            const Icon = typeIcons[item.type] || MapPin;
            const isHotel = item.type === "hotel";
            const isFlight = item.type === "flight";

            return (
              <div key={item.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
                {/* Image section — show image for hotels, gradient banner for flights */}
                <div className="relative h-36">
                  {isHotel ? (
                    <img
                      src={data.image || data.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=60"}
                      alt={data.name || "Hotel"}
                      className="h-full w-full object-cover"
                    />
                  ) : isFlight ? (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                      <Plane className="h-12 w-12 text-white/30" />
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
                  <button onClick={() => handleRemove(item.id)} disabled={deletingId === item.id}
                    className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 hover:bg-rose-50 transition">
                    {deletingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{data.name || "Saved Item"}</h3>

                  {/* Hotel-specific details */}
                  {isHotel && (
                    <>
                      {data.city && <p className="mt-0.5 text-xs text-slate-500"><MapPin className="mr-1 inline h-3 w-3" />{data.city}{data.country ? `, ${data.country}` : ""}</p>}
                      <div className="mt-2 flex items-center justify-between">
                        {data.rating && (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <Star className="h-3 w-3 fill-amber-400" />{typeof data.rating === "number" ? data.rating.toFixed(1) : data.rating}
                          </div>
                        )}
                        {data.pricePerNight && (
                          <span className="text-xs font-bold text-indigo-600">₹{data.pricePerNight}/night</span>
                        )}
                      </div>
                    </>
                  )}

                  {/* Flight-specific details */}
                  {isFlight && (
                    <>
                      {data.airline && <p className="mt-0.5 text-xs text-slate-500">{typeof data.airline === "string" ? data.airline : data.airline?.name || "Airline"}</p>}
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
                      {data.rating && <div className="mt-2 flex items-center gap-1 text-xs text-amber-600"><Star className="h-3 w-3 fill-amber-400" />{data.rating.toFixed(1)}</div>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
