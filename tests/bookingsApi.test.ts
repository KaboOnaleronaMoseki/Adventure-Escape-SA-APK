import { DateTime } from 'luxon';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from '../app/bookings+api';

describe('booking POST storage guarantees', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns HTTP 503 instead of claiming a booking was saved without PostgreSQL', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', '');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const activityDateTime = DateTime.now()
      .setZone('Africa/Johannesburg')
      .plus({ days: 3 })
      .set({ hour: 12, minute: 0, second: 0, millisecond: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm");

    const response = await POST(
      new Request('https://api.example.test/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Test Customer',
          email: 'test@example.com',
          activityIds: ['kayaking'],
          activityDateTime,
        }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: 'booking_storage_unavailable',
    });
  });

  it('does not return a saved booking when persistent storage is unavailable in test mode', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('DATABASE_URL', '');
    const activityDateTime = DateTime.now()
      .setZone('Africa/Johannesburg')
      .plus({ days: 4 })
      .set({ hour: 12, minute: 0, second: 0, millisecond: 0 })
      .toFormat("yyyy-MM-dd'T'HH:mm");

    const response = await POST(
      new Request('https://api.example.test/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Test Customer',
          email: 'test@example.com',
          activityIds: ['kayaking', 'ziplining'],
          activityQuantities: { kayaking: 2, ziplining: 1 },
          activityDateTime,
        }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: 'booking_storage_unavailable',
    });
  });
});
