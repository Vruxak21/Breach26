import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const guests = searchParams.get("guests") || "2";
  const currency = searchParams.get("currency") || "USD";

  if (!city || !checkin || !checkout) {
    return NextResponse.json(
      { error: "city, checkin, and checkout are required" },
      { status: 400 }
    );
  }

  const destination = city;

  const apiKey = process.env.LITEAPI_API_KEY;
  if (!apiKey || apiKey === "your_liteapi_key_here") {
    return NextResponse.json({ error: "LiteAPI key not configured" }, { status: 503 });
  }

  try {
    // Step 1: Get placeId from destination name
    const searchRes = await fetch(
      `https://api.liteapi.travel/v3.0/data/places?textQuery=${encodeURIComponent(destination)}`,
      {
        headers: {
          "X-API-Key": apiKey,
          "Accept": "application/json",
        },
      }
    );

    if (!searchRes.ok) {
      console.error("LiteAPI place search failed:", await searchRes.text());
      return NextResponse.json({ error: "Hotel search failed (place lookup)" }, { status: 502 });
    }

    const placeData = await searchRes.json();
    const placeId = placeData?.data?.[0]?.placeId;

    if (!placeId) {
      return NextResponse.json([]); // No matching place found
    }

    // Step 2: Search hotels by placeId
    const hotelsRes = await fetch(
      `https://api.liteapi.travel/v3.0/data/hotels?countryCode=${placeId.substring(0, 2)}&cityName=${encodeURIComponent(destination)}`,
      {
        headers: {
          "X-API-Key": apiKey,
          "Accept": "application/json",
        },
      }
    );

    if (!hotelsRes.ok) {
      console.error("LiteAPI hotel search failed:", await hotelsRes.text());
      return NextResponse.json({ error: "Hotel search failed" }, { status: 502 });
    }

    const hotelData = await hotelsRes.json();
    const rawHotels = hotelData?.data || [];

    const hotels = rawHotels.slice(0, 10).map((h: any) => ({
      id: `liteapi-${h.id || h.hotelId}`,
      name: h.name || "Hotel",
      city: h.city || destination,
      country: h.country || "",
      pricePerNight: h.rate?.price || h.minRate || 0,
      currency: currency,
      rating: h.rating || 4.0,
      stars: h.starRating || h.stars || 3,
      images: h.images?.length
        ? h.images.map((img: any) => img.url || img)
        : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"],
      amenities: h.amenities || h.facilities?.slice(0, 6) || [],
      lat: h.latitude || 0,
      lng: h.longitude || 0,
      description: h.description?.short || h.address || "",
      externalId: String(h.id || h.hotelId),
    }));

    return NextResponse.json(hotels);
  } catch (error) {
    console.error("Hotels error:", error);
    return NextResponse.json({ error: "Hotel service unavailable" }, { status: 500 });
  }
}
