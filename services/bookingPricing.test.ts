import { describe, expect, it } from 'vitest';

import { calculateBookingPricing } from './bookingPricing';

const activities = [
  { id: 'kayaking', price: 450 },
  { id: 'ziplining', price: 550 },
  { id: 'climbing', price: 600 },
  { id: 'team', price: 400 },
];
const accommodations = [{ id: 'cabins', price: 1250 }];

describe('calculateBookingPricing', () => {
  it.each([
    [{ kayaking: 1, ziplining: 1 }, 5],
    [{ kayaking: 1, ziplining: 1, climbing: 1 }, 10],
    [{ kayaking: 1, ziplining: 1, climbing: 1, team: 1 }, 15],
  ])('applies the tier for distinct activities', (activityQuantities, expectedDiscount) => {
    const summary = calculateBookingPricing(
      activities,
      accommodations,
      activityQuantities,
      {},
    );

    expect(summary.discountPercent).toBe(expectedDiscount);
    expect(summary.discountAmount).toBe(
      Math.round((summary.activitySubtotal * expectedDiscount) / 100),
    );
  });

  it('does not discount repeated quantities of one activity as a multi-activity booking', () => {
    const summary = calculateBookingPricing(
      activities,
      accommodations,
      { kayaking: 4 },
      {},
    );

    expect(summary.totalActivities).toBe(4);
    expect(summary.selectedActivityTypes).toBe(1);
    expect(summary.discountPercent).toBe(0);
    expect(summary.total).toBe(1800);
  });

  it('applies the activity discount without discounting accommodation', () => {
    const summary = calculateBookingPricing(
      activities,
      accommodations,
      { kayaking: 1, ziplining: 1 },
      { cabins: 1 },
    );

    expect(summary.activitySubtotal).toBe(1000);
    expect(summary.discountAmount).toBe(50);
    expect(summary.accommodationSubtotal).toBe(1250);
    expect(summary.total).toBe(2200);
  });
});
