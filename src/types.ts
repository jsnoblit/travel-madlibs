import { ReactNode } from 'react';

export interface TravelQuery {
  tripIdea: string;
  travelCompanion: string;
  location: string;
  comingFrom: string;
  travelProfile?: string;
}

export interface Transportation {
  method: string;
  duration: string;
  description: string;
}

export interface BudgetEstimate {
  currency: string;
  budget: string;
  accommodationRange: string;
  mealCosts: string;
}

export interface Hotel {
  name: string;
  address: string;
  rating?: string;
  priceRange?: string;
  haiku: string; // A creative haiku explaining why this hotel was recommended
}

export interface Destination {
  name: string;
  region: string;
  description: string;
  bestTimeToVisit: string;
  highlights: string[];
  matchPercentage: number;
  transportation: Transportation;
  // Additional details for expanded view
  weatherInfo?: string;
  localCuisine?: string[];
  culturalNotes?: string;
  budgetEstimate?: BudgetEstimate;
  visaRequirements?: string;
  languages?: string[];
  hotels?: Hotel[];
}

export interface ApiResponse {
  destinations: Destination[];
  summary?: string;
  error?: string;
}