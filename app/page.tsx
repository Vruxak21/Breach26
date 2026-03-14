import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Search,
  Users,
  Star,
  Sparkles,
  Globe,
  Shield,
  Zap,
  Plane,
  ArrowRight,
} from "lucide-react";
import { goaActivities, goaHotels, popularDestinations } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";

const categoryBadgeStyle: Record<string, { bg: string; color: string }> = {
  beach:     { bg: "#EFF6FF", color: "#1D4ED8" },
  food:      { bg: "#FFF7ED", color: "#C2410C" },
  adventure: { bg: "#FFF1F2", color: "#BE123C" },
  culture:   { bg: "#FAF5FF", color: "#6D28D9" },
  nature:    { bg: "#F0FDF4", color: "#15803D" },
  wellness:  { bg: "#F0FDFA", color: "#0F766E" },
};

function getCategoryStyle(category: string) {
  const key = category.toLowerCase();
  return categoryBadgeStyle[key] || { bg: "#F5F5F0", color: "#6B6B65" };
}

export default function Home() {
  const featuredHotels = goaHotels.slice(0, 3);
  const featuredActivities = goaActivities.slice(0, 3);
  const destinations = popularDestinations.slice(0, 4);

  return (
    <div style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* ── Inline Header ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 flex h-16 items-center justify-between px-6 lg:px-10"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-50)", color: "var(--accent-500)" }}
          >
            <Plane className="h-4 w-4" />
          </span>
          <span
            className="text-[22px] font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display), 'Playfair Display', serif", color: "var(--text-primary)" }}
          >
            TravelMind
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/signin" className="text-[14px] font-medium" style={{ color: "var(--text-secondary)" }}>
            Sign In
          </Link>
          <Link href="/signup" className="tm-btn-primary py-2 px-4 text-[14px]">
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: "92vh" }}>
        <Image
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=85"
          alt="Cinematic mountain and lake destination"
          fill
          priority
          className="object-cover"
        />
        {/* Dark gradient — bottom heavy, editorial */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.28) 60%, transparent 100%)"
        }} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)"
        }} />

        {/* Hero Content */}
        <div className="tm-container relative z-10 flex flex-col justify-center text-white" style={{ minHeight: "92vh", paddingTop: "80px", paddingBottom: "180px" }}>
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 w-fit"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent-400)" }} />
            <span className="text-[12px] font-semibold tracking-[0.08em] uppercase">
              Worldwide Curated Experiences
            </span>
          </div>

          <h1 className="tm-hero-title text-white max-w-3xl">
            The easiest way to plan your next unforgettable journey.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.82)" }}>
            Discover destinations, compare stays, and build a personalized itinerary — powered by AI, refined by great design.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/planner" className="tm-btn-primary gap-2">
              <Sparkles className="h-4 w-4" />
              Plan with AI
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-[11px] text-[15px] font-semibold text-white transition-all"
              style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <Search className="h-4 w-4" />
              Explore Destinations
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-6">
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1494790108755-2616b612b22c?w=80&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt="Traveler"
                  className="h-8 w-8 rounded-full object-cover ring-2"
                  style={{ "--tw-ring-color": "rgba(255,255,255,0.6)" } as React.CSSProperties}
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                <span className="ml-1 text-[13px] font-semibold">4.9</span>
              </div>
              <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                Loved by 50,000+ travelers in 40 countries
              </p>
            </div>
          </div>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-10">
          <div className="tm-container">
            <div className="tm-search-shell flex flex-col gap-0 overflow-hidden md:flex-row md:items-center">
              <div className="flex flex-1 items-center gap-3 px-5 py-4 md:border-r" style={{ borderColor: "var(--border-default)" }}>
                <MapPin className="h-4 w-4 shrink-0" style={{ color: "var(--accent-500)" }} />
                <div>
                  <p className="tm-label">Where</p>
                  <p className="text-[14px] mt-0.5" style={{ color: "var(--text-subtle)" }}>Search destinations</p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-3 px-5 py-4 md:border-r" style={{ borderColor: "var(--border-default)" }}>
                <CalendarDays className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                <div>
                  <p className="tm-label">Check-in</p>
                  <p className="text-[14px] mt-0.5" style={{ color: "var(--text-subtle)" }}>Add dates</p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-3 px-5 py-4 md:border-r" style={{ borderColor: "var(--border-default)" }}>
                <CalendarDays className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                <div>
                  <p className="tm-label">Check-out</p>
                  <p className="text-[14px] mt-0.5" style={{ color: "var(--text-subtle)" }}>Add dates</p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-3 px-5 py-4">
                <Users className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                <div>
                  <p className="tm-label">Travelers</p>
                  <p className="text-[14px] mt-0.5" style={{ color: "var(--text-subtle)" }}>2 guests</p>
                </div>
              </div>
              <div className="px-3 py-3">
                <Link href="/search" className="tm-btn-primary gap-2 w-full md:w-auto">
                  <Search className="h-4 w-4" />
                  Search
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Strip ─────────────────────────────────────── */}
      <section style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="tm-container py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[
              { icon: Sparkles, label: "AI-Powered Itineraries" },
              { icon: Shield, label: "Trusted by 50K+ Travelers" },
              { icon: Globe, label: "140+ Countries Covered" },
              { icon: Zap, label: "Plans in Under 2 Minutes" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" style={{ color: "var(--accent-500)" }} />
                <span className="text-[13px] font-500" style={{ color: "var(--text-secondary)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Destinations ─────────────────────────────── */}
      <section className="tm-container" style={{ paddingTop: "80px", paddingBottom: "24px" }}>
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="tm-label">Trending Now</p>
            <h2 className="tm-h2 mt-2">Featured Destinations</h2>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold transition-colors"
            style={{ color: "var(--primary-600)" }}
          >
            Explore all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {destinations.map((destination) => (
            <Link
              key={destination.name}
              href="/search"
              className="group relative overflow-hidden rounded-xl"
              style={{ aspectRatio: "3/4" }}
            >
              <Image
                src={destination.coverImage}
                alt={destination.name}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }}
              />
              {/* Hot badge */}
              <span
                className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-700 uppercase tracking-wide text-white"
                style={{ background: "var(--accent-500)" }}
              >
                Hot
              </span>
              <div className="absolute bottom-4 left-4 right-4">
                <h3
                  className="text-[22px] font-700 text-white leading-tight"
                  style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
                >
                  {destination.name}
                </h3>
                <p className="text-[13px] mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {destination.country}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Hotels ──────────────────────────────────────────── */}
      <section className="tm-container" style={{ paddingTop: "64px", paddingBottom: "24px" }}>
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="tm-label">Top Stays</p>
            <h2 className="tm-h2 mt-2">Boutique Hotels You Will Love</h2>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold transition-colors"
            style={{ color: "var(--primary-600)" }}
          >
            View all stays
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredHotels.map((hotel) => (
            <article key={hotel.id} className="tm-card cursor-pointer">
              <div className="tm-card-image">
                <Image src={hotel.images[0]} alt={hotel.name} fill className="object-cover" />
                {/* Rating badge on image */}
                <div
                  className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg px-2.5 py-1.5"
                  style={{ background: "rgba(255,255,255,0.95)", boxShadow: "var(--shadow-sm)" }}
                >
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-[12px] font-600" style={{ color: "var(--text-primary)" }}>
                    {hotel.rating ?? "4.8"}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      className="text-[16px] font-600 leading-snug"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {hotel.name}
                    </h3>
                    <p className="flex items-center gap-1 mt-1 text-[13px]" style={{ color: "var(--text-muted)" }}>
                      <MapPin className="h-3 w-3" />
                      {hotel.city}, {hotel.country}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span
                      className="text-[20px] font-700"
                      style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}
                    >
                      {formatCurrency(hotel.pricePerNight, hotel.currency)}
                    </span>
                    <span className="ml-1.5 text-[13px]" style={{ color: "var(--text-muted)" }}>per night</span>
                  </div>
                  <Link
                    href="/search"
                    className="text-[13px] font-semibold"
                    style={{ color: "var(--primary-600)" }}
                  >
                    View →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Activities ──────────────────────────────────────── */}
      <section className="tm-container" style={{ paddingTop: "64px", paddingBottom: "80px" }}>
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="tm-label">Experiences</p>
            <h2 className="tm-h2 mt-2">Curated Activities</h2>
          </div>
          <Link href="/planner" className="tm-btn-primary py-2.5 px-5 text-[14px]">
            Build Itinerary
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredActivities.map((activity) => {
            const catStyle = getCategoryStyle(activity.category);
            return (
              <article key={activity.id} className="tm-card cursor-pointer">
                <div className="tm-card-image">
                  <Image src={activity.image} alt={activity.name} fill className="object-cover" />
                  {/* Category badge */}
                  <span
                    className="absolute top-3 left-3 rounded-md px-2.5 py-1 text-[11px] font-700 uppercase tracking-wide"
                    style={{ background: catStyle.bg, color: catStyle.color }}
                  >
                    {activity.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3
                    className="text-[16px] font-600 leading-snug"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {activity.name}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {activity.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── AI CTA Banner ────────────────────────────────────── */}
      <section style={{ background: "var(--bg-subtle)", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="tm-container py-20 flex flex-col items-center text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-[12px] font-700 uppercase tracking-wider"
            style={{ background: "var(--accent-50)", color: "var(--accent-700)", border: "1px solid var(--accent-200)" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Trip Planning
          </span>
          <h2 className="tm-h2 max-w-2xl">
            Describe your dream trip. We'll handle the rest.
          </h2>
          <p className="mt-4 max-w-lg tm-body-lg">
            Tell our AI where you want to go, when, and with whom — and get a fully personalized day-by-day itinerary in under 2 minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/planner" className="tm-btn-primary gap-2 text-[16px] py-3.5 px-8">
              <Sparkles className="h-5 w-5" />
              Generate My Itinerary
            </Link>
            <Link href="/signin" className="tm-btn-secondary gap-2 text-[16px] py-3.5 px-8">
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{ background: "var(--bg-base)", borderTop: "1px solid var(--border-light)" }}>
        <div className="tm-container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "var(--accent-50)", color: "var(--accent-500)" }}
            >
              <Search className="h-3.5 w-3.5" />
            </span>
            <span
              className="text-[18px] font-700"
              style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
            >
              TravelMind
            </span>
          </div>
          <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            © 2026 TravelMind. Plan smarter. Travel better.
          </p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Help"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-[13px] transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
