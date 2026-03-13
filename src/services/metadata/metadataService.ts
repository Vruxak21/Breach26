import { getDbPool } from '../../lib/config/postgres';
import { TravelDocument } from '../../models/TravelDocument';

export class MetadataService {
  public async initializeTable() {
    const pool = getDbPool();
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS vector;
      CREATE TABLE IF NOT EXISTS travel_metadata (
        id SERIAL PRIMARY KEY,
        destination VARCHAR(255) NOT NULL,
        country VARCHAR(255) NOT NULL,
        tags TEXT[],
        activities TEXT[],
        popularity INTEGER,
        ratings FLOAT
      );
    `);
  }

  /**
   * Bulk store metadata records cleanly to postgres
   */
  public async storeMetadata(docs: TravelDocument[]) {
    const pool = getDbPool();
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const doc of docs) {
        await client.query(
          `INSERT INTO travel_metadata (destination, country, tags, activities, popularity, ratings) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            doc.destination, 
            doc.country, 
            doc.tags || [], 
            doc.activities || [], 
            doc.popularity || 0, 
            doc.ratings || 0.0
          ]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Failed to store metadata:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}
