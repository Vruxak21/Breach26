import { Document } from '@langchain/core/documents';
import { TravelDocument } from '../../models/TravelDocument';

export class DocumentLoader {
  /**
   * Load JSON travel dataset and convert each into a LangChain Document.
   */
  public async loadDocuments(data: TravelDocument[]): Promise<Document[]> {
    return data.map((item) => {
      const pageContent = item.description || `Destination: ${item.destination}\nCountry: ${item.country}`;

      return new Document({
        pageContent,
        metadata: {
          destination: item.destination,
          country: item.country,
          activities: item.activities || [],
          tags: item.tags || [],
          bestSeason: item.bestSeason || '',
        },
      });
    });
  }
}
