import Image from "next/image";
import {
  Clock,
  Heart,
  MapPin,
  Star,
} from "lucide-react";
import type { Activity } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface ActivityCardProps {
  activity: Activity;
  onWishlistToggle?: (isWishlisted: boolean) => void;
  onAddToTrip?: () => void;
}

export function ActivityCard({
  activity,
  onWishlistToggle,
  onAddToTrip,
}: ActivityCardProps) {
  const [wishlisted, setWishlisted] = useState<boolean>(false);

  const handleToggleWishlist = () => {
    const next = !wishlisted;
    setWishlisted(next);
    if (onWishlistToggle) {
      onWishlistToggle(next);
    }
  };

  return (
    <div className="tm-card flex w-72 shrink-0 flex-col">
      <div className="tm-card-image">
        <Image
          src={activity.image}
          alt={activity.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 280px, 288px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-amber-500 shadow-sm">
          <Star className="h-3 w-3 text-amber-400" />
          <span className="text-[11px] text-slate-800">
            {activity.rating.toFixed(1)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleWishlist}
          className={cn(
            "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm transition hover:bg-white",
            wishlisted && "text-rose-500",
          )}
          aria-label="Toggle wishlist"
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div>
          <p className="tm-badge tm-badge-adventure uppercase">
            {activity.category}
          </p>
          <h3 className="mt-2 line-clamp-1 text-base font-semibold text-[#111111]">
            {activity.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[#6B7280]">
            <MapPin className="h-3.5 w-3.5 text-[#9CA3AF]" />
            <span>
              {activity.city}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-[13px] text-[#6B7280]">
          <div className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#9CA3AF]" />
            <span>{activity.duration} min</span>
          </div>
          {activity.price > 0 && (
            <span className="inline-flex items-center gap-1 text-[#0D9488]">
              {formatCurrency(activity.price, activity.currency)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onAddToTrip}
          className="tm-btn-outline mt-3 w-full px-3 py-2"
        >
          Add to Trip
        </button>
      </div>
    </div>
  );
}

