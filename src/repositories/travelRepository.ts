import { MetadataService } from '../services/metadata/metadataService';

export class TravelRepository {
  private metadataService: MetadataService;

  constructor() {
    this.metadataService = new MetadataService();
  }

  /**
   * Initialize resources needed for travel repository
   */
  public async init() {
    await this.metadataService.initializeTable();
  }

  // Abstract further complex query behaviors and cross-repository joins here
}
