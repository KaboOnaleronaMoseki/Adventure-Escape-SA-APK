import { randomUUID } from 'node:crypto';

import { apiJson, apiOptions, apiOriginError } from '../services/apiResponse';
import {
  accountRepository,
  publicClientAccount,
} from '../services/accountRepository';
import {
  createOpaqueToken,
  hashAccountPassword,
  hashOpaqueToken,
  isValidAccountEmail,
  normalizeAccountEmail,
} from '../services/accountSecurity';
import {
  isAccountEmailConfigured,
  sendAccountVerificationEmail,
} from '../services/accountEmail';

const VERIFICATION_LIFETIME_MS = 24 * 60 * 60 * 1000;

interface RegistrationInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

function parseRegistration(input: unknown): RegistrationInput | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const body = input as Record<string, unknown>;
  if (
    typeof body.fullName !== 'string' ||
    body.fullName.trim().length < 2 ||
    body.fullName.trim().length > 100 ||
    typeof body.email !== 'string' ||
    !isValidAccountEmail(body.email.trim()) ||
    typeof body.password !== 'string' ||
    body.password.length < 12 ||
    body.password.length > 128 ||
    (body.phone !== undefined &&
      (typeof body.phone !== 'string' || body.phone.trim().length > 40))
  ) {
    return null;
  }
  return {
    fullName: body.fullName.trim(),
    email: body.email.trim(),
    ...(typeof body.phone === 'string' && body.phone.trim()
      ? { phone: body.phone.trim() }
      : {}),
    password: body.password,
  };
}

export async function OPTIONS(request: Request) {
  return apiOptions(request);
}

export async function POST(request: Request) {
  const originError = apiOriginError(request);
  if (originError) return originError;

  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return apiJson(request, { error: 'Account details must be valid JSON.' }, { status: 400 });
  }

  const registration = parseRegistration(input);
  if (!registration) {
    return apiJson(
      request,
      {
        error:
          'Enter your full name, a valid email, an optional phone number, and a password of 12 to 128 characters.',
      },
      { status: 400 },
    );
  }

  if (!isAccountEmailConfigured()) {
    return apiJson(
      request,
      { error: 'Account registration is temporarily unavailable because email verification is not configured.' },
      { status: 503 },
    );
  }

  const normalizedEmail = normalizeAccountEmail(registration.email);
  const verificationToken = createOpaqueToken();
  let account;
  try {
    account = await accountRepository.create({
      id: randomUUID(),
      fullName: registration.fullName,
      email: registration.email,
      normalizedEmail,
      phone: registration.phone,
      passwordHash: await hashAccountPassword(registration.password),
      verificationTokenHash: hashOpaqueToken(verificationToken),
      verificationExpiresAt: new Date(Date.now() + VERIFICATION_LIFETIME_MS),
    });
  } catch (error) {
    if (
      (error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === '23505')
    ) {
      return apiJson(
        request,
        { error: 'An account with this email already exists. Sign in or request a new verification email.' },
        { status: 409 },
      );
    }
    console.error('Unable to create the client account.', error);
    return apiJson(
      request,
      { error: 'Account storage is unavailable. Please try again shortly.' },
      { status: 503 },
    );
  }

  let verificationEmailSent = false;
  try {
    await sendAccountVerificationEmail(publicClientAccount(account), verificationToken);
    verificationEmailSent = true;
  } catch (error) {
    console.error('Client account created, but verification email could not be sent.', error);
  }

  return apiJson(
    request,
    {
      account: publicClientAccount(account),
      verificationEmailSent,
      message: verificationEmailSent
        ? 'Account created. Check your email to verify it before signing in.'
        : 'Account created, but the verification email could not be sent. Check the email service configuration and request another verification email.',
    },
    { status: 201 },
  );
}
