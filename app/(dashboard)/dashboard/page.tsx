import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { TripCard } from "@/components/cards/TripCard";
import { popularDestinations, sampleTrips } from "@/lib/placeholder-data";

export default function DashboardPage() {
  const recentTrips = sampleTrips.slice(0, 3);
  const destinations = popularDestinations.slice(0, 6);

  return (
    <div className="pb-12">
      {/* Hero section */}
      <section className="mt-4 h-[280px] rounded-3xl bg-slate-900 text-white shadow-sm sm:h-[360px]">
        <div className="relative h-full w-full overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&q=90"
            alt="Ocean waves and sunset"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1120px"
          />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

          <div className="absolute inset-y-0 left-0 flex items-center px-6 sm:px-10">
            <div className="max-w-xl space-y-4">
              <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 backdrop-blur">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Smart AI travel planning
              </div>
              <div>
                <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                  Where to next?
                </h1>
                <p className="mt-2 max-w-md text-sm text-slate-100/80 sm:text-base">
                  Describe your dream trip and let AI plan everything — hotels,
                  activities, events, and routes.
                </p>
              </div>

              {/* Search bar */}
              <div className="mt-4 max-w-xl rounded-2xl bg-white/10 p-1.5 backdrop-blur">
                <div className="flex items-center gap-2">
                  <input
                    placeholder="Try “5 days in Bali from Mumbai in June, under ₹1L”"
                    className="flex-1 rounded-xl bg-transparent px-4 py-2.5 text-sm text-slate-50 placeholder:text-slate-200/70 outline-none"
                  />
                  <button type="button" className="tm-btn-primary gap-2 px-4 py-2.5 sm:px-6 sm:text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>Plan with AI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="tm-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <span className="text-base font-semibold">12</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">12</p>
              <p className="text-sm text-slate-500">Trips planned</p>
            </div>
          </div>
        </div>
        <div className="tm-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <span className="text-base font-semibold">8</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">8</p>
              <p className="text-sm text-slate-500">Countries explored</p>
            </div>
          </div>
        </div>
        <div className="tm-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <span className="text-base font-semibold">₹</span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">₹2.4L</p>
              <p className="text-sm text-slate-500">Estimated saved vs rack rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent trips */}
      <section className="mt-12">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-3xl font-semibold text-[#111111]">
            Recent trips
          </h2>
          <Link href="/planner" className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]">
            View all
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {recentTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>

      {/* Popular destinations */}
      <section className="mt-12">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-3xl font-semibold text-[#111111]">
            Popular destinations
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {destinations.map((destination) => (
            <button
              key={destination.name}
              type="button"
              className="group relative h-60 overflow-hidden rounded-2xl text-left shadow-sm transition-transform duration-300 hover:scale-[1.02]"
            >
              <Image
                src={destination.coverImage}
                alt={destination.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 260px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-display text-2xl font-bold text-white">
                  {destination.name}
                </p>
                <p className="text-xs text-slate-100/80">
                  {destination.country}
                </p>
                <div className="mt-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="inline-flex items-center rounded-full bg-white/30 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
                    Explore
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

