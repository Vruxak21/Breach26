import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text, userId, source, itineraryId } = await request.json();

    if (!text || !userId) {
      return NextResponse.json(
        { error: "text and userId are required" },
        { status: 400 }
      );
    }

    const { extractPreferences } = await import("@/lib/preference-extractor");
    const { storeUserPreferences } = await import("@/lib/preference-store");

    // 1. Extract structured preferences from free text
    const preferences = await extractPreferences(text);

    // 2. Store in Pinecone
    const storedCount = await storeUserPreferences(
      userId,
      preferences,
      source || "chat",
      itineraryId
    );

    return NextResponse.json({
      preferences,
      storedCount,
      message: `Extracted and stored ${storedCount} preference vectors`,
    });
  } catch (error) {
    console.error("Preference extraction error:", error);
    return NextResponse.json(
      { error: "Preference extraction failed" },
      { status: 500 }
    );
  }
}
