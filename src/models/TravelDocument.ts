export interface TravelDocument {
  destination: string;
  country: string;
  description: string;
  activities: string[];
  tags: string[];
  bestSeason: string;
  budget?: string;
  climate?: string;
  reviews?: string[];
  popularity?: number;
  ratings?: number;
}
