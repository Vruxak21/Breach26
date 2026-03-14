import { NextRequest, NextResponse } from "next/server";

// Direct city → countryCode mapping for reliable resolution
const CITY_COUNTRY_MAP: Record<string, string> = {
  // India
  "ahmedabad": "IN", "mumbai": "IN", "delhi": "IN", "new delhi": "IN",
  "bangalore": "IN", "bengaluru": "IN", "chennai": "IN", "kolkata": "IN",
  "hyderabad": "IN", "pune": "IN", "jaipur": "IN", "goa": "IN",
  "lucknow": "IN", "kochi": "IN", "cochin": "IN", "varanasi": "IN",
  "srinagar": "IN", "udaipur": "IN", "jodhpur": "IN", "amritsar": "IN",
  "patna": "IN", "bhopal": "IN", "indore": "IN", "chandigarh": "IN",
  "nagpur": "IN", "coimbatore": "IN", "mangalore": "IN", "mysore": "IN",
  "agra": "IN", "shimla": "IN", "manali": "IN", "darjeeling": "IN",
  "rishikesh": "IN", "thiruvananthapuram": "IN", "vizag": "IN",
  // Middle East
  "dubai": "AE", "abu dhabi": "AE", "doha": "QA", "muscat": "OM",
  "riyadh": "SA", "jeddah": "SA",
  // Southeast Asia
  "singapore": "SG", "bangkok": "BK", "kuala lumpur": "MY",
  "bali": "ID", "jakarta": "ID", "manila": "PH", "hanoi": "VN",
  "ho chi minh": "VN", "phuket": "TH",
  // East Asia
  "tokyo": "JP", "osaka": "JP", "seoul": "KR", "hong kong": "HK",
  "shanghai": "CN", "beijing": "CN",
  // South Asia
  "colombo": "LK", "kathmandu": "NP", "dhaka": "BD",
  // Europe
  "london": "GB", "paris": "FR", "amsterdam": "NL", "frankfurt": "DE",
  "munich": "DE", "berlin": "DE", "zurich": "CH", "geneva": "CH",
  "rome": "IT", "milan": "IT", "venice": "IT", "florence": "IT",
  "barcelona": "ES", "madrid": "ES", "lisbon": "PT", "vienna": "AT",
  "prague": "CZ", "istanbul": "TR", "athens": "GR", "brussels": "BE",
  "dublin": "IE", "helsinki": "FI", "oslo": "NO", "stockholm": "SE",
  "copenhagen": "DK", "warsaw": "PL", "budapest": "HU",
  // Americas
  "new york": "US", "los angeles": "US", "san francisco": "US",
  "chicago": "US", "miami": "US", "toronto": "CA", "vancouver": "CA",
  "mexico city": "MX", "sao paulo": "BR",
  // Oceania / Africa
  "sydney": "AU", "melbourne": "AU", "auckland": "NZ",
  "cairo": "EG", "nairobi": "KE", "johannesburg": "ZA",
  // Regions/tourism
  "swiss alps": "CH", "switzerland": "CH", "maldives": "MV",
  "mauritius": "MU", "seychelles": "SC",
};

// Variety of hotel images to use instead of the same fallback for every hotel
const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
  "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80",
  "https://images.unsplash.com/photo-1586611292717-f828b167408c?w=800&q=80",
];

// Resolve destination to countryCode using local map first, then LiteAPI places
async function resolveDestination(destination: string, apiKey: string): Promise<{ countryCode: string; cityName: string }> {
  const key = destination.toLowerCase().trim();

  // 1. Check direct mapping first
  if (CITY_COUNTRY_MAP[key]) {
    return { countryCode: CITY_COUNTRY_MAP[key], cityName: destination };
  }

  // 2. Try partial matching
  for (const [city, code] of Object.entries(CITY_COUNTRY_MAP)) {
    if (key.includes(city) || city.includes(key)) {
      return { countryCode: code, cityName: city.charAt(0).toUpperCase() + city.slice(1) };
    }
  }

  // 3. Fall back to LiteAPI places endpoint
  try {
    const searchRes = await fetch(
      `https://api.liteapi.travel/v3.0/data/places?textQuery=${encodeURIComponent(destination)}`,
      {
        headers: { "X-API-Key": apiKey, Accept: "application/json" },
      }
    );

    if (searchRes.ok) {
      const placeData = await searchRes.json();
      const places = placeData?.data || [];

      if (places.length > 0) {
        const place = places[0];
        const countryCode = place.countryCode || place.country || "";
        const cityName = place.cityName || place.name || destination;
        if (countryCode) {
          console.log(`LiteAPI places resolved "${destination}" → countryCode: "${countryCode}", cityName: "${cityName}"`);
          return { countryCode, cityName };
        }
      }
    }
  } catch (e) {
    console.error("Place resolution error:", e);
  }

  return { countryCode: "", cityName: destination };
}

// Mock hotel data used as fallback
function getMockHotels(destination: string, currency: string) {
  const hotels = [
    {
      id: "mock-1",
      name: `Grand ${destination} Resort & Spa`,
      city: destination,
      country: "",
      pricePerNight: currency === "INR" ? 12500 : 150,
      currency,
      rating: 4.8,
      stars: 5,
      images: [HOTEL_IMAGES[0], HOTEL_IMAGES[1]],
      amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Gym", "Room Service"],
      lat: 0, lng: 0,
      description: `A stunning luxury resort in the heart of ${destination} with breathtaking views.`,
      externalId: "mock-1",
    },
    {
      id: "mock-2",
      name: `${destination} Heritage Hotel`,
      city: destination,
      country: "",
      pricePerNight: currency === "INR" ? 8500 : 100,
      currency,
      rating: 4.5,
      stars: 4,
      images: [HOTEL_IMAGES[2], HOTEL_IMAGES[3]],
      amenities: ["Free WiFi", "Restaurant", "Bar", "Parking", "Heritage Tours"],
      lat: 0, lng: 0,
      description: `A charming heritage hotel showcasing the rich culture of ${destination}.`,
      externalId: "mock-2",
    },
    {
      id: "mock-3",
      name: `Hotel ${destination} Palace`,
      city: destination,
      country: "",
      pricePerNight: currency === "INR" ? 18000 : 220,
      currency,
      rating: 4.9,
      stars: 5,
      images: [HOTEL_IMAGES[4], HOTEL_IMAGES[5]],
      amenities: ["Free WiFi", "Pool", "Spa", "Fine Dining", "Concierge", "Valet"],
      lat: 0, lng: 0,
      description: `An elegant palace hotel offering world-class hospitality in ${destination}.`,
      externalId: "mock-3",
    },
    {
      id: "mock-4",
      name: `${destination} Boutique Inn`,
      city: destination,
      country: "",
      pricePerNight: currency === "INR" ? 5500 : 65,
      currency,
      rating: 4.3,
      stars: 3,
      images: [HOTEL_IMAGES[6], HOTEL_IMAGES[7]],
      amenities: ["Free WiFi", "Breakfast", "Parking", "Laundry"],
      lat: 0, lng: 0,
      description: `A charming boutique inn offering great value in ${destination}.`,
      externalId: "mock-4",
    },
    {
      id: "mock-5",
      name: `The ${destination} Continental`,
      city: destination,
      country: "",
      pricePerNight: currency === "INR" ? 9800 : 120,
      currency,
      rating: 4.6,
      stars: 4,
      images: [HOTEL_IMAGES[8], HOTEL_IMAGES[9]],
      amenities: ["Free WiFi", "Pool", "Gym", "Business Center", "Restaurant"],
      lat: 0, lng: 0,
      description: `Modern continental hotel with premium amenities in ${destination}.`,
      externalId: "mock-5",
    },
    {
      id: "mock-6",
      name: `Skyline View Hotel ${destination}`,
      city: destination,
      country: "",
      pricePerNight: currency === "INR" ? 14200 : 170,
      currency,
      rating: 4.7,
      stars: 4,
      images: [HOTEL_IMAGES[0], HOTEL_IMAGES[4]],
      amenities: ["Free WiFi", "Rooftop Bar", "Spa", "Pool", "Room Service"],
      lat: 0, lng: 0,
      description: `Experience stunning panoramic views from our rooftop suites in ${destination}.`,
      externalId: "mock-6",
    },
  ];
  return hotels;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("destination");
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const guests = searchParams.get("guests") || "2";
  const currency = searchParams.get("currency") || "USD";

  if (!destination || !checkin || !checkout) {
    return NextResponse.json(
      { error: "destination, checkin, and checkout are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.LITEAPI_API_KEY;
  if (!apiKey || apiKey === "your_liteapi_key_here") {
    console.log("LiteAPI: No API key, returning mock hotels");
    return NextResponse.json(getMockHotels(destination, currency));
  }

  try {
    // Step 1: Resolve destination to countryCode + cityName
    const { countryCode, cityName } = await resolveDestination(destination, apiKey);

    if (!countryCode) {
      console.log(`LiteAPI: Could not resolve "${destination}" to a country, using mock data`);
      return NextResponse.json(getMockHotels(destination, currency));
    }

    console.log(`LiteAPI: Searching hotels with countryCode="${countryCode}", cityName="${cityName}"`);

    // Step 2: Search hotels by countryCode and cityName
    const hotelParams = new URLSearchParams({ countryCode, cityName });

    const hotelsRes = await fetch(
      `https://api.liteapi.travel/v3.0/data/hotels?${hotelParams.toString()}`,
      {
        headers: { "X-API-Key": apiKey, Accept: "application/json" },
      }
    );

    if (!hotelsRes.ok) {
      console.error("LiteAPI hotel search failed:", await hotelsRes.text());
      return NextResponse.json(getMockHotels(destination, currency));
    }

    const hotelData = await hotelsRes.json();
    const rawHotels = hotelData?.data || [];

    if (rawHotels.length === 0) {
      // Try with just countryCode as fallback
      console.log(`LiteAPI: No hotels for cityName="${cityName}", trying countryCode="${countryCode}" only`);
      const fallbackRes = await fetch(
        `https://api.liteapi.travel/v3.0/data/hotels?countryCode=${countryCode}`,
        {
          headers: { "X-API-Key": apiKey, Accept: "application/json" },
        }
      );

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const fallbackHotels = fallbackData?.data || [];
        if (fallbackHotels.length > 0) {
          const hotels = fallbackHotels.slice(0, 10).map((h: any, i: number) => mapHotel(h, destination, currency, i));
          return NextResponse.json(hotels);
        }
      }

      console.log("LiteAPI: No hotels found at all, returning mock data");
      return NextResponse.json(getMockHotels(destination, currency));
    }

    const hotels = rawHotels.slice(0, 10).map((h: any, i: number) => mapHotel(h, destination, currency, i));
    return NextResponse.json(hotels);
  } catch (error) {
    console.error("Hotels error:", error);
    return NextResponse.json(getMockHotels(destination, currency));
  }
}

function mapHotel(h: any, destination: string, currency: string, index: number) {
  // Build images array — use hotel's own images if available, else unique fallback per hotel
  let images: string[] = [];
  if (h.images?.length) {
    images = h.images.map((img: any) => (typeof img === "string" ? img : img.url || img)).filter(Boolean);
  } else if (h.hotelImages?.length) {
    images = h.hotelImages.map((img: any) => (typeof img === "string" ? img : img.url || img)).filter(Boolean);
  } else if (h.main_photo) {
    images = [h.main_photo];
  }

  // If still no images, use unique fallback
  if (images.length === 0) {
    images = [HOTEL_IMAGES[index % HOTEL_IMAGES.length]];
  }

  return {
    id: `liteapi-${h.id || h.hotelId}`,
    name: h.name || "Hotel",
    city: h.city || destination,
    country: h.country || "",
    pricePerNight: h.rate?.price || h.minRate || 0,
    currency: currency,
    rating: h.rating || 4.0,
    stars: h.starRating || h.stars || 3,
    images,
    amenities: h.amenities || h.facilities?.slice(0, 6) || [],
    lat: h.latitude || 0,
    lng: h.longitude || 0,
    description: h.description?.short || h.address || "",
    externalId: String(h.id || h.hotelId),
  };
}
