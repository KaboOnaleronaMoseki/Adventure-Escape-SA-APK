import { ClientAccount } from './accountRepository';

export function isAccountEmailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY &&
      process.env.RESEND_FROM_EMAIL &&
      verificationPageUrl(),
  );
}

function verificationPageUrl() {
  return process.env.ACCOUNT_VERIFICATION_URL || undefined;
}

export async function sendAccountVerificationEmail(account: ClientAccount, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const verificationUrl = verificationPageUrl();
  if (!apiKey || !from || !verificationUrl) {
    throw new Error(
      'RESEND_API_KEY, RESEND_FROM_EMAIL, and ACCOUNT_VERIFICATION_URL are required for account verification.',
    );
  }

  const link = new URL(verificationUrl);
  if (link.protocol !== 'https:' && link.hostname !== 'localhost') {
    throw new Error('ACCOUNT_VERIFICATION_URL must use HTTPS outside localhost.');
  }
  link.searchParams.set('token', token);
  const name = account.fullName.replace(/[\r\n]+/g, ' ').trim();

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
    headers: {
      Authorization: `******`,
      'Content-Type': 'application/json',
      'User-Agent': 'adventure-escape-sa/1.0.0',
    },
    body: JSON.stringify({
      from,
      to: [account.email],
      subject: 'Verify your Adventure Escape SA account',
      text: [
        `Hi ${name},`,
        '',
        'Please verify your Adventure Escape SA account by opening this link:',
        link.toString(),
        '',
        'This link expires in 24 hours. If you did not create the account, you can ignore this email.',
      ].join('\n'),
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend rejected account verification email (${response.status}).`);
  }
}
