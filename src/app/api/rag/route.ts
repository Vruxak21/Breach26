import { NextRequest, NextResponse } from 'next/server';
import { RagService } from '../../../services/rag/ragService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is missing in request body' }, { status: 400 });
    }

    const ragService = new RagService();
    const result = await ragService.generateRecommendation(query);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('RAG Pipeline API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during travel recommendation generation.' },
      { status: 500 }
    );
  }
}
