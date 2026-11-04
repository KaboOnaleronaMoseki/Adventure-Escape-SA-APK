import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  sendAccountRegistrationEmail,
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
    expect(request[1].headers.Authorization).toBe('Bearer test-key');
    const body = JSON.parse(request[1].body as string) as { text: string };
    expect(body.text).toContain(
      'https://adventure-escape-website.onrender.com/account.html?token=verification-token',
    );
  });
});

describe('account registration notification email', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('sends only account contact details to the owner, never credentials or tokens', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key');
    vi.stubEnv('RESEND_FROM_EMAIL', 'verified@example.test');
    vi.stubEnv('ACCOUNT_NOTIFICATION_EMAIL', 'owner@example.test');
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const noticeWithUnexpectedSecrets = {
      id: 'account-id',
      fullName: 'Test Customer',
      email: 'customer@example.test',
      phone: '021 555 0101',
      password: 'secret-password-value',
      passwordHash: 'secret-password-hash-value',
      verificationToken: 'secret-verification-token-value',
      sessionToken: 'secret-session-token-value',
    };
    await sendAccountRegistrationEmail(noticeWithUnexpectedSecrets);

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string) as {
      to: string[];
      text: string;
    };
    expect(payload.to).toEqual(['owner@example.test']);
    expect(payload.text).toContain('customer@example.test');
    expect(payload.text).toContain('021 555 0101');
    expect(payload.text).not.toContain('secret-password-value');
    expect(payload.text).not.toContain('secret-password-hash-value');
    expect(payload.text).not.toContain('secret-verification-token-value');
    expect(payload.text).not.toContain('secret-session-token-value');
  });
});
