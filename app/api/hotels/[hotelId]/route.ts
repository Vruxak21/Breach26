import { NextRequest, NextResponse } from "next/server";

// Strip HTML tags from text content
function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp;
    .replace(/&amp;/g, "&")  // Replace &amp;
    .replace(/&lt;/g, "<")   // Replace &lt;
    .replace(/&gt;/g, ">")   // Replace &gt;
    .replace(/&quot;/g, '"') // Replace &quot;
    .replace(/&#39;/g, "'")  // Replace &#39;
    .replace(/\s+/g, " ")   // Collapse whitespace
    .trim();
}

// Mock hotel detail for when API can't return data
function getMockHotelDetail(hotelId: string) {
  return {
    id: hotelId,
    name: "Grand Resort & Spa",
    address: "123 Mountain View Road",
    city: "Mountain Resort",
    country: "",
    starRating: 5,
    rating: 4.8,
    description:
      "A luxurious resort nestled in the mountains, offering world-class amenities, breathtaking views, and exceptional service. Our property features elegant rooms, multiple dining options, a full-service spa, and a range of recreational activities to make your stay truly memorable.",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    ],
    facilities: [
      "Free WiFi",
      "Swimming Pool",
      "Spa & Wellness Center",
      "Fitness Center",
      "Restaurant",
      "Bar/Lounge",
      "Room Service",
      "Concierge",
      "Airport Shuttle",
      "Parking",
      "Laundry Service",
      "Business Center",
    ],
    rooms: [
      {
        name: "Deluxe Mountain View Room",
        description:
          "Spacious room with panoramic mountain views, king bed, and luxury bathroom.",
        maxOccupancy: 2,
        bedType: "King",
      },
      {
        name: "Premium Suite",
        description:
          "Elegant suite with separate living area, balcony, and premium amenities.",
        maxOccupancy: 3,
        bedType: "King + Sofa Bed",
      },
      {
        name: "Family Room",
        description:
          "Large room ideal for families with connecting options and kid-friendly amenities.",
        maxOccupancy: 4,
        bedType: "Twin + Double",
      },
    ],
    latitude: 0,
    longitude: 0,
    checkInTime: "14:00",
    checkOutTime: "11:00",
    hotelImportantInformation:
      "Early check-in and late check-out are available upon request and subject to availability. Pets are not allowed. Guests must present a valid photo ID at check-in.",
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hotelId: string }> }
) {
  const { hotelId } = await params;

  if (!hotelId) {
    return NextResponse.json({ error: "hotelId is required" }, { status: 400 });
  }

  // For mock hotel IDs, return mock data directly
  if (hotelId.startsWith("mock-")) {
    return NextResponse.json(getMockHotelDetail(hotelId));
  }

  const apiKey = process.env.LITEAPI_API_KEY;
  if (!apiKey || apiKey === "your_liteapi_key_here") {
    console.log("LiteAPI: No API key, returning mock hotel detail");
    return NextResponse.json(getMockHotelDetail(hotelId));
  }

  try {
    // Strip "liteapi-" prefix if present (added by our list endpoint)
    const rawId = hotelId.replace(/^liteapi-/, "");

    const res = await fetch(
      `https://api.liteapi.travel/v3.0/data/hotel?hotelId=${encodeURIComponent(rawId)}`,
      {
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      console.error("LiteAPI hotel detail failed:", await res.text());
      return NextResponse.json(getMockHotelDetail(hotelId));
    }

    const json = await res.json();
    const h = json?.data;

    if (!h) {
      console.log("LiteAPI: Hotel not found for", hotelId, "— using mock");
      return NextResponse.json(getMockHotelDetail(hotelId));
    }

    const hotel = {
      id: h.id || h.hotelId || hotelId,
      name: h.name || "Hotel",
      address: h.address || "",
      city: h.city || "",
      country: h.country || "",
      starRating: h.starRating || h.stars || 0,
      rating: h.rating || 0,
      description: stripHtml(h.hotelDescription || h.description?.short || h.description || ""),
      images: Array.isArray(h.hotelImages)
        ? h.hotelImages.map((img: any) => img.url || img)
        : Array.isArray(h.images)
        ? h.images.map((img: any) => img.url || img)
        : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"],
      facilities: h.hotelFacilities || h.facilities || [],
      rooms: Array.isArray(h.rooms)
        ? h.rooms.slice(0, 10).map((r: any) => ({
            name: r.roomName || r.name || "Room",
            description: stripHtml(r.roomDescription || r.description || ""),
            maxOccupancy: r.maxOccupancy || r.maxGuests || 2,
            bedType: r.bedType || "",
          }))
        : [],
      latitude: h.latitude || 0,
      longitude: h.longitude || 0,
      checkInTime: h.checkInTime || "",
      checkOutTime: h.checkOutTime || "",
      hotelImportantInformation: stripHtml(h.hotelImportantInformation || ""),
    };

    return NextResponse.json(hotel);
  } catch (error) {
    console.error("Hotel detail error:", error);
    return NextResponse.json(getMockHotelDetail(hotelId));
  }
}
