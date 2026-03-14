import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { tripIntentSchema } from "@/lib/validations";
import { generateShareToken } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = tripIntentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const intent = parsed.data;

    // Step 1: Geocode the destination
    const geoRes = await fetch(
      `${BASE_URL}/api/geocode?query=${encodeURIComponent(intent.destination)}`
    );
    const geoData = geoRes.ok ? await geoRes.json() : [];
    const location = geoData[0] || { lat: 0, lng: 0, displayName: intent.destination };

    // Step 2: Parallel data fetch
    const startDate = intent.startDate || new Date().toISOString().split("T")[0];
    const endDate = intent.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

    const [weatherRes, placesRes, cityInfoRes, currencyRes] = await Promise.allSettled([
      fetch(`${BASE_URL}/api/weather?lat=${location.lat}&lng=${location.lng}&startDate=${startDate}&endDate=${endDate}`),
      fetch(`${BASE_URL}/api/places?lat=${location.lat}&lng=${location.lng}&categories=tourism.sights,tourism.attraction,catering.restaurant,entertainment&limit=15`),
      fetch(`${BASE_URL}/api/city-info?city=${encodeURIComponent(intent.destination)}`),
      fetch(`${BASE_URL}/api/currency?from=USD&to=${intent.currency || "INR"}`),
    ]);

    const weather = weatherRes.status === "fulfilled" && weatherRes.value.ok
      ? await weatherRes.value.json() : [];
    const places = placesRes.status === "fulfilled" && placesRes.value.ok
      ? await placesRes.value.json() : [];
    const cityInfo = cityInfoRes.status === "fulfilled" && cityInfoRes.value.ok
      ? await cityInfoRes.value.json() : {};
    const currency = currencyRes.status === "fulfilled" && currencyRes.value.ok
      ? await currencyRes.value.json() : { rate: 1 };

    // Step 3: Fetch user's wishlisted hotels and flights for hybrid recommendations
    let wishlistContext = "";
    try {
      const wishlistItems = await prisma.wishlistItem.findMany({
        where: {
          addedByUserId: session.user.id,
          type: { in: ["hotel", "flight"] },
        },
        orderBy: { addedAt: "desc" },
        take: 10,
      });

      if (wishlistItems.length > 0) {
        const wishlistHotels = wishlistItems
          .filter((w) => w.type === "hotel")
          .map((w) => {
            const d = typeof w.data === "string" ? JSON.parse(w.data) : w.data;
            return `- ${d.name || "Hotel"} (${d.city || ""}${d.country ? `, ${d.country}` : ""}) — Rating: ${d.rating || "N/A"}, Price: ${d.pricePerNight || "N/A"}/night`;
          });

        const wishlistFlights = wishlistItems
          .filter((w) => w.type === "flight")
          .map((w) => {
            const d = typeof w.data === "string" ? JSON.parse(w.data) : w.data;
            const airline = typeof d.airline === "string" ? d.airline : d.airline?.name || "Airline";
            return `- ${airline}: ${d.departure?.iata || "?"} → ${d.arrival?.iata || "?"} (${d.departure?.scheduled ? d.departure.scheduled.slice(0, 10) : "N/A"})`;
          });

        if (wishlistHotels.length > 0) {
          wishlistContext += `\nUser's Wishlisted Hotels (PRIORITIZE these for accommodation):\n${wishlistHotels.join("\n")}`;
        }
        if (wishlistFlights.length > 0) {
          wishlistContext += `\nUser's Wishlisted Flights (INCORPORATE into travel plans):\n${wishlistFlights.join("\n")}`;
        }
      }
    } catch (e) {
      console.error("Wishlist fetch error (non-fatal):", e);
    }

    // Step 4: Fetch user interaction ratings for hybrid recommendations
    let ratingsContext = "";
    try {
      const highRatedInteractions = await prisma.userInteraction.findMany({
        where: {
          userId: session.user.id,
          action: { in: ["rate", "favorite"] },
          score: { gte: 4 },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      if (highRatedInteractions.length > 0) {
        const ratedItems = highRatedInteractions.map((i) => {
          const meta = typeof i.metadata === "string" ? JSON.parse(i.metadata) : i.metadata;
          return `- ${(meta as any)?.name || i.itemId} (${i.itemType}, rated ${i.score}/5)`;
        });
        ratingsContext = `\nUser's Highly Rated Items:\n${ratedItems.join("\n")}`;
      }
    } catch (e) {
      console.error("Ratings fetch error (non-fatal):", e);
    }

    // Step 5: Extract user preferences from description
    let userPrefsString = "";
    try {
      const { extractPreferences, preferencesToPromptString } = await import("@/lib/preference-extractor");
      const { storeUserPreferences, getUserPreferences } = await import("@/lib/preference-store");

      // Extract preferences from the user's free-text description
      if (intent.description) {
        const extractedPrefs = await extractPreferences(
          `Trip to ${intent.destination}. ${intent.description}. Style: ${intent.travelStyle || "from description"}.`
        );

        // Store extracted preferences in Pinecone for future trips
        await storeUserPreferences(session.user.id, extractedPrefs, "itinerary-creation").catch(() => {});

        userPrefsString = preferencesToPromptString(extractedPrefs);
      }

      // Also retrieve any previously stored preferences for this user
      const storedPrefs = await getUserPreferences(
        session.user.id,
        `Travel to ${intent.destination}`
      ).catch(() => "");

      if (storedPrefs) {
        userPrefsString = userPrefsString
          ? `${userPrefsString}\n${storedPrefs}`
          : storedPrefs;
      }
    } catch (e) {
      console.error("Preference extraction error (non-fatal):", e);
    }

    // Step 6: Get RAG knowledge context (semantic search)
    let ragContext = "";
    try {
      const ragRes = await fetch(`${BASE_URL}/api/rag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Travel to ${intent.destination}: ${intent.description || ""}. Budget: ${intent.budget}. Style: ${intent.travelStyle || "from user description"}`,
          userId: session.user.id,
        }),
      });
      if (ragRes.ok) {
        const ragData = await ragRes.json();
        ragContext = ragData.answer || "";
      }
    } catch {
      // RAG is optional — continue without it
    }

    const totalDays = Math.max(1, Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000
    ) + 1);

    // Step 7: Build enriched hybrid recommendation prompt
    const topPlaces = places.slice(0, 8).map((p: any) => `${p.name} (${p.category})`).join(", ");

    const prompt = `Generate a ${totalDays}-day itinerary for ${intent.destination} (${startDate} to ${endDate}).
Budget: ${intent.budget || 50000} ${intent.currency || "INR"}, ${intent.travelers || 2} travelers, ${intent.travelStyle || "balanced"} style.
${intent.description ? `User's Trip Description (EXTRACT travel style, interests, number of travelers, currency, and all preferences from this): ${intent.description}` : ""}
${topPlaces ? `Nearby places of interest: ${topPlaces}` : ""}
${wishlistContext ? `\n--- WISHLISTED ITEMS (MUST prioritize these) ---${wishlistContext}` : ""}
${ratingsContext ? `\n--- USER RATINGS (consider these preferences) ---${ratingsContext}` : ""}
${userPrefsString ? `\n--- STORED USER PREFERENCES ---\n${userPrefsString}` : ""}
${ragContext ? `\n--- TRAVEL KNOWLEDGE & RECOMMENDATIONS ---\n${ragContext.slice(0, 600)}` : ""}

IMPORTANT INSTRUCTIONS:
1. Extract travel style, interests, number of travelers and currency from the user's description if not explicitly provided.
2. PRIORITIZE wishlisted hotels for accommodation and wishlisted flights for travel.
3. Consider user's highly rated items and stored preferences for activity suggestions.
4. Use RAG travel knowledge for local tips and hidden gems.

Return ONLY a JSON array. Each element: {"day":1,"date":"YYYY-MM-DD","title":"...","activities":[{"name":"...","description":"...","time":"HH:MM","duration":60,"category":"culture","estimatedCost":500,"lat":0.0,"lng":0.0}]}
Include 3-4 activities per day. Mix sightseeing, food, leisure. Honor the user's preferences above all else.`;

    // Use Google Generative AI SDK directly (no LangChain overhead)
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

    // Model fallback chain: each model has its OWN quota
    const modelsToTry = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash-8b"];
    let content = "";

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        content = result.response.text();
        console.log(`Success with model: ${modelName}`);
        break;
      } catch (err: any) {
        const errStr = String(err);
        if (errStr.includes("429") || errStr.includes("Too Many Requests") || errStr.includes("quota")) {
          console.log(`Model ${modelName} quota exhausted, trying next...`);
          continue;
        }
        if (errStr.includes("not found") || errStr.includes("not supported")) {
          console.log(`Model ${modelName} not available, trying next...`);
          continue;
        }
        console.error(`Model ${modelName} error:`, err?.message || err);
      }
    }

    if (!content) {
      console.warn("All models exhausted — using fallback itinerary from places data");
    }

    // Step 8: Parse response
    let days: any[] = [];
    if (content) {
      try {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)```/) || content.match(/\[[\s\S]*\]/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
        days = JSON.parse(jsonStr);
      } catch {
        days = buildFallbackDays(totalDays, startDate, places);
      }
    } else {
      days = buildFallbackDays(totalDays, startDate, places);
    }

    // Step 9: Save to database
    const itinerary = await prisma.itinerary.create({
      data: {
        userId: session.user.id,
        title: `Trip to ${intent.destination}`,
        destination: intent.destination,
        country: cityInfo.country || location.displayName?.split(",").pop()?.trim() || "",
        startDate,
        endDate,
        totalDays,
        totalBudget: intent.budget || 50000,
        currency: intent.currency || "INR",
        travelers: intent.travelers || 2,
        travelStyle: intent.travelStyle || "balanced",
        days: days,
        shareToken: generateShareToken(),
        status: "draft",
      },
    });

    // Step 10: Auto-ingest the new trip into Pinecone for future RAG enrichment
    try {
      const { ingestItinerary } = await import("@/lib/dynamic-ingestion");
      // Fire-and-forget: don't block the response
      ingestItinerary({
        id: itinerary.id,
        destination: intent.destination,
        country: cityInfo.country || location.displayName?.split(",").pop()?.trim() || "",
        totalDays,
        travelStyle: intent.travelStyle || "balanced",
        totalBudget: intent.budget || 50000,
        currency: intent.currency || "INR",
        travelers: intent.travelers || 2,
        days,
      }).catch((e) => console.error("Dynamic ingestion error (non-fatal):", e));
    } catch {}

    return NextResponse.json({
      ...itinerary,
      weather,
      cityInfo,
      exchangeRate: currency.rate,
    });
  } catch (error) {
    console.error("Itinerary generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary", details: String(error) },
      { status: 500 }
    );
  }
}


function buildFallbackDays(totalDays: number, startDate: string, places: any[]): any[] {
  const timeSlots = ["09:00", "11:30", "14:00", "16:30", "19:00"];
  return Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    date: new Date(new Date(startDate).getTime() + i * 86400000).toISOString().split("T")[0],
    title: `Day ${i + 1}`,
    activities: places.slice(i * 3, (i + 1) * 3).map((p: any, actIdx: number) => ({
      name: p.name,
      description: p.description || "",
      time: timeSlots[actIdx % timeSlots.length],
      duration: 60,
      category: p.category || "culture",
      lat: p.lat,
      lng: p.lng,
    })),
  }));
}
