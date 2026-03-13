"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, CreditCard, Globe2, Plane } from "lucide-react";
import { sampleTrips } from "@/lib/placeholder-data";
import { formatCurrency } from "@/lib/utils";

const TABS = ["Upcoming", "Completed", "Shared with me", "Bookings"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const trips = sampleTrips;

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      <div className="px-6 pt-8 lg:px-12">
        <div className="rounded-3xl border border-[#E8E8E2] bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="flex items-center gap-6">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-2xl font-bold text-white shadow-md">
                AK
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-[#111111]">Aisha Khan</h1>
                <p className="mt-1 text-sm text-[#6B7280]">aisha.khan@example.com</p>
                <p className="mt-1 text-xs text-[#9CA3AF]">Member since Jan 2024</p>
                <div className="mt-5 flex flex-wrap gap-6">
                  <div>
                    <span className="text-xl font-bold text-[#111111]">12</span>
                    <p className="text-xs font-medium text-[#6B7280]">Trips</p>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-[#111111]">8</span>
                    <p className="text-xs font-medium text-[#6B7280]">Countries</p>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-[#111111]">INR 2.4L</span>
                    <p className="text-xs font-medium text-[#6B7280]">Spent</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="tm-btn-outline h-fit px-5 py-2.5">Edit Profile</button>
          </div>
        </div>
      </div>

      <div className="mt-8 border-b border-[#E8E8E2] px-6 lg:px-12">
        <div className="scrollbar-hide flex gap-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              data-active={activeTab === tab}
              className="tm-tab"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 px-6 lg:grid-cols-2 lg:px-12">
        {trips.map((trip) => (
          <Link
            key={trip.id}
            href={`/itinerary/${trip.id}/view`}
            className="tm-card group flex items-center justify-between gap-4 p-4"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                <Image src={trip.coverImage} alt={trip.title} fill className="object-cover" sizes="80px" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-[#111111] transition-colors group-hover:text-[#4F46E5]">
                  {trip.title}
                </h3>
                <p className="mt-0.5 truncate text-sm text-[#6B7280]">
                  {trip.startDate} - {trip.endDate}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {trip.collaborators.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[8px] font-bold text-slate-700"
                      >
                        {c.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-700">
                    {trip.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="font-bold text-[#111111]">{formatCurrency(trip.totalBudget, trip.currency)}</span>
              <span className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                View Trip <ArrowRight className="size-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 px-6 lg:px-12">
        <h2 className="font-display mb-6 text-3xl font-semibold text-[#111111]">Travel Statistics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="tm-card p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Plane className="size-5" />
            </div>
            <p className="mt-4 text-2xl font-bold text-[#111111]">12,450</p>
            <p className="mt-1 text-sm font-medium text-[#6B7280]">KM Traveled</p>
          </div>

          <div className="tm-card p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="size-5" />
            </div>
            <p className="mt-4 text-2xl font-bold text-[#111111]">5.2 Days</p>
            <p className="mt-1 text-sm font-medium text-[#6B7280]">Avg. Trip Length</p>
          </div>

          <div className="tm-card p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Globe2 className="size-5" />
            </div>
            <p className="mt-4 truncate text-xl font-bold text-[#111111]">Goa, India</p>
            <p className="mt-1 text-sm font-medium text-[#6B7280]">Most Visited</p>
          </div>

          <div className="tm-card p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <CreditCard className="size-5" />
            </div>
            <p className="mt-4 text-2xl font-bold text-[#111111]">INR 1.2L</p>
            <p className="mt-1 text-sm font-medium text-[#6B7280]">Total Spent</p>
          </div>
        </div>
      </div>
    </div>
  );
}
