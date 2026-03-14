import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dep_iata = searchParams.get("dep");
  const arr_iata = searchParams.get("arr");
  const date = searchParams.get("date");

  if (!dep_iata || !arr_iata) {
    return NextResponse.json(
      { error: "dep and arr are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey || apiKey === "your_aviationstack_key_here") {
    return NextResponse.json({ error: "Aviationstack API key not configured" }, { status: 503 });
  }

  try {
    const params = new URLSearchParams({
      access_key: apiKey,
      dep_iata,
      arr_iata,
    });

    if (date) params.set("flight_date", date);

    const res = await fetch(
      `http://api.aviationstack.com/v1/flights?${params.toString()}`
    );

    if (!res.ok) {
      console.error("Aviationstack error:", await res.text());
      return NextResponse.json({ error: "Flight search failed" }, { status: 502 });
    }

    const data = await res.json();
    const flights = (data.data || []).slice(0, 10).map((f: any) => ({
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

    return NextResponse.json(flights);
  } catch (error) {
    console.error("Flights error:", error);
    return NextResponse.json({ error: "Flight service unavailable" }, { status: 500 });
  }
}
