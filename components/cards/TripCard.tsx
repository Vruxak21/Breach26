import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import type { Itinerary } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar";

interface TripCardProps {
  trip: Itinerary;
}

function getStatusBadgeStyles(status: Itinerary["status"]): string {
  if (status === "active") {
    return "bg-amber-50 text-amber-700 border border-amber-200";
  }
  if (status === "completed") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }
  return "bg-slate-50 text-slate-700 border border-slate-200";
}

function computeProgress(trip: Itinerary): number {
  const totalDays = trip.totalDays || trip.days.length;
  if (!totalDays) return 0;

  const today = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  if (today <= start) return 0;
  if (today >= end) return 100;

  const elapsedMs = today.getTime() - start.getTime();
  const totalMs = end.getTime() - start.getTime();
  return Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
}

function getInitials(name: string): string {
  const [first, second] = name.split(" ");
  if (!second) return first?.[0]?.toUpperCase() ?? "";
  return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
}

export function TripCard({ trip }: TripCardProps) {
  const collaborators = trip.collaborators.slice(0, 3);
  const remaining = trip.collaborators.length - collaborators.length;
  const progress = trip.status === "active" ? computeProgress(trip) : 0;

  return (
    <Link 
      href={`/itinerary/${trip.id}/view`}
      className="tm-card block flex w-72 shrink-0 cursor-pointer flex-col"
    >
      <div className="tm-card-image">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 280px, 288px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        <div className="absolute right-3 top-3">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium backdrop-blur",
              getStatusBadgeStyles(trip.status),
            )}
          >
            {trip.status === "active"
              ? "Upcoming"
              : trip.status === "completed"
              ? "Completed"
              : "Draft"}
          </span>
        </div>

        {trip.collaborators.length > 0 && (
          <div className="absolute bottom-3 right-3">
            <AvatarGroup className="gap-0.5">
              {collaborators.map((collaborator) => (
                <Avatar key={collaborator.id} size="sm">
                  {collaborator.avatar ? (
                    <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                  ) : (
                    <AvatarFallback>{getInitials(collaborator.name)}</AvatarFallback>
                  )}
                </Avatar>
              ))}
              {remaining > 0 && (
                <Avatar size="sm">
                  <AvatarFallback className="text-[10px]">
                    +{remaining}
                  </AvatarFallback>
                </Avatar>
              )}
            </AvatarGroup>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div>
          <h3 className="line-clamp-1 text-lg font-semibold text-[#111111]">
            {trip.destination}{" "}
            <span className="text-base font-normal text-[#6B7280]">
              · {trip.country}
            </span>
          </h3>
          <p className="mt-0.5 line-clamp-1 text-sm text-[#6B7280]">
            {trip.title}
          </p>
        </div>

        <div className="mt-3 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {formatDate(trip.startDate, "short")} –{" "}
              {formatDate(trip.endDate, "short")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {trip.travelers} traveler{trip.travelers > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {progress > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="tm-btn-outline mt-3 w-full px-3 py-2 text-center">
          View Trip
        </div>
      </div>
    </Link>
  );
}

