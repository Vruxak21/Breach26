import { NextRequest, NextResponse } from "next/server";

// Mock flight data used as fallback when Aviationstack free tier can't serve the request
function getMockFlights(dep_iata: string, arr_iata: string, date: string) {
  const airlines = [
    { name: "Air India", code: "AI" },
    { name: "IndiGo", code: "6E" },
    { name: "SpiceJet", code: "SG" },
    { name: "Vistara", code: "UK" },
    { name: "Emirates", code: "EK" },
    { name: "Lufthansa", code: "LH" },
  ];

  return airlines.slice(0, 6).map((airline, i) => {
    const depHour = 6 + i * 3;
    const arrHour = depHour + 4 + Math.floor(Math.random() * 4);
    const flightNum = `${airline.code}${100 + Math.floor(Math.random() * 900)}`;
    const depDate = date || new Date().toISOString().split("T")[0];

    return {
      airline: airline.name,
      flightNumber: flightNum,
      departure: {
        airport: getAirportName(dep_iata),
        iata: dep_iata,
        scheduled: `${depDate}T${String(depHour).padStart(2, "0")}:${String(i * 10).padStart(2, "0")}:00+05:30`,
      },
      arrival: {
        airport: getAirportName(arr_iata),
        iata: arr_iata,
        scheduled: `${depDate}T${String(arrHour).padStart(2, "0")}:${String(30 - i * 5).padStart(2, "0")}:00+05:30`,
      },
      status: "scheduled",
      price: 8000 + Math.floor(Math.random() * 25000),
    };
  });
}

function getAirportName(iata: string): string {
  const airports: Record<string, string> = {
    DEL: "Indira Gandhi International Airport",
    BOM: "Chhatrapati Shivaji Maharaj International Airport",
    BLR: "Kempegowda International Airport",
    MAA: "Chennai International Airport",
    CCU: "Netaji Subhash Chandra Bose International Airport",
    HYD: "Rajiv Gandhi International Airport",
    DXB: "Dubai International Airport",
    LHR: "London Heathrow Airport",
    JFK: "John F. Kennedy International Airport",
    SIN: "Singapore Changi Airport",
    ZRH: "Zurich Airport",
    GVA: "Geneva Airport",
    CDG: "Charles de Gaulle Airport",
    FRA: "Frankfurt Airport",
    BKK: "Suvarnabhumi Airport",
    NRT: "Narita International Airport",
    SYD: "Sydney Airport",
    LAX: "Los Angeles International Airport",
  };
  return airports[iata] || `${iata} Airport`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dep_iata = searchParams.get("dep_iata");
  const arr_iata = searchParams.get("arr_iata");
  const date = searchParams.get("date") || "";

  if (!dep_iata || !arr_iata) {
    return NextResponse.json(
      { error: "dep_iata and arr_iata are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey || apiKey === "your_aviationstack_key_here") {
    // No API key — return mock data
    console.log("Aviationstack: No API key, returning mock flights");
    return NextResponse.json(getMockFlights(dep_iata, arr_iata, date));
  }

  try {
    // Free plan: only use dep_iata (no flight_date, no arr_iata — those are restricted)
    // Must use HTTP, not HTTPS (free plan restriction)
    const params = new URLSearchParams({
      access_key: apiKey,
      dep_iata,
    });

    const res = await fetch(
      `http://api.aviationstack.com/v1/flights?${params.toString()}`
    );

    const data = await res.json();

    // Aviationstack returns 200 with an error object on restricted calls
    if (data.error) {
      console.error("Aviationstack error:", JSON.stringify(data.error));
      console.log("Falling back to mock flight data");
      return NextResponse.json(getMockFlights(dep_iata, arr_iata, date));
    }

    // Filter results by arr_iata client-side
    let rawFlights = data.data || [];
    if (arr_iata) {
      const filtered = rawFlights.filter(
        (f: any) =>
          f.arrival?.iata?.toUpperCase() === arr_iata.toUpperCase()
      );
      if (filtered.length > 0) {
        rawFlights = filtered;
      } else {
        // No flights matching the destination — use mock data for the correct route
        console.log(`Aviationstack: No flights from ${dep_iata} to ${arr_iata}, using mock data`);
        return NextResponse.json(getMockFlights(dep_iata, arr_iata, date));
      }
    }

    const flights = rawFlights.slice(0, 10).map((f: any) => ({
      airline: f.airline?.name || "Unknown",
      flightNumber: f.flight?.iata || f.flight?.number || "",
      departure: {
        airport: f.departure?.airport || dep_iata,
        iata: f.departure?.iata || dep_iata,
        scheduled: f.departure?.scheduled || "",
      },
      arrival: {
        airport: f.arrival?.airport || arr_iata,
        iata: f.arrival?.iata || arr_iata,
        scheduled: f.arrival?.scheduled || "",
      },
      status: f.flight_status || "scheduled",
    }));

    // If API returned results but none after mapping, use mock
    if (flights.length === 0) {
      console.log("Aviationstack returned 0 flights, using mock data");
      return NextResponse.json(getMockFlights(dep_iata, arr_iata, date));
    }

    return NextResponse.json(flights);
  } catch (error) {
    console.error("Flights error:", error);
    // Fallback to mock on any error
    return NextResponse.json(getMockFlights(dep_iata, arr_iata, date));
  }
}
