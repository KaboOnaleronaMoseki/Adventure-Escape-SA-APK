import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '../app/bookings+api';
import { accountRepository } from '../services/accountRepository';
import { bookingRepository } from '../services/bookingRepository';

vi.mock('../services/accountRepository', () => ({
  accountRepository: {
    findAccountForSession: vi.fn(),
  },
}));

vi.mock('../services/bookingRepository', () => ({
  bookingRepository: {
    listForCustomerAccount: vi.fn(),
  },
}));

describe('booking history GET API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requires a signed-in account', async () => {
    const response = await GET(new Request('https://api.example.test/bookings'));

    expect(response.status).toBe(401);
    expect(bookingRepository.listForCustomerAccount).not.toHaveBeenCalled();
  });

  it('returns only bookings associated with the validated account session', async () => {
    vi.mocked(accountRepository.findAccountForSession).mockResolvedValue({
      id: 'account-123',
      fullName: 'Test Customer',
      email: 'test@example.com',
      emailVerified: true,
      passwordHash: 'not-returned',
    });
    const bookings = [
      {
        id: 'booking-123',
        status: 'pending' as const,
        createdAt: '2026-11-04T10:00:00.000Z',
        customerName: 'Test Customer',
        email: 'test@example.com',
        activityIds: ['kayaking'],
        activityDateTime: '2026-11-08T10:00:00.000Z',
      },
    ];
    vi.mocked(bookingRepository.listForCustomerAccount).mockResolvedValue(bookings);

    const response = await GET(
      new Request('https://api.example.test/bookings', {
        headers: { Authorization: 'Bearer valid-session-token' },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ bookings });
    expect(bookingRepository.listForCustomerAccount).toHaveBeenCalledWith('account-123');
  });

  it('rejects expired sessions without querying booking history', async () => {
    vi.mocked(accountRepository.findAccountForSession).mockResolvedValue(null);

    const response = await GET(
      new Request('https://api.example.test/bookings', {
        headers: { Authorization: 'Bearer expired-session-token' },
      }),
    );

    expect(response.status).toBe(401);
    expect(bookingRepository.listForCustomerAccount).not.toHaveBeenCalled();
  });
});
