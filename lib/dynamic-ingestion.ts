import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";

const NAMESPACE = "trip-history";

function getEmbeddings() {
  return new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACE_API_KEY,
    model: "sentence-transformers/all-mpnet-base-v2",
  });
}

function getPineconeIndex() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  return pinecone.index(process.env.PINECONE_INDEX_NAME || "travelmind-index");
}

interface ItineraryData {
  id: string;
  destination: string;
  country: string;
  totalDays: number;
  travelStyle: string;
  totalBudget: number;
  currency: string;
  travelers: number;
  days: any[];
}

/**
 * Ingest a completed/saved itinerary into Pinecone so it enriches
 * future RAG queries. This grows the knowledge base organically.
 */
export async function ingestItinerary(itinerary: ItineraryData): Promise<number> {
  const docs: Document[] = [];

  // 1. Create a summary document for the overall trip
  const activities = (itinerary.days || [])
    .flatMap((day: any) => (day.activities || []).map((act: any) => act.name))
    .filter(Boolean);

  const categories = (itinerary.days || [])
    .flatMap((day: any) => (day.activities || []).map((act: any) => act.category))
    .filter(Boolean);

  const uniqueCategories = [...new Set(categories)];

  const summaryContent = `Destination: ${itinerary.destination}, ${itinerary.country}.
${itinerary.totalDays}-day ${itinerary.travelStyle} trip for ${itinerary.travelers} travelers.
Budget: ${itinerary.totalBudget} ${itinerary.currency}.
Activities: ${activities.slice(0, 15).join(", ")}.
Categories: ${uniqueCategories.join(", ")}.`;

  docs.push(
    new Document({
      pageContent: summaryContent,
      metadata: {
        type: "trip-summary",
        itineraryId: itinerary.id,
        destination: itinerary.destination,
        country: itinerary.country,
        travelStyle: itinerary.travelStyle,
        totalDays: itinerary.totalDays,
        budget: itinerary.totalBudget,
        currency: itinerary.currency,
        timestamp: new Date().toISOString(),
      },
    })
  );

  // 2. Create per-day documents for granular retrieval
  for (const day of itinerary.days || []) {
    const dayActivities = (day.activities || [])
      .map((a: any) => `${a.name} (${a.category || "general"}): ${a.description || ""}`)
      .join("; ");

    if (dayActivities) {
      docs.push(
        new Document({
          pageContent: `${itinerary.destination} Day ${day.day}: ${dayActivities}`,
          metadata: {
            type: "trip-day",
            itineraryId: itinerary.id,
            destination: itinerary.destination,
            country: itinerary.country,
            day: day.day,
            timestamp: new Date().toISOString(),
          },
        })
      );
    }
  }

  if (docs.length === 0) return 0;

  const embeddings = getEmbeddings();
  const pineconeIndex = getPineconeIndex();

  await PineconeStore.fromDocuments(docs, embeddings, {
    pineconeIndex,
    namespace: NAMESPACE,
    maxConcurrency: 5,
  });

  console.log(`Ingested ${docs.length} trip vectors for ${itinerary.destination}`);
  return docs.length;
}
