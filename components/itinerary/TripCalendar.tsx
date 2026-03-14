"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-overrides.css";

import { ActivityModal } from "./ActivityModal";
import { Plus, Loader2 } from "lucide-react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface Activity {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: string;
  location?: string;
  description?: string;
}

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

interface TripCalendarProps {
  itineraryId: string;
  days?: Day[];
}

export function TripCalendar({ itineraryId, days = [] }: TripCalendarProps) {
  const [dbActivities, setDbActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/itinerary/${itineraryId}/activities`);
      if (res.ok) {
        const data = await res.json();
        setDbActivities(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [itineraryId]);

  // Convert `days` JSON activities into calendar events
  const dayPlanEvents = useMemo(() => {
    if (!days || days.length === 0) return [];

    return days.flatMap((day) => {
      if (!day.activities || !day.date) return [];

      return day.activities.map((act, idx) => {
        let start = parse(day.date, "yyyy-MM-dd", new Date());
        let end: Date;

        if (act.time) {
          const [hours, minutes] = act.time.split(":").map(Number);
          start.setHours(hours, minutes);
        } else {
          // Stagger by index if no time
          start.setHours(9 + idx * 2, 0);
        }

        // Use duration or default 60 min
        const durationMs = (act.duration || 60) * 60 * 1000;
        end = new Date(start.getTime() + durationMs);

        // Determine color category
        const cat = (act.category || "").toLowerCase();
        let type = "activity";
        if (cat.includes("restaurant") || cat.includes("food") || cat.includes("dining") || cat.includes("catering")) {
          type = "dining";
        } else if (cat.includes("hotel") || cat.includes("accommodation") || cat.includes("stay")) {
          type = "hotel";
        } else if (cat.includes("flight") || cat.includes("transport") || cat.includes("travel")) {
          type = "flight";
        } else if (cat.includes("culture") || cat.includes("museum") || cat.includes("sightseeing") || cat.includes("adventure") || cat.includes("nature") || cat.includes("leisure")) {
          type = "sightseeing";
        }

        return {
          id: `plan-${day.day}-${idx}`,
          title: act.name,
          start,
          end,
          resource: {
            id: `plan-${day.day}-${idx}`,
            title: act.name,
            date: day.date,
            type,
            description: act.description,
            startTime: act.time,
          },
        };
      });
    });
  }, [days]);

  // Convert DB activities into calendar events
  const dbEvents = dbActivities.map((act) => {
    let start = parse(act.date, "yyyy-MM-dd", new Date());
    let end = parse(act.date, "yyyy-MM-dd", new Date());

    if (act.startTime) {
      const [hours, minutes] = act.startTime.split(":").map(Number);
      start.setHours(hours, minutes);
    }
    if (act.endTime) {
      const [hours, minutes] = act.endTime.split(":").map(Number);
      end.setHours(hours, minutes);
    } else if (act.startTime) {
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }

    return {
      id: act.id,
      title: act.title,
      start,
      end,
      resource: act,
    };
  });

  // Merge: day plan events + DB activities (no duplicates by title+date)
  const allEvents = useMemo(() => {
    const dbTitles = new Set(dbEvents.map((e) => `${e.title}-${e.start.toDateString()}`));
    const filtered = dayPlanEvents.filter(
      (e) => !dbTitles.has(`${e.title}-${e.start.toDateString()}`)
    );
    return [...dbEvents, ...filtered];
  }, [dbEvents, dayPlanEvents]);

  // Determine initial date from trip data
  const initialDate = useMemo(() => {
    if (days && days.length > 0 && days[0].date) {
      return parse(days[0].date, "yyyy-MM-dd", new Date());
    }
    return new Date();
  }, [days]);

  const handleSelectSlot = (slotInfo: { start: Date }) => {
    setSelectedDate(slotInfo.start);
    setModalOpen(true);
  };

  const getEventPropGetter = (event: any) => {
    const type = event.resource?.type || "activity";
    let backgroundColor = "#6366f1"; // Indigo default

    switch (type) {
      case "flight":
        backgroundColor = "#0ea5e9";
        break;
      case "hotel":
        backgroundColor = "#f59e0b";
        break;
      case "sightseeing":
        backgroundColor = "#10b981";
        break;
      case "dining":
        backgroundColor = "#ec4899";
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "8px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
        fontSize: "12px",
        padding: "2px 6px",
        fontWeight: 500,
      },
    };
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Trip Calendar</h2>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" />
          Add Activity
        </button>
      </div>

      <div className="h-[600px] w-full calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          views={["month", "week", "agenda"]}
          defaultView={Views.MONTH}
          defaultDate={initialDate}
          selectable
          onSelectSlot={handleSelectSlot}
          eventPropGetter={getEventPropGetter}
          popup
          className="font-sans"
        />
      </div>

      <ActivityModal
        itineraryId={itineraryId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={selectedDate}
        onSave={fetchActivities}
      />
    </div>
  );
}
