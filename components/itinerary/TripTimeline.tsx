"use client";

import { motion } from "framer-motion";
import { Plane, Building, MapPin, Utensils, CalendarDays, DollarSign } from "lucide-react";

interface DayActivity {
  name: string;
  description?: string;
  time?: string;
  duration?: number;
  category?: string;
  estimatedCost?: number;
  lat?: number;
  lng?: number;
}

interface Day {
  day: number;
  date: string;
  title?: string;
  activities: DayActivity[];
}

export function TripTimeline({ days }: { days: Day[] }) {
  if (!days || days.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white">
        <p className="text-sm font-medium text-slate-500">
          No itinerary data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Trip Journey</h2>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          {days.length} days
        </span>
      </div>

      <div className="relative border-l-2 border-slate-200 ml-4 py-4 space-y-12">
        {days.map((day, dayIndex) => {
          const dayActivities = day.activities || [];

          return (
            <motion.div
              key={day.date || dayIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.08, duration: 0.5 }}
              className="relative"
            >
              {/* Day Header Marker */}
              <div className="absolute -left-[9px] top-0 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 ring-4 ring-white" />
              <div className="ml-8 mb-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                  <CalendarDays className="h-4 w-4" />
                  Day {day.day} • {day.date}
                </span>
                {day.title && (
                  <span className="ml-2 text-sm text-slate-500">{day.title}</span>
                )}
              </div>

              {/* Activity Cards */}
              <div className="space-y-4 ml-6">
                {dayActivities.map((act, actIndex) => {
                  let Icon = MapPin;
                  let bgClass = "bg-slate-100 text-slate-600";
                  let borderClass = "border-slate-200";

                  const cat = (act.category || "").toLowerCase();
                  if (cat.includes("restaurant") || cat.includes("food") || cat.includes("catering") || cat === "dining") {
                    Icon = Utensils;
                    bgClass = "bg-pink-100 text-pink-600";
                    borderClass = "border-pink-200";
                  } else if (cat.includes("hotel") || cat.includes("accommodation") || cat.includes("stay")) {
                    Icon = Building;
                    bgClass = "bg-amber-100 text-amber-600";
                    borderClass = "border-amber-200";
                  } else if (cat.includes("flight") || cat.includes("transport") || cat.includes("travel")) {
                    Icon = Plane;
                    bgClass = "bg-sky-100 text-sky-600";
                    borderClass = "border-sky-200";
                  } else if (cat.includes("culture") || cat.includes("museum") || cat.includes("sightseeing") || cat.includes("adventure") || cat.includes("nature") || cat.includes("leisure")) {
                    Icon = MapPin;
                    bgClass = "bg-emerald-100 text-emerald-600";
                    borderClass = "border-emerald-200";
                  }

                  return (
                    <motion.div
                      key={`${day.date}-${actIndex}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (dayIndex * 0.08) + (actIndex * 0.04), duration: 0.4 }}
                      className="relative"
                    >
                      <div className="absolute -left-[33px] top-4 flex h-3 w-3 items-center justify-center rounded-full bg-white border-2 border-slate-300" />
                      
                      <div className={`p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition cursor-default ${borderClass}`}>
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgClass}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-slate-900 truncate">{act.name}</h4>
                              {act.time && (
                                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded-md">
                                  {act.time}
                                </span>
                              )}
                            </div>
                            {act.description && (
                              <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                                {act.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              {act.duration && (
                                <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full">
                                  🕐 {act.duration} min
                                </span>
                              )}
                              {act.estimatedCost && act.estimatedCost > 0 && (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                                  <DollarSign className="h-3 w-3" />
                                  {act.estimatedCost}
                                </span>
                              )}
                              {act.category && (
                                <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full capitalize">
                                  {act.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
