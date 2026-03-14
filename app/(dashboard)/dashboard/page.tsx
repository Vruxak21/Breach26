"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  Globe2,
  MapPin,
  Plane,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { popularDestinations } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface UserItinerary {
  id: string;
  title: string;
  destination: string;
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalBudget: number;
  currency: string;
  travelers: number;
  status: "draft" | "active" | "completed";
}

const quickPrompts = [
  "3 days in Udaipur",
  "Goa beach and food trip",
  "7 days in Japan",
  "Paris + Rome honeymoon",
] as const;

const destinationSlug = (name: string, country: string) =>
  `${name}-${country}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

function TripStatusBadge({ status }: { status: UserItinerary["status"] }) {
  if (status === "active") {
    return (
      <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        Active
      </Badge>
    );
  }

  if (status === "completed") {
    return (
      <Badge className="border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100">
        Completed
      </Badge>
    );
  }

  return (
    <Badge className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
      Draft
    </Badge>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [trips, setTrips] = useState<UserItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/itinerary/user")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!isMounted) return;
        setTrips(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setTrips([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const active = trips.filter((trip) => trip.status === "active").length;
    const countries = new Set(trips.map((trip) => trip.country)).size;
    const travelers = trips.reduce((acc, trip) => acc + trip.travelers, 0);
    const budget = trips.reduce((acc, trip) => acc + trip.totalBudget, 0);

    return {
      totalTrips: trips.length,
      activeTrips: active,
      countries,
      totalTravelers: travelers,
      totalBudget: budget,
    };
  }, [trips]);

  const userName = session?.user?.name?.split(" ")[0] || "Traveler";

  const handlePlan = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/planner");
      return;
    }
    router.push(`/planner?destination=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="space-y-8 pb-10">
      <Card className="overflow-hidden border-[#E8E8E2] bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-xl bg-[radial-gradient(1200px_500px_at_80%_-20%,#FFE9D6,transparent),radial-gradient(900px_450px_at_-20%_100%,#EEF2FF,transparent)] px-6 py-8 sm:px-10 sm:py-10">
            <div className="absolute right-4 top-4 hidden rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs text-[#6B7280] backdrop-blur-sm sm:block">
              Enterprise Travel Planner
            </div>

            <div className="max-w-3xl space-y-4">
              <Badge variant="outline" className="border-[#D4D4CC] bg-white/70 text-[#6B7280]">
                Personalized AI Itineraries
              </Badge>

              <div>
                <h1 className="font-display text-4xl font-bold leading-tight text-[#111111] sm:text-5xl">
                  Good morning, {userName}
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#6B7280] sm:text-base">
                  Plan premium trips with collaboration-ready itineraries, intelligent suggestions, and real-time budget visibility.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Try: 5 days in Bali with beaches and cafes"
                  className="h-11 border-[#E8E8E2] bg-white"
                />
                <Button className="h-11 bg-[#F97316] text-white hover:bg-[#EA6C00]" onClick={() => handlePlan(search)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Plan with AI
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {quickPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="border-[#E8E8E2] bg-white/80 text-[#374151] hover:bg-white"
                    onClick={() => handlePlan(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Card className="border-[#E8E8E2] bg-white">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.06em]">Trips</CardDescription>
            <CardTitle className="font-display text-3xl">{stats.totalTrips}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Compass className="h-4 w-4 text-[#4F46E5]" />
            Total itineraries
          </CardContent>
        </Card>

        <Card className="border-[#E8E8E2] bg-white">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.06em]">Active</CardDescription>
            <CardTitle className="font-display text-3xl">{stats.activeTrips}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Plane className="h-4 w-4 text-[#0D9488]" />
            Ongoing journeys
          </CardContent>
        </Card>

        <Card className="border-[#E8E8E2] bg-white">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.06em]">Countries</CardDescription>
            <CardTitle className="font-display text-3xl">{stats.countries}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Globe2 className="h-4 w-4 text-[#4F46E5]" />
            Unique destinations
          </CardContent>
        </Card>

        <Card className="border-[#E8E8E2] bg-white">
          <CardHeader>
            <CardDescription className="text-xs uppercase tracking-[0.06em]">Budget</CardDescription>
            <CardTitle className="font-display text-3xl">
              {formatCurrency(stats.totalBudget, "INR")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-[#6B7280]">
            <TrendingUp className="h-4 w-4 text-[#F97316]" />
            Total planned spend
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-[#111111]">Recent Itineraries</h2>
            <p className="text-sm text-[#6B7280]">Continue where you left off.</p>
          </div>
          <Button asChild variant="outline" className="border-[#E8E8E2] bg-white hover:bg-[#F7F7F4]">
            <Link href="/planner">
              New Trip
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Separator className="bg-[#E8E8E2]" />

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="border-[#E8E8E2] bg-white p-0">
                <Skeleton className="h-40 w-full rounded-b-none rounded-t-xl" />
                <CardContent className="space-y-2 py-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <Card className="border-dashed border-[#D4D4CC] bg-white/70 py-8">
            <CardContent className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-[#EEF2FF] p-3 text-[#4F46E5]">
                <Plane className="h-5 w-5" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-[#111111]">No trips yet</h3>
              <p className="mt-2 max-w-md text-sm text-[#6B7280]">
                Start your first plan and build a detailed itinerary with hotels, activities, and collaborative budgeting.
              </p>
              <Button className="mt-5 bg-[#F97316] text-white hover:bg-[#EA6C00]" asChild>
                <Link href="/planner">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create First Trip
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <Card key={trip.id} className="group overflow-hidden border-[#E8E8E2] bg-white p-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <Link href={`/itinerary/${trip.id}/view`}>
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={trip.coverImage}
                      alt={trip.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute right-3 top-3">
                      <TripStatusBadge status={trip.status} />
                    </div>
                  </div>

                  <CardContent className="space-y-3 py-4">
                    <div>
                      <h3 className="line-clamp-1 text-base font-semibold text-[#111111]">{trip.title}</h3>
                      <p className="mt-1 flex items-center gap-1 text-sm text-[#6B7280]">
                        <MapPin className="h-3.5 w-3.5" />
                        {trip.destination}, {trip.country}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#6B7280]">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {trip.totalDays} days
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {trip.travelers} travelers
                      </span>
                      <span className="font-semibold text-[#111111]">{formatCurrency(trip.totalBudget, trip.currency)}</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-[#111111]">Trending Destinations</h2>
            <p className="text-sm text-[#6B7280]">Instantly start a plan from curated global picks.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {popularDestinations.slice(0, 4).map((destination) => (
            <Link
              key={destination.name}
              href={`/destination/${destinationSlug(destination.name, destination.country)}`}
              className="group relative overflow-hidden rounded-xl border border-[#E8E8E2] bg-white text-left"
            >
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={destination.coverImage}
                  alt={destination.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-display text-xl font-bold text-white">{destination.name}</p>
                  <p className="text-xs text-white/80">{destination.country}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
