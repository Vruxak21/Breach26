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

    // Step 3: Extract user preferences from description
    let userPrefsString = "";
    try {
      const { extractPreferences, preferencesToPromptString } = await import("@/lib/preference-extractor");
      const { storeUserPreferences, getUserPreferences } = await import("@/lib/preference-store");

      // Extract preferences from the user's free-text description
      if (intent.description) {
        const extractedPrefs = await extractPreferences(
          `Trip to ${intent.destination}. ${intent.description}. Interests: ${intent.interests?.join(", ") || "general"}. Style: ${intent.travelStyle || "relaxed"}.`
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

    // Step 4: Get RAG knowledge context
    let ragContext = "";
    try {
      const ragRes = await fetch(`${BASE_URL}/api/rag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `Travel to ${intent.destination}: ${intent.description || ""}. Interests: ${intent.interests?.join(", ") || "general"}. Budget: ${intent.budget}. Style: ${intent.travelStyle || "relaxed"}`,
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

    // Step 5: Build enriched prompt with full context
    const topPlaces = places.slice(0, 8).map((p: any) => `${p.name} (${p.category})`).join(", ");

    const prompt = `Generate a ${totalDays}-day itinerary for ${intent.destination} (${startDate} to ${endDate}).
Budget: ${intent.budget || 50000} ${intent.currency || "INR"}, ${intent.travelers || 2} travelers, ${intent.travelStyle || "relaxed"} style.
${intent.description ? `User Notes: ${intent.description}` : ""}
${topPlaces ? `Nearby places of interest: ${topPlaces}` : ""}
${userPrefsString ? `\nUser Preferences (PRIORITIZE THESE):\n${userPrefsString}` : ""}
${ragContext ? `\nTravel Knowledge & Recommendations:\n${ragContext.slice(0, 600)}` : ""}
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

    // Step 5: Parse response
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

    // Step 6: Save to database
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
        travelStyle: intent.travelStyle || "relaxed",
        days: days,
        shareToken: generateShareToken(),
        status: "draft",
      },
    });
    // Step 7: Auto-ingest the new trip into Pinecone for future RAG enrichment
    try {
      const { ingestItinerary } = await import("@/lib/dynamic-ingestion");
      // Fire-and-forget: don't block the response
      ingestItinerary({
        id: itinerary.id,
        destination: intent.destination,
        country: cityInfo.country || location.displayName?.split(",").pop()?.trim() || "",
        totalDays,
        travelStyle: intent.travelStyle || "relaxed",
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
  return Array.from({ length: totalDays }, (_, i) => ({
    day: i + 1,
    date: new Date(new Date(startDate).getTime() + i * 86400000).toISOString().split("T")[0],
    title: `Day ${i + 1}`,
    activities: places.slice(i * 3, (i + 1) * 3).map((p: any) => ({
      name: p.name,
      description: p.description || "",
      time: "10:00",
      duration: 60,
      category: p.category || "culture",
      lat: p.lat,
      lng: p.lng,
    })),
  }));
}
