import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bookingRepository } from './bookingRepository';

describe('bookingRepository requires persistent storage', () => {
  beforeEach(() => {
    vi.stubEnv('DATABASE_URL', '');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('does not report a booking when the database is missing, including in tests', async () => {
    await expect(
      bookingRepository.createIfAvailable({
        customerName: 'Test Customer',
        email: 'customer@example.com',
        activityIds: ['kayaking'],
        activityDateTime: '2026-10-25T10:00',
      }),
    ).rejects.toThrow('DATABASE_URL is required to use persistent application storage.');
  });

  it('does not silently discard declined-attempt audit entries without a database', async () => {
    await expect(
      bookingRepository.recordDeclinedAttempt('Invalid booking request'),
    ).rejects.toThrow('DATABASE_URL is required to use persistent application storage.');
  });
});
