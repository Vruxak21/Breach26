import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export class DocumentChunker {
  private splitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });
  }

  /**
   * Split documents into chunks for embedding
   */
  public async chunkDocuments(docs: Document[]): Promise<Document[]> {
    return await this.splitter.splitDocuments(docs);
  }
}
