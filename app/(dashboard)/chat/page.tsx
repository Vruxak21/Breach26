"use client";

import { useState, useEffect } from "react";
import { Loader2, Plane, Clock, Users, BarChart3, MessageCircle } from "lucide-react";
import Link from "next/link";
import { VotingPanel } from "@/components/chat/VotingPanel";
import { GroupChat } from "@/components/chat/GroupChat";

export default function ChatPage() {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/itinerary/user")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItineraries(data);
          // Auto-select first trip
          if (data.length > 0) {
            setSelectedTripId(data[0].id);
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load itineraries", err);
        setIsLoading(false);
      });
  }, []);

  const selectedTrip = itineraries.find((t) => t.id === selectedTripId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (itineraries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Plane className="h-8 w-8" />
        </div>
        <h3 className="mt-6 font-display text-xl font-semibold text-slate-900">No Trips Yet</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Create a trip or get invited to one to start voting and chatting with your travel group.
        </p>
        <Link href="/planner" className="tm-btn-primary mt-6 px-6 py-2.5">
          Plan a Trip
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      {/* Trip Selector */}
      <div className="mb-4 flex items-center gap-3 overflow-x-auto pb-1">
        {itineraries.map((trip) => (
          <button
            key={trip.id}
            onClick={() => setSelectedTripId(trip.id)}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              selectedTripId === trip.id
                ? "border-indigo-300 bg-indigo-50 text-indigo-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <img
              src={trip.coverImage || "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=100&q=60"}
              alt={trip.title}
              className="h-8 w-8 rounded-lg object-cover"
            />
            <div className="text-left">
              <div className="max-w-[10rem] truncate text-xs font-semibold">{trip.title}</div>
              <div className="text-[10px] text-slate-400">{trip.destination}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Split Layout: Voting (Left) + Chat (Right) */}
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Left Panel — Voting */}
        <div className="flex w-1/2 flex-col border-r border-slate-200 overflow-hidden">
          <VotingPanel itineraryId={selectedTripId} />
        </div>

        {/* Right Panel — Chat */}
        <div className="flex w-1/2 flex-col overflow-hidden">
          <GroupChat
            itineraryId={selectedTripId as string}
            isOpen={!!selectedTripId}
            onClose={() => {}}
            inline={true}
          />
        </div>
      </div>
    </div>
  );
}
