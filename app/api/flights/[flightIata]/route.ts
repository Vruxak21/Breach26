import { NextRequest, NextResponse } from "next/server";

// Mock flight detail for when API can't return data
function getMockFlightDetail(flightIata: string) {
  const airlineCode = flightIata.substring(0, 2);
  const airlines: Record<string, string> = {
    AI: "Air India",
    "6E": "IndiGo",
    SG: "SpiceJet",
    UK: "Vistara",
    EK: "Emirates",
    LH: "Lufthansa",
    QR: "Qatar Airways",
    SQ: "Singapore Airlines",
    BA: "British Airways",
    AA: "American Airlines",
  };

  const today = new Date().toISOString().split("T")[0];

  return {
    flightIata: flightIata,
    flightNumber: flightIata.substring(2),
    flightIcao: "",
    airline: {
      name: airlines[airlineCode] || `Airline ${airlineCode}`,
      iata: airlineCode,
      icao: "",
    },
    departure: {
      airport: "Indira Gandhi International Airport",
      iata: "DEL",
      icao: "VIDP",
      terminal: "3",
      gate: "A12",
      scheduled: `${today}T08:30:00+05:30`,
      estimated: `${today}T08:35:00+05:30`,
      actual: "",
      delay: null,
      timezone: "Asia/Kolkata",
    },
    arrival: {
      airport: "International Airport",
      iata: "---",
      icao: "",
      terminal: "1",
      gate: "B8",
      scheduled: `${today}T14:45:00+05:30`,
      estimated: `${today}T14:50:00+05:30`,
      actual: "",
      delay: null,
      timezone: "UTC",
    },
    status: "scheduled",
    aircraft: {
      registration: "VT-ANK",
      iata: "320",
      icao: "A320",
    },
    live: null,
    flightDate: today,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ flightIata: string }> }
) {
  const { flightIata } = await params;

  if (!flightIata) {
    return NextResponse.json({ error: "flightIata is required" }, { status: 400 });
  }

  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey || apiKey === "your_aviationstack_key_here") {
    console.log("Aviationstack: No API key, returning mock flight detail");
    return NextResponse.json(getMockFlightDetail(flightIata));
  }

  try {
    const urlParams = new URLSearchParams({
      access_key: apiKey,
      flight_iata: flightIata,
    });

    // Must use HTTP (free plan doesn't support HTTPS)
    const res = await fetch(
      `http://api.aviationstack.com/v1/flights?${urlParams.toString()}`
    );

    const data = await res.json();

    // Check for API error response
    if (data.error) {
      console.error("Aviationstack detail error:", JSON.stringify(data.error));
      return NextResponse.json(getMockFlightDetail(flightIata));
    }

    const f = data?.data?.[0];

    if (!f) {
      console.log("Aviationstack: No flight found for", flightIata, "— using mock");
      return NextResponse.json(getMockFlightDetail(flightIata));
    }

    const flight = {
      flightIata: f.flight?.iata || flightIata,
      flightNumber: f.flight?.number || "",
      flightIcao: f.flight?.icao || "",
      airline: {
        name: f.airline?.name || "Unknown Airline",
        iata: f.airline?.iata || "",
        icao: f.airline?.icao || "",
      },
      departure: {
        airport: f.departure?.airport || "",
        iata: f.departure?.iata || "",
        icao: f.departure?.icao || "",
        terminal: f.departure?.terminal || "",
        gate: f.departure?.gate || "",
        scheduled: f.departure?.scheduled || "",
        estimated: f.departure?.estimated || "",
        actual: f.departure?.actual || "",
        delay: f.departure?.delay || null,
        timezone: f.departure?.timezone || "",
      },
      arrival: {
        airport: f.arrival?.airport || "",
        iata: f.arrival?.iata || "",
        icao: f.arrival?.icao || "",
        terminal: f.arrival?.terminal || "",
        gate: f.arrival?.gate || "",
        scheduled: f.arrival?.scheduled || "",
        estimated: f.arrival?.estimated || "",
        actual: f.arrival?.actual || "",
        delay: f.arrival?.delay || null,
        timezone: f.arrival?.timezone || "",
      },
      status: f.flight_status || "scheduled",
      aircraft: f.aircraft
        ? {
            registration: f.aircraft.registration || "",
            iata: f.aircraft.iata || "",
            icao: f.aircraft.icao || "",
          }
        : null,
      live: f.live
        ? {
            latitude: f.live.latitude || 0,
            longitude: f.live.longitude || 0,
            altitude: f.live.altitude || 0,
            speed: f.live.speed_horizontal || 0,
            isGround: f.live.is_ground || false,
            updatedAt: f.live.updated || "",
          }
        : null,
      flightDate: f.flight_date || "",
    };

    return NextResponse.json(flight);
  } catch (error) {
    console.error("Flight detail error:", error);
    return NextResponse.json(getMockFlightDetail(flightIata));
  }
}
