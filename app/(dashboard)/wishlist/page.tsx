"use client";

import { useState, useEffect } from "react";
import { Heart, Star, Trash2, Hotel, MapPin, Calendar, Plane, Loader2 } from "lucide-react";

interface WishlistItemData {
  id: string;
  type: string;
  data: any;
  addedAt: string;
}

const typeIcons: Record<string, any> = {
  hotel: Hotel,
  activity: MapPin,
  event: Calendar,
  flight: Plane,
};

const tabs = ["all", "hotel", "activity", "event", "flight"] as const;

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleRemove = async (itemId: string) => {
    setDeletingId(itemId);
    try {
      const res = await fetch(`/api/wishlist?id=${itemId}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((i) => i.id !== itemId));
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <p className="tm-label">Saved Items</p>
        <h1
          className="text-[40px] font-700 leading-tight mt-1"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-primary)" }}
        >
          My Wishlist
        </h1>
        <p className="mt-1.5 text-[15px]" style={{ color: "var(--text-muted)" }}>
          {items.length} saved item{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const isActive = filter === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="rounded-full px-4 py-1.5 text-[13px] font-600 uppercase tracking-wide transition-all"
              style={{
                border: `1px solid ${isActive ? "var(--primary-300)" : "var(--border-default)"}`,
                background: isActive ? "var(--primary-50)" : "var(--bg-base)",
                color: isActive ? "var(--primary-700)" : "var(--text-muted)",
              }}
            >
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1) + "s"}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-52 tm-skeleton rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center rounded-xl px-8 py-16 text-center"
          style={{ border: "2px dashed var(--border-default)", background: "var(--bg-subtle)" }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full mb-5"
            style={{ background: "var(--accent-50)", color: "var(--accent-400)" }}
          >
            <Heart className="h-8 w-8" />
          </div>
          <h3
            className="text-[22px] font-600"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-secondary)" }}
          >
            {filter === "all" ? "Your wishlist is empty" : `No ${filter}s saved`}
          </h3>
          <p className="mt-2 max-w-xs text-[14px]" style={{ color: "var(--text-muted)" }}>
            Save hotels, activities, and more while planning your trips
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const data = typeof item.data === "string" ? JSON.parse(item.data) : item.data;
            const Icon = typeIcons[item.type] || MapPin;
            return (
              <div
                key={item.id}
                className="group overflow-hidden rounded-xl transition-all"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-default)",
                  boxShadow: "var(--shadow-sm)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
                  (e.currentTarget as HTMLElement).style.transform = "";
                }}
              >
                <div className="relative h-36">
                  <img
                    src={data.image || data.images?.[0] || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=60"}
                    alt={data.name || "Item"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Type badge */}
                  <span
                    className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-600 uppercase tracking-wide"
                    style={{ background: "rgba(255,255,255,0.95)", color: "var(--text-secondary)", boxShadow: "var(--shadow-xs)" }}
                  >
                    <Icon className="h-3 w-3" />
                    {item.type}
                  </span>
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={deletingId === item.id}
                    className="absolute top-2.5 right-2.5 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(255,255,255,0.95)", color: "var(--danger-text)", boxShadow: "var(--shadow-xs)" }}
                    aria-label="Remove from wishlist"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-[14px] font-600" style={{ color: "var(--text-primary)" }}>
                    {data.name || "Saved Item"}
                  </h3>
                  {data.city && (
                    <p className="mt-0.5 flex items-center gap-1 text-[12px]" style={{ color: "var(--text-muted)" }}>
                      <MapPin className="h-3 w-3" />
                      {data.city}
                    </p>
                  )}
                  {data.rating && (
                    <div className="mt-2 flex items-center gap-1 text-[12px]">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span style={{ color: "var(--warning-text)" }}>{data.rating.toFixed(1)}</span>
                    </div>
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
