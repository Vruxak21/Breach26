import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { goaActivities, goaHotels, popularDestinations } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
  const featuredHotels = goaHotels.slice(0, 3);
  const featuredActivities = goaActivities.slice(0, 3);
  const destinations = popularDestinations.slice(0, 4);

  return (
    <div className="bg-[#FAFAF8] text-[#111111]">
      <Navbar />

      <section className="relative min-h-[60vh] overflow-hidden md:min-h-[85vh]">
        <Image
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=80"
          alt="Cinematic mountain and lake destination"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/25 to-transparent" />

        <div className="tm-container relative z-10 flex min-h-[60vh] flex-col justify-center py-16 text-white md:min-h-[85vh]">
          <p className="tm-label text-white/80">WORLDWIDE CURATED EXPERIENCES</p>
          <h1 className="tm-hero-title mt-4 max-w-4xl text-white">
            The easiest way to plan your next unforgettable journey.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            Discover destinations, compare stays, and build a personalized itinerary with premium design and trusted recommendations.
          </p>
        </div>

        <div className="tm-container relative z-20 -mt-12 pb-8 md:-mt-16">
          <div className="tm-search-shell flex flex-col gap-2 p-2 md:flex-row md:items-center md:gap-0">
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 md:rounded-none md:border-r md:border-[#E8E8E2]">
              <MapPin className="h-4 w-4 text-[#6B7280]" />
              <div>
                <p className="tm-label text-[11px] text-[#6B7280]">Where</p>
                <p className="text-sm text-[#9CA3AF]">Search destinations</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 md:rounded-none md:border-r md:border-[#E8E8E2]">
              <CalendarDays className="h-4 w-4 text-[#6B7280]" />
              <div>
                <p className="tm-label text-[11px] text-[#6B7280]">Check-in</p>
                <p className="text-sm text-[#9CA3AF]">Add dates</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 md:rounded-none md:border-r md:border-[#E8E8E2]">
              <CalendarDays className="h-4 w-4 text-[#6B7280]" />
              <div>
                <p className="tm-label text-[11px] text-[#6B7280]">Check-out</p>
                <p className="text-sm text-[#9CA3AF]">Add dates</p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 md:rounded-none">
              <Users className="h-4 w-4 text-[#6B7280]" />
              <div>
                <p className="tm-label text-[11px] text-[#6B7280]">Travelers</p>
                <p className="text-sm text-[#9CA3AF]">2 guests</p>
              </div>
            </div>
            <button className="tm-btn-primary h-12 w-full gap-2 md:ml-2 md:w-auto md:px-6">
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="tm-container py-12 md:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="tm-label">TRENDING NOW</p>
            <h2 className="tm-h2 mt-2">Featured Destinations</h2>
          </div>
          <Link href="/search" className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]">
            Explore all
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {destinations.map((destination) => (
            <Link key={destination.name} href="/search" className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
              <Image
                src={destination.coverImage}
                alt={destination.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-display text-2xl font-bold text-white">{destination.name}</h3>
                <p className="text-sm text-white/75">{destination.country}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="tm-container pb-12 md:pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="tm-label">TOP STAYS</p>
            <h2 className="tm-h2 mt-2">Boutique Hotels You Will Love</h2>
          </div>
          <Link href="/search" className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]">
            View all stays
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredHotels.map((hotel) => (
            <article key={hotel.id} className="tm-card">
              <div className="tm-card-image">
                <Image src={hotel.images[0]} alt={hotel.name} fill className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold text-[#111111]">{hotel.name}</h3>
                <p className="mt-1 text-[13px] text-[#6B7280]">{hotel.city}, {hotel.country}</p>
                <p className="mt-3">
                  <span className="text-xl font-bold text-[#111111]">{formatCurrency(hotel.pricePerNight, hotel.currency)}</span>
                  <span className="ml-1 text-[13px] text-[#6B7280]">per night</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tm-container pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="tm-label">EXPERIENCES</p>
            <h2 className="tm-h2 mt-2">Curated Activities</h2>
          </div>
          <Link href="/planner" className="tm-btn-secondary py-2.5">
            Build itinerary
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredActivities.map((activity) => (
            <article key={activity.id} className="tm-card">
              <div className="tm-card-image">
                <Image src={activity.image} alt={activity.name} fill className="object-cover" />
              </div>
              <div className="p-4">
                <span className="tm-badge tm-badge-adventure">{activity.category}</span>
                <h3 className="mt-2 text-base font-semibold text-[#111111]">{activity.name}</h3>
                <p className="mt-1 text-[13px] text-[#6B7280]">{activity.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

