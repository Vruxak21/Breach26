import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import {
  BookOpen,
  CalendarRange,
  ChevronLeft,
  Clock3,
  Compass,
  Footprints,
  Landmark,
  Milestone,
  Mountain,
  ShieldCheck,
  Sparkles,
  Thermometer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActivityLocationModalCard } from "@/components/cards/ActivityLocationModalCard";

interface DestinationResponse {
  destination: {
    name: string;
    country: string;
    avgBudget: number;
    bestMonths: string;
    flightHoursFromIndia: number;
    coverImage: string;
  };
  location: {
    lat: number | null;
    lng: number | null;
    displayName: string;
  };
  cityInfo: {
    safetyScore?: number;
    costOfLiving?: number;
    qualityOfLife?: number;
    timezone?: string;
    language?: string;
  } | null;
  weatherPreview: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    condition: string;
  }>;
  snapshot: {
    activityCount: number;
    eventCount: number;
  };
  guide: {
    overview: string;
    history: string;
    culture: string;
    bestFor: string[];
    famousPlaces: string[];
    signatureExperiences: string[];
  };
  topActivities: Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    image: string;
    rating: number;
  }>;
  topEvents: Array<{
    id: string;
    name: string;
    date: string;
    category: string;
    venue: string;
  }>;
  budgetBreakdown?: {
    flight: number;
    stay: number;
    foodAndLocal: number;
    activities: number;
    events: number;
    total: number;
    currency: "INR";
    nights: number;
  };
}

function formatCompactDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = process.env.NEXT_PUBLIC_APP_URL ??
    (host ? `${protocol}://${host}` : "http://localhost:3000");

  const res = await fetch(`${origin}/api/destinations/${slug}`, {
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) {
    return (
      <div className="space-y-6 pb-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111111]">
          <ChevronLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <Card className="border-[#E8E8E2] bg-white">
          <CardHeader>
            <CardTitle className="font-display text-3xl">Destination unavailable</CardTitle>
            <CardDescription>We could not load this destination right now.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-[#F97316] text-white hover:bg-[#EA6C00]">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = (await res.json()) as DestinationResponse;

  const guide = {
    overview: data.guide?.overview ?? `${data.destination.name} is a popular destination with a mix of culture, leisure, and local experiences.`,
    history: data.guide?.history ?? `${data.destination.name} has a layered history visible in its architecture, neighborhoods, and landmarks.`,
    culture: data.guide?.culture ?? `Local cuisine, traditions, and seasonal events define the travel experience in ${data.destination.name}.`,
    bestFor: Array.isArray(data.guide?.bestFor) && data.guide.bestFor.length > 0
      ? data.guide.bestFor
      : ["Leisure", "Culture", "Food", "Photography"],
    famousPlaces: Array.isArray(data.guide?.famousPlaces) && data.guide.famousPlaces.length > 0
      ? data.guide.famousPlaces
      : [`${data.destination.name} Old Town`, `${data.destination.name} City Center`],
    signatureExperiences: Array.isArray(data.guide?.signatureExperiences) && data.guide.signatureExperiences.length > 0
      ? data.guide.signatureExperiences
      : [`Guided walk in ${data.destination.name}`, "Local food tasting"],
  };

  const weatherPreview = Array.isArray(data.weatherPreview) ? data.weatherPreview : [];
  const topActivities = Array.isArray(data.topActivities) ? data.topActivities : [];
  const topEvents = Array.isArray(data.topEvents) ? data.topEvents : [];
  const snapshot = data.snapshot ?? { activityCount: topActivities.length, eventCount: topEvents.length };
  const budgetBreakdown = data.budgetBreakdown ?? {
    flight: Math.round(data.destination.avgBudget * 0.32),
    stay: Math.round(data.destination.avgBudget * 0.33),
    foodAndLocal: Math.round(data.destination.avgBudget * 0.18),
    activities: Math.round(data.destination.avgBudget * 0.12),
    events: Math.round(data.destination.avgBudget * 0.05),
    total: data.destination.avgBudget,
    currency: "INR" as const,
    nights: 4,
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111111]">
          <ChevronLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <Button asChild className="bg-[#F97316] text-white hover:bg-[#EA6C00]">
          <Link href={`/planner?destination=${encodeURIComponent(data.destination.name)}`}>
            <Sparkles className="mr-2 h-4 w-4" />
            Plan this trip
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-[#E8E8E2] bg-white p-0">
        <div className="relative h-[320px] sm:h-[380px]">
          <Image
            src={data.destination.coverImage}
            alt={`${data.destination.name}, ${data.destination.country}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4 sm:bottom-8 sm:left-8 sm:right-8">
            <div>
              <Badge className="border-white/40 bg-white/20 text-white hover:bg-white/20">Destination Insight</Badge>
              <h1 className="font-display mt-3 text-4xl font-bold text-white sm:text-5xl">
                {data.destination.name}
              </h1>
              <p className="mt-1 text-sm text-white/85">{data.location.displayName}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="border-white/40 bg-white/20 text-white hover:bg-white/20">
                <CalendarRange className="mr-1 h-3.5 w-3.5" />
                Best months: {data.destination.bestMonths}
              </Badge>
              <Badge className="border-white/40 bg-white/20 text-white hover:bg-white/20">
                <Clock3 className="mr-1 h-3.5 w-3.5" />
                ~{data.destination.flightHoursFromIndia}h flight from India
              </Badge>
              <Badge className="border-white/40 bg-white/20 text-white hover:bg-white/20">
                Avg budget: INR {data.destination.avgBudget.toLocaleString("en-IN")}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#E8E8E2] bg-white">
          <CardHeader>
            <CardDescription>Safety score</CardDescription>
            <CardTitle className="font-display text-3xl">
              {data.cityInfo?.safetyScore ? data.cityInfo.safetyScore.toFixed(1) : "N/A"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-[#6B7280]">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Urban safety index
          </CardContent>
        </Card>

        <Card className="border-[#E8E8E2] bg-white">
          <CardHeader>
            <CardDescription>Quality of life</CardDescription>
            <CardTitle className="font-display text-3xl">
              {data.cityInfo?.qualityOfLife ? data.cityInfo.qualityOfLife.toFixed(1) : "N/A"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Landmark className="h-4 w-4 text-[#4F46E5]" />
            City comfort estimate
          </CardContent>
        </Card>

        <Card className="border-[#E8E8E2] bg-white">
          <CardHeader>
            <CardDescription>Live snapshot</CardDescription>
            <CardTitle className="font-display text-3xl">{snapshot.activityCount + snapshot.eventCount}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Compass className="h-4 w-4 text-[#F97316]" />
            Discoverable activities + events
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#E8E8E2] bg-white">
        <CardHeader>
          <CardTitle className="font-display text-3xl">Budget breakdown</CardTitle>
          <CardDescription>
            Estimated {budgetBreakdown.nights}-night trip cost composition for {data.destination.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Flights", value: budgetBreakdown.flight },
            { label: "Stay", value: budgetBreakdown.stay },
            { label: "Food & local", value: budgetBreakdown.foodAndLocal },
            { label: "Activities", value: budgetBreakdown.activities },
            { label: "Events", value: budgetBreakdown.events },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#E8E8E2] bg-[#FAFAF8] px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.12em] text-[#9CA3AF]">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-[#111111]">
                INR {item.value.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
          <div className="rounded-xl border border-[#F97316]/30 bg-[#FFF7ED] px-4 py-3 sm:col-span-2 lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.12em] text-[#C2410C]">Total estimated budget</p>
            <p className="font-display mt-1 text-2xl text-[#111111]">
              INR {budgetBreakdown.total.toLocaleString("en-IN")}
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-[#111111]">5-day weather preview</h2>
          <p className="text-sm text-[#6B7280]">Helpful for picking the right dates and daily activity intensity.</p>
        </div>

        {weatherPreview.length === 0 ? (
          <Card className="border-dashed border-[#D4D4CC] bg-white/70">
            <CardContent className="py-8 text-center text-sm text-[#6B7280]">
              Weather data is not available right now.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {weatherPreview.map((day) => (
              <Card key={day.date} className="border-[#E8E8E2] bg-white">
                <CardHeader>
                  <CardDescription>{formatCompactDate(day.date)}</CardDescription>
                  <CardTitle className="font-display text-2xl">{day.tempMax}°</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-[#6B7280]">
                  <p className="inline-flex items-center gap-1">
                    <Thermometer className="h-3.5 w-3.5" />
                    Low {day.tempMin}°
                  </p>
                  <p>{day.condition}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-[#E8E8E2] bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-3xl">About {data.destination.name}</CardTitle>
            <CardDescription>Essential context before planning your itinerary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111]">
                <Compass className="h-4 w-4 text-[#4F46E5]" />
                Overview
              </p>
              <p className="text-sm leading-6 text-[#374151]">{guide.overview}</p>
            </div>

            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111]">
                <Milestone className="h-4 w-4 text-[#4F46E5]" />
                History
              </p>
              <p className="text-sm leading-6 text-[#374151]">{guide.history}</p>
            </div>

            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111]">
                <BookOpen className="h-4 w-4 text-[#4F46E5]" />
                Culture and local vibe
              </p>
              <p className="text-sm leading-6 text-[#374151]">{guide.culture}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E8E8E2] bg-white">
          <CardHeader>
            <CardTitle className="font-display text-3xl">Best for</CardTitle>
            <CardDescription>Travel styles that fit this destination.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {guide.bestFor.map((item) => (
              <Badge
                key={item}
                className="border-[#E8E8E2] bg-[#F7F7F4] px-3 py-1 text-[#374151] hover:bg-[#F7F7F4]"
              >
                {item}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-[#E8E8E2] bg-white">
          <CardHeader>
            <CardTitle className="font-display text-3xl">Famous places</CardTitle>
            <CardDescription>Iconic spots travelers usually prioritize.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {guide.famousPlaces.map((place, index) => (
              <div
                key={place}
                className="flex items-center justify-between rounded-xl border border-[#E8E8E2] bg-[#FAFAF8] px-3 py-2"
              >
                <p className="text-sm text-[#111111]">{place}</p>
                <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#E8E8E2] bg-white">
          <CardHeader>
            <CardTitle className="font-display text-3xl">Signature experiences</CardTitle>
            <CardDescription>High-value activities to include in your itinerary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {guide.signatureExperiences.map((experience) => (
              <div
                key={experience}
                className="flex items-center gap-2 rounded-xl border border-[#E8E8E2] bg-[#FAFAF8] px-3 py-2"
              >
                <Footprints className="h-4 w-4 text-[#F97316]" />
                <p className="text-sm text-[#111111]">{experience}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-[#111111]">Tourism activities</h2>
          <p className="text-sm text-[#6B7280]">Popular things to do now in and around {data.destination.name}.</p>
        </div>

        {topActivities.length === 0 ? (
          <Card className="border-dashed border-[#D4D4CC] bg-white/70">
            <CardContent className="py-8 text-center text-sm text-[#6B7280]">
              Activity feed is currently unavailable.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {topActivities.map((activity) => (
              <ActivityLocationModalCard
                key={activity.id}
                activity={activity}
                destinationName={data.destination.name}
                destinationCountry={data.destination.country}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-[#111111]">Upcoming events</h2>
          <p className="text-sm text-[#6B7280]">Seasonal events you can align with your travel dates.</p>
        </div>

        {topEvents.length === 0 ? (
          <Card className="border-dashed border-[#D4D4CC] bg-white/70">
            <CardContent className="py-8 text-center text-sm text-[#6B7280]">
              No event feed available at the moment.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {topEvents.map((event) => (
              <Card key={event.id} className="border-[#E8E8E2] bg-white">
                <CardContent className="space-y-2 py-4">
                  <p className="line-clamp-1 text-sm font-semibold text-[#111111]">{event.name}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{event.category}</Badge>
                    <span className="text-xs text-[#6B7280]">{formatCompactDate(event.date)}</span>
                  </div>
                  <p className="line-clamp-2 text-xs text-[#6B7280]">{event.venue || "Venue details unavailable"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card className="border-[#E8E8E2] bg-[linear-gradient(120deg,#ffffff_0%,#faf7f2_100%)]">
        <CardContent className="flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-2xl font-semibold text-[#111111]">
              Build your {data.destination.name} itinerary
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">
              Turn this destination guide into a day-by-day travel plan with budget and route suggestions.
            </p>
          </div>
          <Button asChild className="bg-[#F97316] text-white hover:bg-[#EA6C00]">
            <Link href={`/planner?destination=${encodeURIComponent(data.destination.name)}`}>
              <Mountain className="mr-2 h-4 w-4" />
              Start Planning
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
