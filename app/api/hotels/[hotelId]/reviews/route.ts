import { NextRequest, NextResponse } from "next/server";

// Mock reviews for when the API can't return data
function getMockReviews() {
  return [
    {
      name: "Rahul S.",
      country: "India",
      date: "2025-12-15",
      averageScore: 9.2,
      type: "Couple",
      headline: "Amazing experience!",
      pros: "Beautiful rooms, excellent service, and the spa was incredible. The views from the balcony were breathtaking.",
      cons: "Restaurant was a bit crowded during dinner time.",
    },
    {
      name: "Sarah M.",
      country: "United Kingdom",
      date: "2025-11-20",
      averageScore: 8.8,
      type: "Family",
      headline: "Great family vacation",
      pros: "Kid-friendly activities, clean rooms, and helpful staff. Breakfast buffet was extensive.",
      cons: "Pool could be a bit warmer.",
    },
    {
      name: "Amit P.",
      country: "India",
      date: "2025-10-05",
      averageScore: 9.5,
      type: "Solo",
      headline: "Perfect getaway",
      pros: "Peaceful location, luxury amenities, and excellent food. The hiking trails nearby were fantastic.",
      cons: "WiFi was a bit slow in the rooms.",
    },
  ];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  const { hotelId } = await params;

  if (!hotelId) {
    return NextResponse.json({ error: "hotelId is required" }, { status: 400 });
  }

  // For mock hotel IDs, return mock reviews directly
  if (hotelId.startsWith("mock-")) {
    return NextResponse.json(getMockReviews());
  }

  const apiKey = process.env.LITEAPI_API_KEY;
  if (!apiKey || apiKey === "your_liteapi_key_here") {
    return NextResponse.json(getMockReviews());
  }

  try {
    // Strip "liteapi-" prefix if present
    const rawId = hotelId.replace(/^liteapi-/, "");

    const res = await fetch(
      `https://api.liteapi.travel/v3.0/data/reviews?hotelId=${encodeURIComponent(rawId)}&limit=20`,
      {
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error("LiteAPI reviews failed:", await res.text());
      return NextResponse.json(getMockReviews());
    }

    const json = await res.json();
    const rawReviews = json?.data || [];

    if (rawReviews.length === 0) {
      return NextResponse.json(getMockReviews());
    }

    const reviews = rawReviews.map((r: any) => ({
      name: r.name || "Guest",
      country: r.country || "",
      date: r.date || "",
      averageScore: r.averageScore || 0,
      type: r.type || "",
      headline: r.headline || "",
      pros: r.pros || "",
      cons: r.cons || "",
    }));

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Reviews error:", error);
    return NextResponse.json(getMockReviews());
  }
}
