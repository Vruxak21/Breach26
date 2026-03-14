import { NextRequest, NextResponse } from "next/server";
import { popularDestinations } from "@/lib/placeholder-data";

const destinationGuides: Record<
  string,
  {
    overview: string;
    history: string;
    culture: string;
    bestFor: string[];
    famousPlaces: string[];
    signatureExperiences: string[];
  }
> = {
  goa: {
    overview:
      "Goa blends tropical beaches, Portuguese-era architecture, vibrant food culture, and relaxed coastal living into one of South Asia's most approachable leisure destinations.",
    history:
      "Historically a major maritime hub, Goa was under Portuguese rule for over four centuries. Its churches, forts, and old Latin quarters still reflect this layered Indo-European heritage.",
    culture:
      "The local culture combines Konkani traditions with global coastal influences. Music, seafood cuisine, neighborhood festivals, and sunset markets define the everyday rhythm.",
    bestFor: ["Beach breaks", "Food trails", "Nightlife", "Wellness escapes"],
    famousPlaces: [
      "Basilica of Bom Jesus",
      "Fort Aguada",
      "Dudhsagar Falls",
      "Anjuna Flea Market",
      "Palolem Beach",
    ],
    signatureExperiences: [
      "Sunset cruise on Mandovi",
      "North Goa cafe hopping",
      "Spice plantation tour",
      "Beach sunrise yoga",
    ],
  },
  manali: {
    overview:
      "Manali is a high-altitude Himalayan retreat known for alpine views, river valleys, pine forests, and adventure-friendly weather across seasons.",
    history:
      "Long associated with ancient trade paths and mountain communities, Manali evolved from a small valley settlement into one of India's iconic hill destinations.",
    culture:
      "Kullu valley traditions, temple architecture, wool crafts, and mountain cuisine shape local identity, while adventure tourism adds a contemporary layer.",
    bestFor: ["Mountain escapes", "Snow trips", "Road journeys", "Adventure sports"],
    famousPlaces: [
      "Hadimba Temple",
      "Solang Valley",
      "Rohtang Pass",
      "Old Manali",
      "Vashisht Hot Springs",
    ],
    signatureExperiences: [
      "Paragliding in Solang",
      "Cafe walk in Old Manali",
      "Scenic drive to Atal Tunnel",
      "Riverside bonfire evenings",
    ],
  },
  bali: {
    overview:
      "Bali offers a complete tropical circuit: volcanic landscapes, temple heritage, surf beaches, rice terraces, and design-forward hospitality.",
    history:
      "With a deep Hindu-Balinese legacy, Bali has preserved ritual arts, temple life, and royal-era cultural institutions while becoming a global tourism icon.",
    culture:
      "Daily offerings, dance performances, handcrafted arts, and wellness-oriented lifestyles make Bali both spiritual and contemporary.",
    bestFor: ["Honeymoons", "Surf and beaches", "Digital nomads", "Luxury wellness"],
    famousPlaces: [
      "Uluwatu Temple",
      "Tegalalang Rice Terrace",
      "Mount Batur",
      "Tanah Lot",
      "Ubud Monkey Forest",
    ],
    signatureExperiences: [
      "Sunrise trek at Mount Batur",
      "Temple circuit in Ubud",
      "Cliffside sunset at Uluwatu",
      "Balinese spa ritual",
    ],
  },
  paris: {
    overview:
      "Paris remains a global benchmark for urban elegance with landmark architecture, museum density, cafe culture, and neighborhood-scale city life.",
    history:
      "From Roman-era roots to medieval centers and Haussmann boulevards, Paris has continuously shaped European political, artistic, and intellectual history.",
    culture:
      "Its cultural identity spans fashion, cuisine, literature, modern art, and public life along the Seine, blending classic heritage with contemporary creativity.",
    bestFor: ["Art and museums", "Romantic travel", "Architecture", "Luxury shopping"],
    famousPlaces: [
      "Eiffel Tower",
      "Louvre Museum",
      "Montmartre",
      "Notre-Dame precinct",
      "Palace of Versailles",
    ],
    signatureExperiences: [
      "Seine evening cruise",
      "Museum day pass route",
      "Bistro and bakery crawl",
      "Golden-hour photo walk",
    ],
  },
  tokyo: {
    overview:
      "Tokyo is a high-efficiency megacity where tradition and technology coexist through shrines, hypermodern districts, and world-class culinary culture.",
    history:
      "Originally Edo, the city became Japan's imperial capital in the 19th century and rebuilt repeatedly through earthquakes and war into a model global metropolis.",
    culture:
      "Tokyo culture ranges from tea houses and temple rituals to anime districts, precision retail, and Michelin-rated dining in compact neighborhood grids.",
    bestFor: ["City exploration", "Food tourism", "Design and tech", "Family travel"],
    famousPlaces: [
      "Senso-ji Temple",
      "Shibuya Crossing",
      "Tokyo Skytree",
      "Meiji Shrine",
      "Tsukiji Outer Market",
    ],
    signatureExperiences: [
      "Late-night ramen trail",
      "Anime and gaming districts",
      "Skyline observation decks",
      "Day trip to Mt. Fuji corridor",
    ],
  },
  dubai: {
    overview:
      "Dubai is a future-facing desert metropolis known for iconic skylines, luxury retail, curated leisure experiences, and globally connected hospitality.",
    history:
      "From a pearl-diving port to a major international business and tourism hub, Dubai's transformation accelerated across the late 20th and early 21st centuries.",
    culture:
      "The city combines Emirati heritage zones, international culinary scenes, and contemporary architecture into a highly service-oriented visitor experience.",
    bestFor: ["Luxury travel", "Family entertainment", "Shopping", "Winter sun"],
    famousPlaces: [
      "Burj Khalifa",
      "Dubai Marina",
      "Al Fahidi Historical District",
      "Palm Jumeirah",
      "Desert Conservation Reserve",
    ],
    signatureExperiences: [
      "Desert safari sunset",
      "Downtown fountain promenade",
      "Beach club day",
      "Old souk and creek trail",
    ],
  },
};

const toSlug = (name: string, country: string) =>
  `${name}-${country}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getMedian(values: number[]): number | null {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

interface BudgetBreakdown {
  flight: number;
  stay: number;
  foodAndLocal: number;
  activities: number;
  events: number;
  total: number;
  currency: "INR";
  nights: number;
}

function estimateBudgetInInr(args: {
  fallbackBudget: number;
  flightHoursFromIndia: number;
  costOfLivingScore: number | null;
  activityCount: number;
  eventCount: number;
  hotelNightlyInr: number | null;
}): { avgBudget: number; budgetBreakdown: BudgetBreakdown } {
  const {
    fallbackBudget,
    flightHoursFromIndia,
    costOfLivingScore,
    activityCount,
    eventCount,
    hotelNightlyInr,
  } = args;

  const tripNights = 4;
  const costScale = costOfLivingScore !== null ? clamp(costOfLivingScore / 5, 0.75, 1.9) : 1;

  // Rough return airfare estimate from India based on route duration.
  const flightEstimate = Math.round(6000 + flightHoursFromIndia * 7000);
  const stayEstimate = hotelNightlyInr !== null
    ? Math.round(hotelNightlyInr * tripNights * 1.12)
    : Math.round(3200 * tripNights * costScale);
  const foodAndLocalEstimate = Math.round(2200 * tripNights * costScale);
  const activitiesEstimate = Math.round((Math.max(6, activityCount) * 550) * costScale);
  const eventsEstimate = eventCount > 0 ? Math.round((Math.min(eventCount, 4) * 700) * costScale) : 0;

  const computed = flightEstimate + stayEstimate + foodAndLocalEstimate + activitiesEstimate + eventsEstimate;

  // Keep estimate stable and realistic relative to curated baseline.
  const minBound = fallbackBudget * 0.55;
  const maxBound = fallbackBudget * 1.85;
  const avgBudget = Math.round(clamp(computed, minBound, maxBound));

  const scale = computed > 0 ? avgBudget / computed : 1;
  const budgetBreakdown: BudgetBreakdown = {
    flight: Math.round(flightEstimate * scale),
    stay: Math.round(stayEstimate * scale),
    foodAndLocal: Math.round(foodAndLocalEstimate * scale),
    activities: Math.round(activitiesEstimate * scale),
    events: Math.round(eventsEstimate * scale),
    total: avgBudget,
    currency: "INR",
    nights: tripNights,
  };

  const subtotal = budgetBreakdown.flight + budgetBreakdown.stay + budgetBreakdown.foodAndLocal + budgetBreakdown.activities + budgetBreakdown.events;
  const roundingDelta = avgBudget - subtotal;
  if (roundingDelta !== 0) {
    budgetBreakdown.stay += roundingDelta;
  }

  return { avgBudget, budgetBreakdown };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const destination = popularDestinations.find(
    (item) => toSlug(item.name, item.country) === slug,
  );

  if (!destination) {
    return NextResponse.json({ error: "Destination not found" }, { status: 404 });
  }

  const origin = request.nextUrl.origin;
  const locationQuery = `${destination.name}, ${destination.country}`;

  let lat: number | null = null;
  let lng: number | null = null;
  let displayName = locationQuery;
  let cityInfo: Record<string, unknown> | null = null;
  let weatherPreview: Array<Record<string, unknown>> = [];
  let activityCount = 0;
  let eventCount = 0;
  let topActivities: Array<Record<string, unknown>> = [];
  let topEvents: Array<Record<string, unknown>> = [];
  let avgHotelNightlyInr: number | null = null;

  try {
    const geoRes = await fetch(
      `${origin}/api/geocode?query=${encodeURIComponent(locationQuery)}`,
      { cache: "no-store" },
    );

    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (Array.isArray(geoData) && geoData.length > 0) {
        lat = Number(geoData[0].lat);
        lng = Number(geoData[0].lng);
        displayName = geoData[0].displayName || locationQuery;
      }
    }
  } catch {
    // Keep fallback values for coordinates/display name.
  }

  try {
    const cityInfoRes = await fetch(
      `${origin}/api/city-info?city=${encodeURIComponent(destination.name)}`,
      { cache: "no-store" },
    );

    if (cityInfoRes.ok) {
      cityInfo = await cityInfoRes.json();
    }
  } catch {
    cityInfo = null;
  }

  if (lat !== null && lng !== null) {
    try {
      const weatherRes = await fetch(
        `${origin}/api/weather?lat=${lat}&lng=${lng}`,
        { cache: "no-store" },
      );

      if (weatherRes.ok) {
        const weatherData = await weatherRes.json();
        if (Array.isArray(weatherData)) {
          weatherPreview = weatherData.slice(0, 5);
        }
      }
    } catch {
      weatherPreview = [];
    }

    try {
      const placesRes = await fetch(
        `${origin}/api/places?lat=${lat}&lng=${lng}&limit=8`,
        { cache: "no-store" },
      );
      if (placesRes.ok) {
        const placesData = await placesRes.json();
        if (Array.isArray(placesData)) {
          activityCount = placesData.length;
          topActivities = placesData.slice(0, 8).map((item: unknown) => {
            const activity = item as Record<string, unknown>;
            return {
              id: activity.id,
              name: activity.name,
              category: activity.category,
              description: activity.description,
              image: activity.image,
              rating: activity.rating,
            };
          });
        }
      }
    } catch {
      activityCount = 0;
    }

    try {
      const eventsRes = await fetch(
        `${origin}/api/events?lat=${lat}&lng=${lng}&limit=8`,
        { cache: "no-store" },
      );
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (Array.isArray(eventsData)) {
          eventCount = eventsData.length;
          topEvents = eventsData.slice(0, 5).map((item: unknown) => {
            const event = item as Record<string, unknown>;
            return {
              id: event.id,
              name: event.name,
              date: event.date,
              category: event.category,
              venue: event.venue,
            };
          });
        }
      }
    } catch {
      eventCount = 0;
    }

    try {
      const checkinDate = new Date();
      checkinDate.setDate(checkinDate.getDate() + 14);
      const checkoutDate = new Date(checkinDate);
      checkoutDate.setDate(checkoutDate.getDate() + 4);

      const checkin = checkinDate.toISOString().slice(0, 10);
      const checkout = checkoutDate.toISOString().slice(0, 10);

      const hotelsRes = await fetch(
        `${origin}/api/hotels?city=${encodeURIComponent(destination.name)}&checkin=${checkin}&checkout=${checkout}&guests=2&currency=INR`,
        { cache: "no-store" },
      );

      if (hotelsRes.ok) {
        const hotelsData = await hotelsRes.json();
        if (Array.isArray(hotelsData)) {
          const nightlyPrices = hotelsData
            .map((hotel: unknown) => {
              const item = hotel as Record<string, unknown>;
              return Number(item.pricePerNight);
            })
            .filter((price) => Number.isFinite(price) && price > 0);

          avgHotelNightlyInr = getMedian(nightlyPrices);
        }
      }
    } catch {
      avgHotelNightlyInr = null;
    }
  }

  const costOfLivingScore =
    cityInfo && typeof cityInfo.costOfLiving === "number"
      ? cityInfo.costOfLiving
      : null;

  const { avgBudget: dynamicAvgBudget, budgetBreakdown } = estimateBudgetInInr({
    fallbackBudget: destination.avgBudget,
    flightHoursFromIndia: destination.flightHoursFromIndia,
    costOfLivingScore,
    activityCount,
    eventCount,
    hotelNightlyInr: avgHotelNightlyInr,
  });

  const destinationWithDynamicBudget = {
    ...destination,
    avgBudget: dynamicAvgBudget,
  };

  const guide = destinationGuides[destination.name.toLowerCase()] ?? {
    overview:
      `${destination.name} is a popular travel destination with rich local experiences, scenic neighborhoods, and a strong mix of leisure and culture.`,
    history:
      `${destination.name} has evolved through distinct historical phases, which are reflected in its architecture, institutions, and urban character today.`,
    culture:
      `Local traditions, cuisine, and seasonal festivals shape the visitor experience in ${destination.name}.`,
    bestFor: ["Leisure travel", "Culture", "Food", "Photography"],
    famousPlaces: [
      `${destination.name} Old Town`,
      `${destination.name} City Center`,
      `${destination.name} Waterfront`,
      `${destination.name} Cultural District`,
    ],
    signatureExperiences: [
      `Guided city walk in ${destination.name}`,
      `Local cuisine tasting session`,
      `Sunset viewpoint trail`,
      `Neighborhood market exploration`,
    ],
  };

  return NextResponse.json({
    destination: destinationWithDynamicBudget,
    location: {
      lat,
      lng,
      displayName,
    },
    cityInfo,
    weatherPreview,
    snapshot: {
      activityCount,
      eventCount,
    },
    guide,
    topActivities,
    topEvents,
    budgetBreakdown,
  });
}
