import { bookingRepository } from '../services/bookingRepository';
import { accountRepository } from '../services/accountRepository';
import { apiJson, apiOptions, apiOriginError } from '../services/apiResponse';
import {
  Booking,
  BookingRequest,
  validateBookingRequest,
} from '../services/bookingValidation';
import { dispatchPendingBookingEmails } from '../services/bookingEmail';

const ALLOW_SAME_DAY_CHECKOUT = process.env.ALLOW_SAME_DAY_CHECKOUT === 'true';

async function recordDeclinedAttempt(reason: string) {
  try {
    await bookingRepository.recordDeclinedAttempt(reason);
    return true;
  } catch (error) {
    console.error('Unable to persist the declined booking audit entry.', error);
    return false;
  }
}

export async function POST(request: Request) {
  const originError = apiOriginError(request);
  if (originError) return originError;

  let accountId: string | undefined;
  let accountProfile: Awaited<ReturnType<typeof accountRepository.findAccountForSession>> = null;
  const authorization = request.headers.get('authorization');
  if (authorization !== null) {
    const token = authorization.match(/^Bearer ([A-Za-z0-9_-]{40,})$/)?.[1];
    if (!token) {
      return apiJson(request, { error: 'Your account session is invalid. Sign in again.' }, {
        status: 401,
      });
    }
    try {
      accountProfile = await accountRepository.findAccountForSession(token);
    } catch (error) {
      console.error('Unable to verify booking account session.', error);
      return apiJson(request, { error: 'Account service is unavailable. Please try again shortly.' }, {
        status: 503,
      });
    }
    if (!accountProfile) {
      return apiJson(request, { error: 'Your account session has expired. Sign in again.' }, {
        status: 401,
      });
    }
    accountId = accountProfile.id;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const auditPersisted = await recordDeclinedAttempt('Malformed booking request body.');
    return apiJson(request,
      {
        errors: [{
          field: 'request',
          code: 'invalid_json',
          message: 'Booking details are invalid.',
        }],
        auditPersisted,
      },
      { status: 400 },
    );
  }

  const bodyRecord =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  const bookingInput =
    accountProfile && bodyRecord
      ? {
          ...bodyRecord,
          customerName: accountProfile.fullName,
          email: accountProfile.email,
          phone:
            typeof bodyRecord.phone === 'string' && bodyRecord.phone.trim()
              ? bodyRecord.phone
              : accountProfile.phone,
        }
      : body;
  const errors = validateBookingRequest(bookingInput, {
    allowSameDayCheckOut: ALLOW_SAME_DAY_CHECKOUT,
  });
  if (errors.length) {
    const reason = errors.some((error) => error.code === 'past_date')
      ? 'Attempted booking with a past date.'
      : errors[0].message;
    const auditPersisted = await recordDeclinedAttempt(reason);
    return apiJson(request, { errors, auditPersisted }, { status: 400 });
  }

  const bookingRequest = bookingInput as BookingRequest;
  let booking: Booking | null;
  try {
    booking = await bookingRepository.createIfAvailable(bookingRequest, accountId);
  } catch (error) {
    console.error('Unable to create the booking.', error);
    return apiJson(request,
      {
        error:
          'Booking storage is unavailable. Please verify the database connection and apply the required booking migrations. Your request was not submitted.',
        code: 'booking_storage_unavailable',
      },
      { status: 503 },
    );
  }
  if (!booking) {
    const auditPersisted = await recordDeclinedAttempt(
      'Attempted booking for an unavailable date.',
    );
    return apiJson(request,
      {
        errors: [{
          field: 'selection',
          code: 'unavailable',
          message: 'The selected date is no longer available. Please choose another date.',
        }],
        auditPersisted,
      },
      { status: 409 },
    );
  }

  let notificationStatus: 'sent' | 'queued' = 'queued';
  try {
    const delivery = await dispatchPendingBookingEmails();
    if (delivery.sentBookingIds.includes(booking.id)) {
      notificationStatus = 'sent';
    }
  } catch (error) {
    console.error('Unable to dispatch booking email notifications.', error);
  }

  return apiJson(request,
    {
      booking,
      emailNotification: {
        status: notificationStatus,
        recipient: 'Kaboonalerona7@gmail.com',
      },
    },
    { status: 201 },
  );
}

export async function OPTIONS(request: Request) {
  return apiOptions(request);
}
