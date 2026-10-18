export interface PricedBookingItem {
  id: string;
  price: number;
}

export function calculateBookingPricing(
  activities: readonly PricedBookingItem[],
  accommodations: readonly PricedBookingItem[],
  activityQuantities: Record<string, number>,
  accommodationQuantities: Record<string, number>,
) {
  const selectedActivityTypes = activities.filter(
    (activity) => (activityQuantities[activity.id] ?? 0) > 0,
  ).length;
  const totalActivities = activities.reduce(
    (total, activity) => total + (activityQuantities[activity.id] ?? 0),
    0,
  );
  const activitySubtotal = activities.reduce(
    (total, activity) =>
      total + activity.price * (activityQuantities[activity.id] ?? 0),
    0,
  );
  const discountPercent =
    selectedActivityTypes >= 4
      ? 15
      : selectedActivityTypes === 3
        ? 10
        : selectedActivityTypes === 2
          ? 5
          : 0;
  const discountAmount = Math.round((activitySubtotal * discountPercent) / 100);
  const accommodationCount = accommodations.reduce(
    (total, accommodation) => total + (accommodationQuantities[accommodation.id] ?? 0),
    0,
  );
  const accommodationSubtotal = accommodations.reduce(
    (total, accommodation) =>
      total + accommodation.price * (accommodationQuantities[accommodation.id] ?? 0),
    0,
  );

  return {
    totalActivities,
    selectedActivityTypes,
    activitySubtotal,
    discountPercent,
    discountAmount,
    accommodationCount,
    accommodationSubtotal,
    total: activitySubtotal - discountAmount + accommodationSubtotal,
  };
}
