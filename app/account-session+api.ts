import { apiEmpty, apiJson, apiOptions, apiOriginError } from '../services/apiResponse';
import { accountRepository, publicClientAccount } from '../services/accountRepository';
import {
  createOpaqueToken,
  hashAccountPassword,
  normalizeAccountEmail,
  verifyAccountPassword,
} from '../services/accountSecurity';

const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

function bearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer ([A-Za-z0-9_-]{40,})$/);
  return match?.[1] ?? null;
}

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
  if (
    !input ||
    typeof input !== 'object' ||
    !('email' in input) ||
    typeof input.email !== 'string' ||
    !('password' in input) ||
    typeof input.password !== 'string' ||
    input.password.length > 128
  ) {
    return apiJson(request, { error: 'Enter your email address and password.' }, { status: 400 });
  }

  try {
    const email = normalizeAccountEmail(input.email);
    const account = await accountRepository.findByEmail(email);
    if (!account) {
      await hashAccountPassword('not-a-real-account-password');
      return apiJson(request, { error: 'Email address or password is incorrect.' }, { status: 401 });
    }
    if (!(await verifyAccountPassword(input.password, account.passwordHash))) {
      return apiJson(request, { error: 'Email address or password is incorrect.' }, { status: 401 });
    }
    if (!account.emailVerified) {
      return apiJson(
        request,
        {
          error: 'Verify your email before signing in.',
          code: 'email_not_verified',
        },
        { status: 403 },
      );
    }

    const token = createOpaqueToken();
    await accountRepository.createSession(
      account.id,
      token,
      new Date(Date.now() + SESSION_LIFETIME_MS),
    );
    return apiJson(request, {
      account: publicClientAccount(account),
      token,
      expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS).toISOString(),
    });
  } catch (error) {
    console.error('Unable to sign in to the client account.', error);
    return apiJson(request, { error: 'Account service is unavailable. Please try again shortly.' }, {
      status: 503,
    });
  }
}

export async function GET(request: Request) {
  const originError = apiOriginError(request);
  if (originError) return originError;

  const token = bearerToken(request);
  if (!token) {
    return apiJson(request, { error: 'Sign in to access this account.' }, { status: 401 });
  }
  try {
    const account = await accountRepository.findAccountForSession(token);
    if (!account) {
      return apiJson(request, { error: 'Your account session has expired. Sign in again.' }, {
        status: 401,
      });
    }
    return apiJson(request, { account: publicClientAccount(account) });
  } catch (error) {
    console.error('Unable to load the client account session.', error);
    return apiJson(request, { error: 'Account service is unavailable. Please try again shortly.' }, {
      status: 503,
    });
  }
}

export async function DELETE(request: Request) {
  const originError = apiOriginError(request);
  if (originError) return originError;

  const token = bearerToken(request);
  if (token) {
    try {
      await accountRepository.revokeSession(token);
    } catch (error) {
      console.error('Unable to revoke the client account session.', error);
      return apiJson(request, { error: 'Account service is unavailable. Please try again shortly.' }, {
        status: 503,
      });
    }
  }
  return apiEmpty(request);
}
