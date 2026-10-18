import { DateTime } from 'luxon';
import { BOOKING_ACCOMMODATIONS, BOOKING_ACTIVITIES } from './bookingCatalog';

export const BOOKING_TIME_ZONE = 'Africa/Johannesburg';
export const PAST_DATE_MESSAGE =
  'Past dates cannot be booked. Please select today or a future date.';
export const ACTIVITY_CUTOFF_MESSAGE =
  'This activity must be booked at least 24 hours in advance. Please choose a later date or time.';
export const CHECKOUT_DATE_MESSAGE = 'Check-out must be at least one day after check-in.';

export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled';

export interface ValidationError {
  field: 'activityDateTime' | 'checkInDate' | 'checkOutDate' | 'customer' | 'selection';
  code: string;
  message: string;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  createdAt: string;
  customerAccountId?: string;
  customerName: string;
  email: string;
  phone?: string;
  notes?: string;
  activityIds?: string[];
  activityDateTime?: string;
  accommodationIds?: string[];
  checkInDate?: string;
  checkOutDate?: string;
  auditMessage?: string;
  activityQuantities?: Record<string, number>;
  accommodationQuantities?: Record<string, number>;
  pricing?: import('./bookingCatalog').BookingPricingSummary;
}

export interface ActivityBooking extends Booking {
  activityIds: string[];
  activityDateTime: string;
}

export interface AccommodationBooking extends Booking {
  accommodationIds: string[];
  checkInDate: string;
  checkOutDate: string;
}

export interface BookingRequest {
  customerName: string;
  email: string;
  phone?: string;
  notes?: string;
  activityIds?: string[];
  activityQuantities?: Record<string, number>;
  /** Local South African time formatted as yyyy-MM-dd'T'HH:mm. */
  activityDateTime?: string;
  accommodationIds?: string[];
  accommodationQuantities?: Record<string, number>;
  checkInDate?: string;
  checkOutDate?: string;
}

export interface BookingValidationOptions {
  now?: DateTime;
  allowSameDayCheckOut?: boolean;
}

const ACTIVITY_DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm";
const DATE_FORMAT = 'yyyy-MM-dd';
const ACTIVITY_ADVANCE_MILLISECONDS = 24 * 60 * 60 * 1000;

function businessNow(now?: DateTime) {
  return (now ?? DateTime.now()).setZone(BOOKING_TIME_ZONE);
}

function parseDate(value: unknown) {
  if (typeof value !== 'string') return null;
  const parsed = DateTime.fromFormat(value, DATE_FORMAT, {
    zone: BOOKING_TIME_ZONE,
    setZone: true,
  });
  return parsed.isValid && parsed.toFormat(DATE_FORMAT) === value ? parsed : null;
}

export function formatSouthAfricanDate(value: string) {
  const parsed = parseDate(value);
  return parsed?.toFormat('dd/MM/yyyy') ?? '';
}

export function todayInSouthAfrica(now?: DateTime) {
  return businessNow(now).toISODate()!;
}

export function validateBookingRequest(
  input: unknown,
  options: BookingValidationOptions = {},
): ValidationError[] {
  const errors: ValidationError[] = [];
  const now = businessNow(options.now);

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return [{ field: 'customer', code: 'invalid_request', message: 'Booking details are invalid.' }];
  }

  const request = input as Partial<BookingRequest>;
  if (
    typeof request.customerName !== 'string' ||
    !request.customerName.trim() ||
    typeof request.email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email.trim())
  ) {
    errors.push({
      field: 'customer',
      code: 'invalid_customer',
      message: 'Enter a valid name and email address.',
    });
  }

  const activityIds = request.activityIds;
  const accommodationIds = request.accommodationIds;
  if (
    (activityIds !== undefined &&
      (!Array.isArray(activityIds) ||
        activityIds.some((id) => typeof id !== 'string' || !id.trim()) ||
        new Set(activityIds).size !== activityIds.length)) ||
    (accommodationIds !== undefined &&
      (!Array.isArray(accommodationIds) ||
        accommodationIds.some((id) => typeof id !== 'string' || !id.trim()) ||
        new Set(accommodationIds).size !== accommodationIds.length))
  ) {
    errors.push({
      field: 'selection',
      code: 'invalid_selection',
      message: 'Selected activities or accommodation are invalid.',
    });
    return errors;
  }
  const invalidQuantities = (
    ids: string[] | undefined,
    quantities: unknown,
    catalogIds: readonly string[],
  ) => {
    if (quantities === undefined) return false;
    if (!quantities || typeof quantities !== 'object' || Array.isArray(quantities)) return true;
    const values = quantities as Record<string, unknown>;
    const entries = Object.entries(values);
    if (
      entries.some(
        ([id, quantity]) =>
          !catalogIds.includes(id) ||
          typeof quantity !== 'number' ||
          !Number.isSafeInteger(quantity) ||
          quantity < 1 ||
          quantity > 100,
      )
    ) {
      return true;
    }
    const idsFromQuantities = entries.map(([id]) => id).sort();
    return JSON.stringify(idsFromQuantities) !== JSON.stringify([...(ids ?? [])].sort());
  };
  if (
    invalidQuantities(
      activityIds,
      request.activityQuantities,
      BOOKING_ACTIVITIES.map(({ id }) => id),
    ) ||
    invalidQuantities(
      accommodationIds,
      request.accommodationQuantities,
      BOOKING_ACCOMMODATIONS.map(({ id }) => id),
    ) ||
    activityIds?.some((id) => !BOOKING_ACTIVITIES.some((activity) => activity.id === id)) ||
    accommodationIds?.some(
      (id) => !BOOKING_ACCOMMODATIONS.some((accommodation) => accommodation.id === id),
    )
  ) {
    errors.push({
      field: 'selection',
      code: 'invalid_quantities',
      message: 'Selected activity or accommodation quantities are invalid.',
    });
    return errors;
  }
  if (
    (request.phone !== undefined && typeof request.phone !== 'string') ||
    (request.notes !== undefined && typeof request.notes !== 'string')
  ) {
    errors.push({
      field: 'customer',
      code: 'invalid_contact_details',
      message: 'Contact details are invalid.',
    });
  }

  const hasActivities = Boolean(activityIds?.length);
  const hasAccommodation = Boolean(accommodationIds?.length);
  if (!hasActivities && !hasAccommodation) {
    errors.push({
      field: 'selection',
      code: 'missing_selection',
      message: 'Please select at least one activity or accommodation.',
    });
  }

  if (hasActivities || request.activityDateTime !== undefined) {
    const value = request.activityDateTime;
    const activityDateTime =
      typeof value === 'string'
        ? DateTime.fromFormat(value, ACTIVITY_DATE_TIME_FORMAT, {
            zone: BOOKING_TIME_ZONE,
            setZone: true,
          })
        : null;

    if (
      !activityDateTime?.isValid ||
      activityDateTime.toFormat(ACTIVITY_DATE_TIME_FORMAT) !== value
    ) {
      errors.push({
        field: 'activityDateTime',
        code: 'invalid_activity_date',
        message: 'Select a valid activity date and time.',
      });
    } else if (activityDateTime.startOf('day') < now.startOf('day')) {
      errors.push({
        field: 'activityDateTime',
        code: 'past_date',
        message: PAST_DATE_MESSAGE,
      });
    } else if (
      activityDateTime.toMillis() - now.toMillis() < ACTIVITY_ADVANCE_MILLISECONDS
    ) {
      errors.push({
        field: 'activityDateTime',
        code: 'activity_cutoff',
        message: ACTIVITY_CUTOFF_MESSAGE,
      });
    }
  }

  if (hasAccommodation || request.checkInDate !== undefined || request.checkOutDate !== undefined) {
    const checkIn = parseDate(request.checkInDate);
    const checkOut = parseDate(request.checkOutDate);

    if (!checkIn) {
      errors.push({
        field: 'checkInDate',
        code: 'invalid_check_in',
        message: 'Select a valid check-in date.',
      });
    } else if (checkIn.toISODate()! < now.toISODate()!) {
      errors.push({
        field: 'checkInDate',
        code: 'past_date',
        message: PAST_DATE_MESSAGE,
      });
    }

    if (!checkOut) {
      errors.push({
        field: 'checkOutDate',
        code: 'invalid_check_out',
        message: CHECKOUT_DATE_MESSAGE,
      });
    } else if (
      checkIn &&
      checkOut.toISODate()! <
        checkIn.plus({ days: options.allowSameDayCheckOut ? 0 : 1 }).toISODate()!
    ) {
      errors.push({
        field: 'checkOutDate',
        code: 'invalid_checkout_range',
        message: CHECKOUT_DATE_MESSAGE,
      });
    }
  }

  return errors;
}

export function toStoredActivityDateTime(value: string) {
  return DateTime.fromFormat(value, ACTIVITY_DATE_TIME_FORMAT, {
    zone: BOOKING_TIME_ZONE,
    setZone: true,
  })
    .toUTC()
    .toISO({ suppressMilliseconds: true });
}
