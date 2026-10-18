import { calculateBookingPricing } from './bookingPricing';

export const BOOKING_ACTIVITIES = [
  { id: 'kayaking', name: 'Kayaking', price: 450 },
  { id: 'ziplining', name: 'Ziplining', price: 550 },
  { id: 'climbing', name: 'Rock Climbing', price: 600 },
  { id: 'team', name: 'Team Challenges', price: 400 },
  { id: 'hiking', name: 'Coastal Hiking & Fynbos Trail', price: 350 },
  { id: 'snorkeling', name: 'Marine Snorkel Safari', price: 500 },
  { id: 'sup', name: 'Stand-Up Paddleboarding (SUP)', price: 380 },
  { id: 'fatbike', name: 'Fat Bike Dune Trail', price: 460 },
  { id: 'caving', name: 'Caving & Grotto Exploration', price: 520 },
] as const;

export const BOOKING_ACCOMMODATIONS = [
  { id: 'cabins', name: 'Coastal Eco-Cabins', price: 1250, unit: 'per cabin / night' },
  { id: 'glamping', name: 'Canopy Glamping Tents', price: 850, unit: 'per tent / night' },
  { id: 'lodge', name: 'Cliffside Mountain Lodge', price: 2400, unit: 'entire lodge / night' },
  { id: 'camp', name: 'Seaside Camp & Backpackers', price: 350, unit: 'per person / night' },
] as const;

export type BookingPricingSummary = ReturnType<typeof calculateBookingPricing>;

export function calculateBookingQuote(
  activityQuantities: Record<string, number>,
  accommodationQuantities: Record<string, number>,
): BookingPricingSummary {
  return calculateBookingPricing(
    BOOKING_ACTIVITIES,
    BOOKING_ACCOMMODATIONS,
    activityQuantities,
    accommodationQuantities,
  );
}

export function normalizeBookingQuantities(
  ids: string[] | undefined,
  quantities: Record<string, number> | undefined,
) {
  if (quantities) return quantities;
  return Object.fromEntries((ids ?? []).map((id) => [id, 1]));
}
