import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

export class EmbeddingService {
  private embeddings: HuggingFaceInferenceEmbeddings;

  constructor() {
    this.embeddings = new HuggingFaceInferenceEmbeddings({
      model: "sentence-transformers/all-mpnet-base-v2",
      apiKey: process.env.HUGGINGFACE_API_KEY,
    });
  }

  public getEmbeddings() {
    return this.embeddings;
  }

  /**
   * Generate embeddings for a batch of strings
   */
  public async embedDocuments(texts: string[]): Promise<number[][]> {
    return await this.embeddings.embedDocuments(texts);
  }

  /**
   * Generate embedding for a single query string
   */
  public async embedQuery(query: string): Promise<number[]> {
    return await this.embeddings.embedQuery(query);
  }
}