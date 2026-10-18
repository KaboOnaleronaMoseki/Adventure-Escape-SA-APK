import { DateTime } from 'luxon';

import { BOOKING_TIME_ZONE, Booking } from './bookingValidation';

const BOOKING_NOTIFICATION_RECIPIENT = 'Kaboonalerona7@gmail.com';

const activityNames: Record<string, string> = {
  kayaking: 'Kayaking',
  ziplining: 'Ziplining',
  climbing: 'Rock Climbing',
  team: 'Team Challenges',
  hiking: 'Coastal Hiking & Fynbos Trail',
  snorkeling: 'Marine Snorkel Safari',
  sup: 'Stand-Up Paddleboarding (SUP)',
  fatbike: 'Fat Bike Dune Trail',
  caving: 'Caving & Grotto Exploration',
};

const accommodationNames: Record<string, string> = {
  cabins: 'Coastal Eco-Cabins',
  glamping: 'Canopy Glamping Tents',
  lodge: 'Cliffside Mountain Lodge',
  camp: 'Seaside Camp & Backpackers',
};

export function isBookingEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

function formatQuantities(
  ids: string[] | undefined,
  quantities: Record<string, number> | undefined,
  names: Record<string, string>,
) {
  if (!ids?.length) return 'None';
  return ids
    .map((id) => `${names[id] ?? id} × ${quantities?.[id] ?? 1}`)
    .join(', ');
}

function emailText(booking: Booking) {
  const activityDateTime = booking.activityDateTime
    ? DateTime.fromISO(booking.activityDateTime)
        .setZone(BOOKING_TIME_ZONE)
        .toFormat("dd/MM/yyyy 'at' HH:mm 'SAST'")
    : 'Not applicable';

  return [
    `Booking request ${booking.id}`,
    `Status: ${booking.status}`,
    '',
    `Customer: ${booking.customerName}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone ?? 'Not provided'}`,
    '',
    `Activities: ${formatQuantities(booking.activityIds, booking.activityQuantities, activityNames)}`,
    `Activity date and time: ${activityDateTime}`,
    `Accommodation: ${formatQuantities(
      booking.accommodationIds,
      booking.accommodationQuantities,
      accommodationNames,
    )}`,
    `Check-in: ${booking.checkInDate ?? 'Not applicable'}`,
    `Check-out: ${booking.checkOutDate ?? 'Not applicable'}`,
    ...(booking.pricing
      ? [
          '',
          `Estimated total: R${booking.pricing.total.toLocaleString('en-ZA')}`,
          `Activity discount: ${booking.pricing.discountPercent}%`,
        ]
      : []),
    '',
    `Notes: ${booking.notes?.trim() || 'None'}`,
  ].join('\n');
}

export async function sendBookingEmail(booking: Booking) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY and RESEND_FROM_EMAIL are required to send booking emails.');
  }

  const safeCustomerName = booking.customerName.replace(/[\r\n]+/g, ' ').trim();
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'adventure-escape-sa/1.0.0',
    },
    body: JSON.stringify({
      from,
      to: [BOOKING_NOTIFICATION_RECIPIENT],
      subject: `New booking request: ${safeCustomerName}`,
      text: emailText(booking),
    }),
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 500);
    throw new Error(`Resend rejected booking email (${response.status}): ${details}`);
  }
}
