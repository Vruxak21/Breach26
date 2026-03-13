import { Document } from '@langchain/core/documents';
import { DocumentLoader } from '../services/ingestion/documentLoader';
import { DocumentChunker } from '../services/ingestion/documentChunker';
import { EmbeddingService } from '../services/embeddings/embeddingService';
import { PineconeService } from '../services/vectorstore/pineconeService';
import type { TravelDocument } from '../models/TravelDocument';
import 'dotenv/config';

/**
 * Sample travel documents to ingest into Pinecone.
 * Replace or extend with your own data source (DB, API, files).
 */
const SAMPLE_TRAVEL_DATA: TravelDocument[] = [
  {
    destination: 'Bali',
    country: 'Indonesia',
    description: 'A tropical paradise famous for beaches, temples, and nightlife. Known for rice terraces in Ubud, surfing in Canggu, and spiritual retreats.',
    activities: ['surfing', 'temples', 'yoga', 'nightlife'],
    tags: ['tropical', 'beach', 'spiritual', 'affordable'],
    bestSeason: 'April–October',
  },
  {
    destination: 'Kyoto',
    country: 'Japan',
    description: 'A historic city with classical Buddhist temples, gardens, imperial palaces, and traditional geisha districts. Perfect for cultural immersion.',
    activities: ['sightseeing', 'temples', 'culture', 'food'],
    tags: ['historic', 'zen', 'culture', 'cherry blossoms'],
    bestSeason: 'March–May, October–November',
  },
  {
    destination: 'Santorini',
    country: 'Greece',
    description: 'Stunning volcanic island with white-washed buildings, blue domes, and dramatic sunsets. Ideal for honeymoons and photography.',
    activities: ['wine tasting', 'sunset views', 'beaches', 'hiking'],
    tags: ['romantic', 'island', 'luxury', 'mediterranean'],
    bestSeason: 'April–October',
  },
  {
    destination: 'Patagonia',
    country: 'Chile/Argentina',
    description: 'Wild landscapes with glaciers, mountains, and fjords. World-class trekking and adventure travel in Torres del Paine.',
    activities: ['hiking', 'glaciers', 'wildlife', 'trekking'],
    tags: ['adventure', 'nature', 'mountains', 'remote'],
    bestSeason: 'November–March',
  },
  {
    destination: 'Marrakech',
    country: 'Morocco',
    description: 'Vibrant medina with souks, riads, and gardens. Blend of Berber, Arab, and French influences. Famous for its cuisine and architecture.',
    activities: ['souks', 'riads', 'desert tours', 'food'],
    tags: ['cultural', 'desert', 'architecture', 'markets'],
    bestSeason: 'March–May, September–November',
  },
];

async function ingestRAG() {
  console.log('--- RAG Ingestion Pipeline ---');
  console.log('PINECONE_INDEX_NAME:', process.env.PINECONE_INDEX_NAME || 'travelmind-index (default)');
  console.log('HUGGINGFACE_API_KEY present:', !!process.env.HUGGINGFACE_API_KEY);
  console.log('PINECONE_API_KEY present:', !!process.env.PINECONE_API_KEY);
  console.log('');

  try {
    const documentLoader = new DocumentLoader();
    const chunker = new DocumentChunker();
    const embeddingService = new EmbeddingService();
    const pineconeService = new PineconeService();

    // 1. Load documents
    console.log('Step 1: Loading documents...');
    const rawDocs = await documentLoader.loadDocuments(SAMPLE_TRAVEL_DATA);
    console.log(`  Loaded ${rawDocs.length} documents`);

    // 2. Chunk documents (optional, improves retrieval for long content)
    console.log('Step 2: Chunking documents...');
    const chunks = await chunker.chunkDocuments(rawDocs);
    console.log(`  Created ${chunks.length} chunks`);

    // 3. Initialize Pinecone index
    console.log('Step 3: Ensuring Pinecone index exists...');
    await pineconeService.initializeIndex();

    // 4. Generate embeddings and store in Pinecone
    console.log('Step 4: Generating embeddings and storing in Pinecone...');
    const embeddings = embeddingService.getEmbeddings();
    await pineconeService.storeDocuments(chunks, embeddings);
    console.log(`  Stored ${chunks.length} vectors in Pinecone`);

    console.log('');
    console.log('--- INGESTION COMPLETE ---');
    console.log('You can verify in the Pinecone console: index stats should show the new vectors.');
    console.log('Run "bun run verify:rag" to test retrieval.');
  } catch (error: unknown) {
    console.error('--- INGESTION ERROR ---');
    console.error(error);
    process.exit(1);
  }
}

ingestRAG();
