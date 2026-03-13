"use client";

import { UserPlus, Share2, Download, MapPin, Receipt, Clock, Users, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { sampleTrips } from "@/lib/placeholder-data";
import { Timeline } from "@/components/itinerary/Timeline";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ViewItineraryPage() {
  const trip = sampleTrips[0];
  const spent = trip.days.reduce((acc, day) => acc + day.totalCost, 0);

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      {/* HERO */}
      <div className="relative h-64 overflow-hidden rounded-b-3xl">
        <Image 
          src={trip.coverImage}
          alt={trip.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
        
        <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
          <div className="text-white">
            <h1 className="font-display text-4xl font-bold">{trip.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-200">
              <MapPin className="size-4" />
              {trip.destination}, {trip.country}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            <Link href={`/collaboration/${trip.id}`} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 border border-white/20">
              <UserPlus className="size-4" />
              Collaborate
            </Link>
            <Link href={`/itinerary/${trip.id}/build`} className="tm-btn-primary flex items-center gap-2 px-4 py-2">
              <Calendar className="size-4" />
              Edit Itinerary
            </Link>
            <button className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 border border-white/20">
              <Share2 className="size-4" />
              Share
            </button>
            <button className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 border border-white/20">
              <Download className="size-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-6 px-6 lg:grid-cols-5 lg:px-12">
        
        {/* LEFT COLUMN: Timeline */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-[#E8E8E2] bg-white p-6 shadow-sm">
             <Timeline days={trip.days} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Map Card */}
          <div className="overflow-hidden rounded-2xl border border-[#E8E8E2] bg-white shadow-sm">
            <div className="relative h-72 w-full bg-slate-50 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <MapPin className="mb-2 size-8 text-indigo-500" />
                <p className="font-medium text-slate-700">Interactive Map</p>
                <p className="mt-1 text-xs text-slate-400">Map loads in Phase 9</p>
              </div>
              
              {/* Fake pins */}
              <div className="absolute left-[30%] top-[40%] flex flex-col items-center">
                <div className="size-3 rounded-full bg-amber-500 shadow-md ring-4 ring-white" />
              </div>
              <div className="absolute right-[40%] top-[60%] flex flex-col items-center">
                <div className="size-3 rounded-full bg-indigo-500 shadow-md ring-4 ring-white" />
              </div>
            </div>
          </div>

          {/* Expense Summary */}
          <div className="rounded-2xl border border-[#E8E8E2] bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Receipt className="size-5 text-slate-500" />
              Expense Summary
            </h3>
            
            <div className="mt-6 space-y-4">
              {trip.days.map(day => (
                <div key={day.dayNumber} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                  <span className="text-slate-600">Day {day.dayNumber}</span>
                  <span className="font-medium text-slate-900">{formatCurrency(day.totalCost, trip.currency)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <p className="text-sm font-medium text-slate-500">Total Trip Cost</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-900">
                  {formatCurrency(spent, trip.currency)}
                </p>
                <p className="text-sm text-slate-500">≈ $361 USD</p>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 shadow-sm">
                  <Users className="size-4" />
                  Split {formatCurrency(spent, trip.currency)} among {trip.travelers} travelers
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white border-slate-200 p-6">
                <DialogHeader>
                  <DialogTitle className="text-slate-900">Split Expenses</DialogTitle>
                </DialogHeader>
                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-500">Each person owes</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">{formatCurrency(spent / trip.travelers, trip.currency)}</p>
                </div>
                <div className="mt-6 space-y-3">
                  {trip.collaborators.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                       <div className="flex items-center gap-3">
                         <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                           {c.name.charAt(0)}
                         </div>
                         <span className="font-medium text-sm text-slate-900">{c.name}</span>
                       </div>
                       <button className="text-xs bg-slate-100 text-slate-700 py-1.5 px-3 rounded-lg hover:bg-slate-200 transition">
                         Copy Link
                       </button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Trip Info Card */}
          <div className="rounded-2xl border border-[#E8E8E2] bg-white p-6 shadow-sm">
             <h3 className="font-semibold text-slate-900 mb-4">Trip Details</h3>
             <ul className="space-y-3 text-sm">
               <li className="flex justify-between">
                 <span className="text-slate-500 flex items-center gap-2"><Calendar className="size-4"/> Dates</span>
                 <span className="font-medium text-slate-900">Jan 16 - 20, 2026</span>
               </li>
               <li className="flex justify-between">
                 <span className="text-slate-500 flex items-center gap-2"><Clock className="size-4"/> Duration</span>
                 <span className="font-medium text-slate-900">{trip.totalDays} Days</span>
               </li>
               <li className="flex justify-between">
                 <span className="text-slate-500 flex items-center gap-2"><Users className="size-4"/> Travelers</span>
                 <span className="font-medium text-slate-900">{trip.travelers} people</span>
               </li>
             </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM STICKY BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-[#E8E8E2] bg-white/90 px-6 py-4 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] md:left-64 lg:px-12">
        <div className="hidden sm:block text-sm font-medium text-slate-700">
          {trip.destination} • {trip.totalDays} days • {formatCurrency(spent, trip.currency)}
        </div>
        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3">
          <button className="rounded-xl border border-slate-200 bg-white px-4 md:px-6 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300">
            Export PDF
          </button>
          <button className="tm-btn-primary px-4 py-2.5 md:px-6">
            Book Hotels
          </button>
        </div>
      </div>
    </div>
  );
}
