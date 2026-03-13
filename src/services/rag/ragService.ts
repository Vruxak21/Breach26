import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RunnableSequence } from '@langchain/core/runnables';
import { RetrieverService } from '../retrieval/retrieverService';
import { EmbeddingService } from '../embeddings/embeddingService';
import { PineconeService } from '../vectorstore/pineconeService';
import { Document } from '@langchain/core/documents';

export class RagService {
  private llm: ChatGoogleGenerativeAI;

  constructor() {
    this.llm = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash', // High speed, free tier available
      temperature: 0,
      apiKey: process.env.GOOGLE_API_KEY || 'dummy-key-for-build',
    });
  }

  /**
   * Complete End-to-End RAG chain executing generation based on context
   */
  public async generateRecommendation(query: string): Promise<{ answer: string; sources: any[] }> {
    // 1. Initialize services
    const embeddingService = new EmbeddingService();
    const pineconeService = new PineconeService();
    const vectorStore = await pineconeService.getStore(embeddingService.getEmbeddings());
    const retrieverService = new RetrieverService(vectorStore);

    // 2. Retrieve relevant documents from Pinecone
    const documents = await retrieverService.retrieveDocuments(query, 5);

    // 3. Extract context from docs
    const context = documents.map((doc: Document) => doc.pageContent).join('\n\n---\n\n');

    // 4. Build prompt incorporating context
    const prompt = PromptTemplate.fromTemplate(`
You are a travel planning AI assistant.

Using the following travel information:

{context}

Answer the user's question:

{query}

Provide travel recommendations including destinations, activities, and best travel season.
    `);

    // 5. Connect the sequence (LangChain Expression Language LCEL)
    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      new StringOutputParser(),
    ]);

    // 6. Invoke the model
    const response = await chain.invoke({
      context,
      query,
    });

    return {
      answer: response,
      sources: documents.map((doc) => doc.metadata),
    };
  }
}
