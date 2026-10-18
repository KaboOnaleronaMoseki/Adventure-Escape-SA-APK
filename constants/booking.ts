import { ImageSourcePropType } from 'react-native';
import { BOOKING_ACCOMMODATIONS, BOOKING_ACTIVITIES } from '@/services/bookingCatalog';
import { calculateBookingPricing } from '@/services/bookingPricing';

export type PricedOption = {
  id: string;
  name: string;
  price: number;
  image: ImageSourcePropType;
};

const activityImages: Record<string, ImageSourcePropType> = {
  kayaking: require('../assets/site-images/kayaking1.png'),
  ziplining: require('../assets/site-images/Ziplining2.png'),
  climbing: require('../assets/site-images/rock-climbing1.png'),
  team: require('../assets/site-images/Group-design.png'),
  hiking: require('../assets/site-images/coastal-trail.png'),
  snorkeling: require('../assets/site-images/water-adventure.png'),
  sup: require('../assets/site-images/paddleboarding-sunset.png'),
  fatbike: require('../assets/site-images/fat-bike-dunes.png'),
  caving: require('../assets/site-images/caving-adventure.png'),
};

export const activities: PricedOption[] = BOOKING_ACTIVITIES.map((activity) => ({
  ...activity,
  image: activityImages[activity.id],
}));

const accommodationImages: Record<string, ImageSourcePropType> = {
  cabins: require('../assets/site-images/coastal-eco-cabin.png'),
  glamping: require('../assets/site-images/canopy-glamping.png'),
  lodge: require('../assets/site-images/mountain-lodge-fireplace.png'),
  camp: require('../assets/site-images/glamping-campsite.png'),
};

export const accommodations: (PricedOption & { unit: string })[] = BOOKING_ACCOMMODATIONS.map(
  (accommodation) => ({
    ...accommodation,
    image: accommodationImages[accommodation.id],
  }),
);

export function calculateBooking(
  activityQuantities: Record<string, number>,
  accommodationQuantities: Record<string, number>,
) {
  return calculateBookingPricing(
    activities,
    accommodations,
    activityQuantities,
    accommodationQuantities,
  );
}

export function formatRand(amount: number) {
  return `R${amount.toLocaleString('en-ZA')}`;
}
