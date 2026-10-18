import { afterEach, describe, expect, it, vi } from 'vitest';

import { POST } from '../app/accounts+api';

describe('account registration storage guarantees', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('does not create unverified accounts when the verification email service is missing', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('RESEND_FROM_EMAIL', '');
    vi.stubEnv('ACCOUNT_VERIFICATION_URL', '');

    const response = await POST(
      new Request('https://api.example.test/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test Customer',
          email: 'test@example.com',
          password: 'StrongPassword#2026',
        }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Account registration is temporarily unavailable because email verification is not configured.',
    });
  });

  it('returns HTTP 503 instead of creating a local account when PostgreSQL is unavailable', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('RESEND_API_KEY', 'test-only-placeholder');
    vi.stubEnv('RESEND_FROM_EMAIL', 'account@example.test');
    vi.stubEnv('ACCOUNT_VERIFICATION_URL', 'https://example.test/account.html');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await POST(
      new Request('https://api.example.test/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test Customer',
          email: `test-${Date.now()}@example.com`,
          password: 'StrongPassword#2026',
        }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: 'Account storage is unavailable. Please try again shortly.',
    });
  });
});
