import tuktuk from "@/assets/vehicle-tuktuk.jpg";
import suv from "@/assets/vehicle-suv.jpg";
import scooter from "@/assets/vehicle-scooter.jpg";
import villa from "@/assets/stay-villa.jpg";
import boutique from "@/assets/stay-boutique.jpg";
import bungalow from "@/assets/stay-bungalow.jpg";

export type ListingType = "vehicle" | "stay";

export type Listing = {
  id: string;
  type: ListingType;
  title: string;
  category: string;
  city: string;
  lat: number; // 0-100 normalized for our SVG map
  lng: number;
  geoLat: number; // real-world latitude
  geoLng: number; // real-world longitude
  pricePerDay: number;
  rating: number;
  reviews: number;
  image: string;
  host: string;
  verified: boolean;
  description: string;
};

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Colombo: { lat: 6.9271, lng: 79.8612 },
  Kandy:   { lat: 7.2906, lng: 80.6337 },
  Galle:   { lat: 6.0535, lng: 80.2210 },
  Ella:    { lat: 6.8667, lng: 81.0466 },
};

export const LISTINGS: Listing[] = [
  { id: "v1", type: "vehicle", title: "Coastal Tuk-Tuk", category: "Tuk-tuk", city: "Galle", lat: 78, lng: 28, geoLat: 6.0411, geoLng: 80.2170, pricePerDay: 25, rating: 4.9, reviews: 142, image: tuktuk, host: "Kasun P.", verified: true, description: "Iconic teal tuk-tuk perfect for breezy southern coast cruising." },
  { id: "v2", type: "vehicle", title: "Onyx Luxury SUV", category: "Luxury SUV", city: "Colombo", lat: 55, lng: 22, geoLat: 6.9350, geoLng: 79.8500, pricePerDay: 180, rating: 4.95, reviews: 87, image: suv, host: "Nimal R.", verified: true, description: "AMG-class SUV with chauffeur option for executive travel." },
  { id: "v3", type: "vehicle", title: "Sunset Scooter", category: "Scooter", city: "Ella", lat: 65, lng: 70, geoLat: 6.8720, geoLng: 81.0500, pricePerDay: 18, rating: 4.8, reviews: 203, image: scooter, host: "Tharindu S.", verified: true, description: "Nimble 125cc scooter — the freedom of the hills." },
  { id: "v4", type: "vehicle", title: "Hill Country Tuk", category: "Tuk-tuk", city: "Kandy", lat: 50, lng: 55, geoLat: 7.2950, geoLng: 80.6400, pricePerDay: 22, rating: 4.7, reviews: 91, image: tuktuk, host: "Roshan M.", verified: false, description: "Mountain-tuned three-wheeler ready for tea country roads." },
  { id: "s1", type: "stay", title: "Cliffside Infinity Villa", category: "Private Villa", city: "Galle", lat: 80, lng: 30, geoLat: 6.0220, geoLng: 80.2480, pricePerDay: 420, rating: 4.98, reviews: 64, image: villa, host: "Sanduni W.", verified: true, description: "Architect-designed villa with infinity pool over the Indian Ocean." },
  { id: "s2", type: "stay", title: "Colonial Heritage Suite", category: "Boutique Hotel", city: "Galle", lat: 76, lng: 32, geoLat: 6.0260, geoLng: 80.2170, pricePerDay: 220, rating: 4.85, reviews: 128, image: boutique, host: "Heritage Collection", verified: true, description: "Restored 1880s suite inside Galle Fort with garden access." },
  { id: "s3", type: "stay", title: "Misty Tea Bungalow", category: "Mountain Retreat", city: "Ella", lat: 62, lng: 72, geoLat: 6.8780, geoLng: 81.0560, pricePerDay: 165, rating: 4.92, reviews: 97, image: bungalow, host: "Asela G.", verified: true, description: "Wake to mist over endless tea fields and Adam's Peak views." },
  { id: "s4", type: "stay", title: "Temple District Loft", category: "Boutique Hotel", city: "Kandy", lat: 48, lng: 53, geoLat: 7.2935, geoLng: 80.6410, pricePerDay: 140, rating: 4.7, reviews: 55, image: boutique, host: "Lakmal D.", verified: false, description: "Walk to the Temple of the Tooth from this minimalist loft." },
];

export const CITIES = ["Colombo", "Kandy", "Galle", "Ella"] as const;
