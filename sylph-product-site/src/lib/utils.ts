import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a rating value to one decimal place
 * @param rating - Raw rating value (e.g., 3.7652175)
 * @returns Formatted rating string (e.g., "3.8")
 */
export function formatRating(rating: number): string {
  return (Math.round(rating * 10) / 10).toFixed(1);
}

/**
 * Hotel type code to full label mapping
 */
export const HOTEL_TYPE_LABELS: Record<string, string> = {
  "H": "Hotel",
  "Hotel": "Hotel",
  "C": "Condo/Apartment", 
  "Condo": "Condo/Apartment",
  "V": "Villa/Vacation Rental",
  "Villa": "Villa/Vacation Rental",
  "R": "Resort",
  "Resort": "Resort",
  "M": "Motel",
  "Motel": "Motel",
  "B": "Bed & Breakfast",
  "Bed & Breakfast": "Bed & Breakfast",
  "A": "Apartment",
  "Apartment": "Apartment",
  "G": "Guest House",
  "Guest House": "Guest House",
  "I": "Inn",
  "Inn": "Inn",
};

/**
 * Get hotel type label with fallback
 */
export function getHotelTypeLabel(type: string): string {
  return HOTEL_TYPE_LABELS[type] || type;
}

export function startCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
