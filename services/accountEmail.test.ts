import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  isAccountEmailConfigured,
  sendAccountVerificationEmail,
} from './accountEmail';

describe('account verification email configuration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('requires the separately hosted website URL for verification', () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubEnv('RESEND_FROM_EMAIL', 'verified@example.test');
    vi.stubEnv('ACCOUNT_VERIFICATION_URL', '');

    expect(isAccountEmailConfigured()).toBe(false);
  });

  it('sends verification links to the hosted account page', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubEnv('RESEND_FROM_EMAIL', 'verified@example.test');
    vi.stubEnv(
      'ACCOUNT_VERIFICATION_URL',
      'https://adventure-escape-website.onrender.com/account.html',
    );
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendAccountVerificationEmail(
      {
        id: 'account-id',
        fullName: 'Test Customer',
        email: 'customer@example.test',
        emailVerified: false,
      },
      'verification-token',
    );

    const request = fetchMock.mock.calls[0];
    const body = JSON.parse(request[1].body as string) as { text: string };
    expect(body.text).toContain(
      'https://adventure-escape-website.onrender.com/account.html?token=verification-token',
    );
  });
});
