import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { Embeddings } from '@langchain/core/embeddings';
import { Document } from '@langchain/core/documents';
import { getPineconeClient } from '../../lib/config/pinecone';

export class PineconeService {
  private client: Pinecone;
  private indexName: string;

  constructor() {
    this.client = getPineconeClient();
    this.indexName = process.env.PINECONE_INDEX_NAME || 'travelmind-index';
  }

  public async initializeIndex() {
    try {
      // List existing indexes
      const existingIndexes = await this.client.listIndexes();
      const indexExists = existingIndexes?.indexes?.some(idx => idx.name === this.indexName);
      
      if (!indexExists) {
        // Create an index if it does not exist
        await this.client.createIndex({
          name: this.indexName,
          dimension: 768, // text-embedding-004 size
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1',
            },
          },
        });
      }
    } catch (error) {
      console.error('Error initializing Pinecone index:', error);
      throw error;
    }
  }

  public async storeDocuments(docs: Document[], embeddings: Embeddings) {
    const pineconeIndex = this.client.Index(this.indexName);
    
    // Upload documents and their embeddings efficiently into Pinecone
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });
  }

  public async getStore(embeddings: Embeddings): Promise<PineconeStore> {
    const pineconeIndex = this.client.Index(this.indexName);
    return await PineconeStore.fromExistingIndex(embeddings, { pineconeIndex });
  }
}
