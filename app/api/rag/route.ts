import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query, userId } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    // Dynamically import to avoid build-time issues with heavy deps
    const { HuggingFaceInferenceEmbeddings } = await import(
      "@langchain/community/embeddings/hf"
    );
    const { PineconeStore } = await import("@langchain/pinecone");
    const { Pinecone } = await import("@pinecone-database/pinecone");
    const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
    const { PromptTemplate } = await import("@langchain/core/prompts");
    const { RunnableSequence } = await import("@langchain/core/runnables");
    const { StringOutputParser } = await import("@langchain/core/output_parsers");

    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: "sentence-transformers/all-mpnet-base-v2",
    });

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "travelmind-index");

    // 1. Retrieve general travel knowledge
    const travelStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: "travel-knowledge",
    });
    const travelDocs = await travelStore.similaritySearch(query, 5);
    const travelContext = travelDocs.map((doc) => doc.pageContent).join("\n\n---\n\n");

    // 2. Retrieve user-specific preferences (if userId provided)
    let userPrefsContext = "";
    if (userId) {
      try {
        const prefsStore = await PineconeStore.fromExistingIndex(embeddings, {
          pineconeIndex: index,
          namespace: "user-preferences",
        });
        const prefsDocs = await prefsStore.similaritySearch(query, 3);
        // Filter to only this user's preferences
        const userDocs = prefsDocs.filter((doc) => doc.metadata?.userId === userId);
        if (userDocs.length > 0) {
          userPrefsContext = userDocs.map((doc) => doc.pageContent).join("\n");
        }
      } catch {
        // User preferences namespace might not exist yet — that's fine
      }
    }

    // 3. Build prompt with both contexts and send through LLM
    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      temperature: 0,
      apiKey: process.env.GOOGLE_API_KEY || "dummy-key-for-build",
    });

    const prompt = PromptTemplate.fromTemplate(`
You are a travel planning AI assistant for TravelMind.

Using the following travel knowledge:

{travelContext}

{userPreferences}

Answer the user's question thoughtfully and provide actionable travel recommendations:

{query}

Include specific destinations, activities, best seasons, and budget tips where relevant.
    `);

    const chain = RunnableSequence.from([
      prompt,
      llm,
      new StringOutputParser(),
    ]);

    const response = await chain.invoke({
      travelContext: travelContext || "No specific travel data available.",
      userPreferences: userPrefsContext
        ? `Also consider these user preferences:\n${userPrefsContext}`
        : "",
      query,
    });

    return NextResponse.json({
      answer: response,
      sources: travelDocs.map((doc) => doc.metadata),
    });
  } catch (error) {
    console.error("RAG error:", error);
    // Return empty result instead of 500 — RAG is optional enrichment
    return NextResponse.json({ answer: "", sources: [] });
  }
}
