import { afterEach, describe, expect, it, vi } from 'vitest';

import { sendBookingEmail } from './bookingEmailProvider';
import { Booking } from './bookingValidation';

const booking: Booking = {
  id: 'd2a47746-4e2a-4954-a143-15ce0a3bf4c6',
  status: 'pending',
  createdAt: '2026-10-18T03:00:00.000Z',
  customerName: 'Alex Customer',
  email: 'alex@example.com',
  phone: '021 555 0101',
  activityIds: ['kayaking'],
  activityDateTime: '2026-10-20T08:00:00.000Z',
  accommodationIds: ['cabins'],
  checkInDate: '2026-10-20',
  checkOutDate: '2026-10-21',
  notes: 'Vegetarian lunch, please.',
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('sendBookingEmail', () => {
  it('sends the booking details to the configured business recipient', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubEnv('RESEND_FROM_EMAIL', 'Bookings <bookings@example.com>');
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendBookingEmail(booking);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer re_test_key',
          'User-Agent': 'adventure-escape-sa/1.0.0',
        }),
      }),
    );
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload.to).toEqual(['Kaboonalerona7@gmail.com']);
    expect(payload.text).toContain('Alex Customer');
    expect(payload.text).toContain('Kayaking');
    expect(payload.text).toContain('Coastal Eco-Cabins');
    expect(payload.text).toContain('Vegetarian lunch, please.');
    expect(payload.text).toContain('20/10/2026 at 10:00 SAST');
  });

  it('fails explicitly when Resend rejects delivery', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubEnv('RESEND_FROM_EMAIL', 'Bookings <bookings@example.com>');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('invalid sender', { status: 422 })),
    );

    await expect(sendBookingEmail(booking)).rejects.toThrow('Resend rejected booking email (422)');
  });

  it('requires server-side Resend configuration', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('RESEND_FROM_EMAIL', '');

    await expect(sendBookingEmail(booking)).rejects.toThrow(
      'RESEND_API_KEY and RESEND_FROM_EMAIL are required',
    );
  });
});
