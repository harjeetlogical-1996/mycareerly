export type Listing = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviews: number;
  images: string[];
  categories: string[];
  tags: string[];
  hours: { day: string; time: string; closed: boolean }[];
  open: boolean;
  verified: boolean;
  established: string;
  priceRange: "budget" | "mid" | "premium";
  deliveryAvailable: boolean;
  featured: boolean;
};

export const CITIES = [
  "All Cities",
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Diego",
  "Dallas",
  "San Francisco",
  "Seattle",
];

export const CATEGORIES = ["All", "Roses", "Orchids", "Tulips", "Lilies", "Sunflowers", "Bouquets", "Wedding", "Corporate", "Exotic"];

// All listings are seeded via prisma/seed-us.ts from app/data/us-listings.ts
export const listings: Listing[] = [];
