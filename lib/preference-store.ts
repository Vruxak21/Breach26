import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import type { ExtractedPreferences } from "./preference-extractor";

const NAMESPACE = "user-preferences";

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

/**
 * Store extracted user preferences as vectors in Pinecone
 * under the "user-preferences" namespace.
 */
export async function storeUserPreferences(
  userId: string,
  preferences: ExtractedPreferences,
  source: string = "prompt",
  itineraryId?: string
): Promise<number> {
  const docs: Document[] = [];

  const addDocs = (category: string, items: string[]) => {
    for (const item of items) {
      if (item.trim()) {
        docs.push(
          new Document({
            pageContent: `User preference (${category}): ${item}`,
            metadata: {
              userId,
              category,
              source,
              value: item,
              ...(itineraryId ? { itineraryId } : {}),
              timestamp: new Date().toISOString(),
            },
          })
        );
      }
    }
  };

  addDocs("specificPlaces", preferences.specificPlaces);
  addDocs("cuisine", preferences.cuisinePreferences);
  addDocs("timing", preferences.timingPreferences);
  addDocs("budget", preferences.budgetNuances);
  addDocs("activity", preferences.activityPreferences);
  addDocs("avoidance", preferences.avoidances);
  addDocs("special", preferences.specialRequests);

  if (docs.length === 0) return 0;

  const embeddings = getEmbeddings();
  const pineconeIndex = getPineconeIndex();

  await PineconeStore.fromDocuments(docs, embeddings, {
    pineconeIndex,
    namespace: NAMESPACE,
    maxConcurrency: 5,
  });

  console.log(`Stored ${docs.length} preference vectors for user ${userId}`);
  return docs.length;
}

/**
 * Query Pinecone for user-specific preferences relevant to a destination/query.
 */
export async function getUserPreferences(
  userId: string,
  query: string,
  topK: number = 5
): Promise<string> {
  try {
    const embeddings = getEmbeddings();
    const pineconeIndex = getPineconeIndex();

    const store = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: NAMESPACE,
    });

    const docs = await store.similaritySearch(query, topK * 2);

    // Filter to this user's preferences only
    const userDocs = docs
      .filter((doc) => doc.metadata?.userId === userId)
      .slice(0, topK);

    if (userDocs.length === 0) return "";

    return userDocs.map((doc) => doc.pageContent).join("\n");
  } catch (error) {
    console.error("Error retrieving user preferences:", error);
    return "";
  }
}
