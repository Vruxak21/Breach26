"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  Clock,
  Wifi,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  ThumbsUp,
  ThumbsDown,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { motion, AnimatePresence } from "framer-motion";

interface HotelDetail {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  starRating: number;
  rating: number;
  description: string;
  images: string[];
  facilities: string[];
  rooms: { name: string; description: string; maxOccupancy: number; bedType: string }[];
  latitude: number;
  longitude: number;
  checkInTime: string;
  checkOutTime: string;
  hotelImportantInformation: string;
}

interface Review {
  name: string;
  country: string;
  date: string;
  averageScore: number;
  type: string;
  headline: string;
  pros: string;
  cons: string;
}

export default function HotelDetailPage() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const router = useRouter();
  const { addItem, isInWishlist, fetchItems, isLoaded } = useWishlistStore();

  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!isLoaded) fetchItems();
  }, [isLoaded, fetchItems]);

  useEffect(() => {
    if (isLoaded && hotelId) {
      setWishlisted(isInWishlist(hotelId));
    }
  }, [isLoaded, hotelId, isInWishlist]);

  useEffect(() => {
    if (!hotelId) return;

    fetch(`/api/hotels/${hotelId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setHotel(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`/api/hotels/${hotelId}/reviews`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
        setLoadingReviews(false);
      })
      .catch(() => setLoadingReviews(false));
  }, [hotelId]);

  const handleWishlist = async () => {
    if (!hotel || wishlisted || adding) return;
    setAdding(true);
    const result = await addItem(
      "hotel",
      {
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        rating: hotel.starRating,
        images: hotel.images,
        address: hotel.address,
      },
      hotel.id
    );
    if (result) setWishlisted(true);
    setAdding(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <Building2 className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
        </div>
        <p className="text-sm text-slate-500">Loading hotel details...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Building2 className="h-10 w-10 text-slate-300" />
        <p className="text-sm text-slate-500">Hotel not found</p>
        <button
          onClick={() => router.back()}
          className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  const images = hotel.images.length > 0 ? hotel.images : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"];

  return (
    <div className="space-y-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Image Gallery */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={images[activeImage]}
            alt={hotel.name}
            className="h-[300px] w-full object-cover md:h-[420px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveImage((p) => (p === 0 ? images.length - 1 : p - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveImage((p) => (p === images.length - 1 ? 0 : p + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.slice(0, 8).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-2 w-2 rounded-full transition ${i === activeImage ? "bg-white scale-125" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {images.length} photo{images.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Hotel Info */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{hotel.name}</h1>
            {hotel.starRating > 0 && (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
            )}
          </div>
          {hotel.address && (
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4 shrink-0" /> {hotel.address}
              {hotel.city && `, ${hotel.city}`}
              {hotel.country && `, ${hotel.country}`}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {hotel.checkInTime && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                <Clock className="h-3 w-3" /> Check-in: {hotel.checkInTime}
              </span>
            )}
            {hotel.checkOutTime && (
              <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">
                <Clock className="h-3 w-3" /> Check-out: {hotel.checkOutTime}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleWishlist}
          disabled={wishlisted || adding}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow transition ${
            wishlisted
              ? "bg-rose-50 text-rose-600 border border-rose-200 cursor-default"
              : "bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
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

      {/* Description */}
      {hotel.description && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">About</h2>
          <p className="text-sm leading-relaxed text-slate-600">{hotel.description}</p>
        </section>
      )}

      {/* Facilities */}
      {hotel.facilities.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Facilities</h2>
          <div className="flex flex-wrap gap-2">
            {hotel.facilities.slice(0, 20).map((f: any, i: number) => {
              const name = typeof f === "string" ? f : f.name || f.facilityName || String(f);
              return (
                <span
                  key={i}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700"
                >
                  <Wifi className="h-3 w-3 text-indigo-500" />
                  {name}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {/* Rooms */}
      {hotel.rooms.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Room Types</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {hotel.rooms.map((room, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{room.name}</p>
                {room.description && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{room.description}</p>}
                <div className="mt-2 flex gap-3 text-[10px] text-slate-400">
                  {room.maxOccupancy > 0 && <span>Up to {room.maxOccupancy} guests</span>}
                  {room.bedType && <span>{room.bedType}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Star className="h-5 w-5 text-amber-500" /> Guest Reviews
        </h2>
        {loadingReviews ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="ml-2 text-sm">Loading reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center">
            <User className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No reviews available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{review.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {review.type && `${review.type} · `}
                        {review.country && `${review.country} · `}
                        {review.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {review.averageScore?.toFixed(1) || "—"}
                  </div>
                </div>
                {review.headline && (
                  <p className="mt-2 text-sm font-medium text-slate-700">{review.headline}</p>
                )}
                {review.pros && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-emerald-700">
                    <ThumbsUp className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>{review.pros}</span>
                  </div>
                )}
                {review.cons && (
                  <div className="mt-1 flex items-start gap-2 text-xs text-rose-600">
                    <ThumbsDown className="mt-0.5 h-3 w-3 shrink-0" />
                    <span>{review.cons}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Important Info */}
      {hotel.hotelImportantInformation && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="mb-2 text-sm font-semibold text-amber-800">Important Information</h2>
          <p className="text-xs leading-relaxed text-amber-700">{hotel.hotelImportantInformation}</p>
        </section>
      )}
    </div>
  );
}
