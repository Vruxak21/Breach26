import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

export const getPineconeClient = (): Pinecone => {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('PINECONE_API_KEY is not defined in environment variables');
      }
    }

    pineconeClient = new Pinecone({
      apiKey: apiKey || 'dummy-key-for-build',
    });
  }

  return pineconeClient!;
};
