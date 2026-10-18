import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import {
  ACTIVITY_CUTOFF_MESSAGE,
  BOOKING_TIME_ZONE,
  CHECKOUT_DATE_MESSAGE,
  PAST_DATE_MESSAGE,
  validateBookingRequest,
} from './bookingValidation';

const now = DateTime.fromISO('2026-10-13T12:00:00', { zone: BOOKING_TIME_ZONE });

function activityRequest(activityDateTime: string) {
  return {
    customerName: 'Sam Example',
    email: 'sam@example.com',
    activityIds: ['kayaking'],
    activityDateTime,
  };
}

describe('validateBookingRequest', () => {
  it('rejects a past activity date', () => {
    const errors = validateBookingRequest(activityRequest('2026-10-12T13:00'), { now });
    expect(errors.map((error) => error.message)).toContain(PAST_DATE_MESSAGE);
  });

  it('allows accommodation check-in today in South African time', () => {
    const errors = validateBookingRequest({
      customerName: 'Sam Example',
      email: 'sam@example.com',
      accommodationIds: ['cabins'],
      checkInDate: '2026-10-13',
      checkOutDate: '2026-10-14',
    }, { now });
    expect(errors).toEqual([]);
  });

  it('accepts tomorrow when the activity is exactly 24 hours away', () => {
    const errors = validateBookingRequest(activityRequest('2026-10-14T12:00'), { now });
    expect(errors).toEqual([]);
  });

  it('rejects an activity inside the 24-hour cutoff', () => {
    const errors = validateBookingRequest(activityRequest('2026-10-14T11:59'), { now });
    expect(errors.map((error) => error.message)).toContain(ACTIVITY_CUTOFF_MESSAGE);
  });

  it('rejects checkout on the same day as check-in', () => {
    const errors = validateBookingRequest({
      customerName: 'Sam Example',
      email: 'sam@example.com',
      accommodationIds: ['cabins'],
      checkInDate: '2026-10-14',
      checkOutDate: '2026-10-14',
    }, { now });
    expect(errors.map((error) => error.message)).toContain(CHECKOUT_DATE_MESSAGE);
  });

  it('allows same-day checkout only when explicitly enabled', () => {
    const errors = validateBookingRequest({
      customerName: 'Sam Example',
      email: 'sam@example.com',
      accommodationIds: ['cabins'],
      checkInDate: '2026-10-14',
      checkOutDate: '2026-10-14',
    }, { now, allowSameDayCheckOut: true });
    expect(errors).toEqual([]);
  });

  it('rejects malformed or missing accommodation dates', () => {
    const errors = validateBookingRequest({
      customerName: 'Sam Example',
      email: 'sam@example.com',
      accommodationIds: ['cabins'],
      checkInDate: '14/10/2026',
    }, { now });
    expect(errors.map((error) => error.field)).toContain('checkInDate');
    expect(errors.map((error) => error.field)).toContain('checkOutDate');
  });

  it('rejects quantities that do not match the selected catalog items', () => {
    const errors = validateBookingRequest({
      ...activityRequest('2026-10-14T12:00'),
      activityQuantities: { kayaking: 2, ziplining: 1 },
    }, { now });
    expect(errors.map((error) => error.code)).toContain('invalid_quantities');
  });

  it('rejects zero, negative, or excessive quantities', () => {
    for (const quantity of [0, -1, 101]) {
      const errors = validateBookingRequest({
        ...activityRequest('2026-10-14T12:00'),
        activityQuantities: { kayaking: quantity },
      }, { now });
      expect(errors.map((error) => error.code)).toContain('invalid_quantities');
    }
  });
});
