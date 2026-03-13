import { PineconeStore } from '@langchain/pinecone';
import { Document } from '@langchain/core/documents';

export class RetrieverService {
  private vectorStore: PineconeStore;

  constructor(vectorStore: PineconeStore) {
    this.vectorStore = vectorStore;
  }

  /**
   * Retrieve relevant documents using similarity search
   */
  public async retrieveDocuments(query: string, topK: number = 5): Promise<Document[]> {
    // PineconeStore can behave as a Retriever directly
    const retriever = this.vectorStore.asRetriever({ k: topK });
    return await retriever.invoke(query);
  }
}
