import { describe, expect, it } from 'vitest';

import {
  calculateBookingQuote,
  normalizeBookingQuantities,
} from './bookingCatalog';

describe('booking catalog quotes', () => {
  it('calculates the server-side quote from item quantities and automatic discounts', () => {
    const quote = calculateBookingQuote(
      { kayaking: 2, ziplining: 1 },
      { cabins: 2 },
    );

    expect(quote).toEqual({
      totalActivities: 3,
      selectedActivityTypes: 2,
      activitySubtotal: 1450,
      discountPercent: 5,
      discountAmount: 73,
      accommodationCount: 2,
      accommodationSubtotal: 2500,
      total: 3877,
    });
  });

  it('defaults quantities to one for older clients that only send item ids', () => {
    expect(normalizeBookingQuantities(['kayaking', 'ziplining'], undefined)).toEqual({
      kayaking: 1,
      ziplining: 1,
    });
  });
});
