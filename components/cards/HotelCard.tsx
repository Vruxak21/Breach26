import Image from "next/image";
import {
  Heart,
  MapPin,
  Star,
} from "lucide-react";
import type { Hotel } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface HotelCardProps {
  hotel: Hotel;
  onWishlistToggle?: (isWishlisted: boolean) => void;
}

export function HotelCard({ hotel, onWishlistToggle }: HotelCardProps) {
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
          src={hotel.images[0] ?? ""}
          alt={hotel.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 280px, 288px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-amber-500 shadow-sm">
          <span className="flex items-center gap-0.5 text-[11px] text-slate-800">
            <Star className="h-3 w-3 text-amber-400" />
            {hotel.rating.toFixed(1)}
          </span>
          <span className="text-[11px] text-slate-500">
            · {hotel.stars}-star
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
          <h3 className="line-clamp-1 text-base font-semibold text-[#111111]">
            {hotel.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[#6B7280]">
            <MapPin className="h-3.5 w-3.5 text-[#9CA3AF]" />
            <span>
              {hotel.city}, {hotel.country}
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {hotel.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="rounded-full bg-[#F7F7F4] px-2 py-0.5 text-[11px] text-[#6B7280]"
            >
              {amenity}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-[#111111]">
            {formatCurrency(hotel.pricePerNight, hotel.currency)}
          </span>
          <span className="text-[13px] text-[#6B7280]">per night</span>
        </div>

        <button
          type="button"
          className="tm-btn-secondary mt-3 w-full px-3 py-2"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

