import { bookingRepository } from './bookingRepository';
import { isBookingEmailConfigured, sendBookingEmail } from './bookingEmailProvider';

export interface BookingEmailDispatchResult {
  sentBookingIds: string[];
  failed: number;
}

export async function dispatchPendingBookingEmails(
  batchSize = 10,
): Promise<BookingEmailDispatchResult> {
  if (!isBookingEmailConfigured()) {
    return { sentBookingIds: [], failed: 0 };
  }

  const notifications = await bookingRepository.claimPendingBookingEmails(batchSize);
  const sentBookingIds: string[] = [];
  let failed = 0;

  for (const notification of notifications) {
    try {
      await sendBookingEmail(notification.payload);
      await bookingRepository.markBookingEmailSent(notification.bookingId);
      sentBookingIds.push(notification.bookingId);
    } catch (error) {
      failed += 1;
      const reason = error instanceof Error ? error.message : 'Unknown email delivery failure.';
      await bookingRepository.markBookingEmailPending(notification.bookingId, reason);
      console.error(`Booking email ${notification.bookingId} remains queued.`, error);
    }
  }

  return { sentBookingIds, failed };
}
