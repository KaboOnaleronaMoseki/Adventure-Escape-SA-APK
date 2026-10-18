import { apiJson, apiOptions, apiOriginError } from '../services/apiResponse';
import { accountRepository, publicClientAccount } from '../services/accountRepository';
import {
  isAccountEmailConfigured,
  sendAccountVerificationEmail,
} from '../services/accountEmail';
import {
  createOpaqueToken,
  hashOpaqueToken,
  isValidAccountEmail,
  normalizeAccountEmail,
} from '../services/accountSecurity';

const VERIFICATION_LIFETIME_MS = 24 * 60 * 60 * 1000;

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function OPTIONS(request: Request) {
  return apiOptions(request);
}

export async function POST(request: Request) {
  const originError = apiOriginError(request);
  if (originError) return originError;

  const input = await readJson(request);
  if (!input || typeof input !== 'object' || typeof input.token !== 'string') {
    return apiJson(request, { error: 'A valid verification link is required.' }, { status: 400 });
  }

  try {
    const account = await accountRepository.verifyEmail(hashOpaqueToken(input.token));
    if (!account) {
      return apiJson(
        request,
        { error: 'This verification link is invalid or expired. Request a new one.' },
        { status: 400 },
      );
    }
    return apiJson(request, {
      account: publicClientAccount(account),
      message: 'Email verified. You can now sign in.',
    });
  } catch (error) {
    console.error('Unable to verify the client account email.', error);
    return apiJson(request, { error: 'Account storage is unavailable. Please try again shortly.' }, {
      status: 503,
    });
  }
}

export async function PUT(request: Request) {
  const originError = apiOriginError(request);
  if (originError) return originError;

  const input = await readJson(request);
  const email =
    input && typeof input === 'object' && 'email' in input && typeof input.email === 'string'
      ? input.email.trim()
      : '';
  if (!isValidAccountEmail(email)) {
    return apiJson(request, { error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (!isAccountEmailConfigured()) {
    return apiJson(
      request,
      { error: 'Email verification is not configured. Please try again later.' },
      { status: 503 },
    );
  }

  try {
    const token = createOpaqueToken();
    const account = await accountRepository.issueVerification(
      normalizeAccountEmail(email),
      hashOpaqueToken(token),
      new Date(Date.now() + VERIFICATION_LIFETIME_MS),
    );
    if (account) {
      try {
        await sendAccountVerificationEmail(publicClientAccount(account), token);
      } catch (error) {
        console.error('Unable to resend client account verification email.', error);
        return apiJson(
          request,
          { error: 'The verification email could not be sent. Please try again shortly.' },
          { status: 503 },
        );
      }
    }
    return apiJson(request, {
      message: 'If the account exists and is not verified, a new verification email will be sent.',
    });
  } catch (error) {
    console.error('Unable to issue a client account verification link.', error);
    return apiJson(request, { error: 'Account storage is unavailable. Please try again shortly.' }, {
      status: 503,
    });
  }
}
