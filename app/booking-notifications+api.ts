import { dispatchPendingBookingEmails } from '@/services/bookingEmail';
import { isBookingEmailConfigured } from '@/services/bookingEmailProvider';
import { dispatchPendingAccountRegistrationEmails } from '@/services/accountRegistrationEmail';
import { isAccountRegistrationEmailConfigured } from '@/services/accountEmail';

export async function POST(request: Request) {
  const expectedSecret = process.env.BOOKING_NOTIFICATION_CRON_SECRET;
  if (!expectedSecret) {
    return Response.json(
      { error: 'Booking notification retry is not configured.' },
      { status: 503 },
    );
  }

  if (request.headers.get('authorization') !== `Bearer ${expectedSecret}`) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!isBookingEmailConfigured() && !isAccountRegistrationEmailConfigured()) {
    return Response.json(
      { error: 'Email delivery is not configured.' },
      { status: 503 },
    );
  }

  try {
    const [bookings, accountRegistrations] = await Promise.all([
      dispatchPendingBookingEmails(50),
      dispatchPendingAccountRegistrationEmails(50),
    ]);
    return Response.json({
      ...bookings,
      sentAccountIds: accountRegistrations.sentAccountIds,
      failedAccountRegistrationEmails: accountRegistrations.failed,
    });
  } catch (error) {
    console.error('Unable to retry queued booking email notifications.', error);
    return Response.json(
      { error: 'Booking notification retry failed. Please try again later.' },
      { status: 503 },
    );
  }
}
