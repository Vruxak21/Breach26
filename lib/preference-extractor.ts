import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ExtractedPreferences {
  specificPlaces: string[];
  cuisinePreferences: string[];
  timingPreferences: string[];
  budgetNuances: string[];
  activityPreferences: string[];
  avoidances: string[];
  specialRequests: string[];
}

const EMPTY_PREFS: ExtractedPreferences = {
  specificPlaces: [],
  cuisinePreferences: [],
  timingPreferences: [],
  budgetNuances: [],
  activityPreferences: [],
  avoidances: [],
  specialRequests: [],
};

/**
 * Uses Gemini to extract structured travel preferences from
 * free-text user input (trip descriptions, chat messages, etc.)
 */
export async function extractPreferences(
  userText: string
): Promise<ExtractedPreferences> {
  if (!userText || userText.trim().length < 10) return EMPTY_PREFS;

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return EMPTY_PREFS;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `You are a travel preference extraction engine.

Extract travel preferences from this user input. Return ONLY valid JSON, no markdown.

User input: "${userText}"

Return this exact JSON structure:
{
  "specificPlaces": [],
  "cuisinePreferences": [],
  "timingPreferences": [],
  "budgetNuances": [],
  "activityPreferences": [],
  "avoidances": [],
  "specialRequests": []
}

Rules:
- specificPlaces: Named locations the user wants to visit (e.g., "Hadimba Temple", "Mall Road")
- cuisinePreferences: Food preferences (e.g., "street food", "vegetarian", "seafood")
- timingPreferences: Schedule preferences (e.g., "no early morning", "prefer evenings", "flexible schedule")
- budgetNuances: Specific budget details beyond the total (e.g., "flexible for adventure sports", "strict for hotels")
- activityPreferences: Types of activities desired (e.g., "photography spots", "adventure sports", "cultural tours")
- avoidances: Things to avoid (e.g., "no crowded places", "no long drives", "avoid tourist traps")
- specialRequests: Accessibility, family, or other special needs (e.g., "wheelchair accessible", "kid-friendly")
- Only include preferences that are explicitly stated or strongly implied
- Leave arrays empty if nothing is mentioned for that category
- Each array item should be a short, concise string`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return EMPTY_PREFS;

    const parsed = JSON.parse(jsonMatch[0]) as ExtractedPreferences;

    // Validate structure
    return {
      specificPlaces: Array.isArray(parsed.specificPlaces) ? parsed.specificPlaces : [],
      cuisinePreferences: Array.isArray(parsed.cuisinePreferences) ? parsed.cuisinePreferences : [],
      timingPreferences: Array.isArray(parsed.timingPreferences) ? parsed.timingPreferences : [],
      budgetNuances: Array.isArray(parsed.budgetNuances) ? parsed.budgetNuances : [],
      activityPreferences: Array.isArray(parsed.activityPreferences) ? parsed.activityPreferences : [],
      avoidances: Array.isArray(parsed.avoidances) ? parsed.avoidances : [],
      specialRequests: Array.isArray(parsed.specialRequests) ? parsed.specialRequests : [],
    };
  } catch (error) {
    console.error("Preference extraction error:", error);
    return EMPTY_PREFS;
  }
}

/**
 * Convert extracted preferences into a human-readable string
 * for injection into LLM prompts
 */
export function preferencesToPromptString(prefs: ExtractedPreferences): string {
  const sections: string[] = [];

  if (prefs.specificPlaces.length > 0) {
    sections.push(`Must-visit places: ${prefs.specificPlaces.join(", ")}`);
  }
  if (prefs.cuisinePreferences.length > 0) {
    sections.push(`Food preferences: ${prefs.cuisinePreferences.join(", ")}`);
  }
  if (prefs.timingPreferences.length > 0) {
    sections.push(`Schedule: ${prefs.timingPreferences.join(", ")}`);
  }
  if (prefs.budgetNuances.length > 0) {
    sections.push(`Budget details: ${prefs.budgetNuances.join(", ")}`);
  }
  if (prefs.activityPreferences.length > 0) {
    sections.push(`Preferred activities: ${prefs.activityPreferences.join(", ")}`);
  }
  if (prefs.avoidances.length > 0) {
    sections.push(`Avoid: ${prefs.avoidances.join(", ")}`);
  }
  if (prefs.specialRequests.length > 0) {
    sections.push(`Special needs: ${prefs.specialRequests.join(", ")}`);
  }

  return sections.length > 0 ? sections.join("\n") : "";
}
