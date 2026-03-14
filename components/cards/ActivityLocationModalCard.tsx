"use client";

import Image from "next/image";
import { ExternalLink, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ActivityLocationModalCardProps {
  activity: {
    id: string;
    name: string;
    category: string;
    description: string;
    image: string;
    rating: number;
  };
  destinationName: string;
  destinationCountry: string;
}

export function ActivityLocationModalCard({
  activity,
  destinationName,
  destinationCountry,
}: ActivityLocationModalCardProps) {
  const locationQuery = `${activity.name}, ${destinationName}, ${destinationCountry}`;
  const encodedQuery = encodeURIComponent(locationQuery);
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodedQuery}&output=embed`;
  const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group h-full text-left outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
        >
          <Card className="h-full overflow-hidden border-[#E8E8E2] bg-white p-0 transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
            <div className="relative h-36 overflow-hidden">
              <Image
                src={activity.image}
                alt={activity.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            </div>

            <CardContent className="space-y-2 py-4">
              <p className="line-clamp-1 text-sm font-semibold text-[#111111]">{activity.name}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">{activity.category}</Badge>
                <span className="inline-flex items-center gap-1 text-xs text-[#6B7280]">
                  <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  {Number(activity.rating || 0).toFixed(1)}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-[#6B7280]">
                {activity.description || "Local recommended activity."}
              </p>
              <p className="inline-flex items-center gap-1 text-xs text-[#9CA3AF]">
                <MapPin className="h-3.5 w-3.5" />
                Tap to view map and details
              </p>
            </CardContent>
          </Card>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-[#E8E8E2] bg-[#FCFCFA] p-0 sm:max-w-4xl" showCloseButton>
        <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
          <div className="relative min-h-64 md:min-h-full">
            <iframe
              title={`Map for ${activity.name}`}
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-64 w-full border-0 md:h-full"
            />
          </div>

          <div className="space-y-5 p-6">
            <DialogHeader className="space-y-2">
              <Badge className="w-fit border-[#F97316]/30 bg-[#FFF4EC] text-[#C2410C] hover:bg-[#FFF4EC]">
                {activity.category}
              </Badge>
              <DialogTitle className="font-display text-2xl leading-tight text-[#111111]">
                {activity.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-[#6B7280]">
                {destinationName}, {destinationCountry}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-2xl border border-[#ECECE6] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#9CA3AF]">Overview</p>
              <p className="mt-2 text-sm leading-6 text-[#374151]">
                {activity.description || "An excellent local activity worth adding to your itinerary."}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-[#ECECE6] bg-white px-4 py-3">
              <p className="text-sm text-[#6B7280]">Traveler rating</p>
              <p className="inline-flex items-center gap-1 text-sm font-medium text-[#111111]">
                <Star className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
                {Number(activity.rating || 0).toFixed(1)} / 5.0
              </p>
            </div>

            <a
              href={mapOpenUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#E8E8E2] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition hover:border-[#F97316]/50 hover:text-[#C2410C]"
            >
              Open in Google Maps
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
