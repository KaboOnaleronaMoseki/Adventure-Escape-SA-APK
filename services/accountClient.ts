import { Platform } from 'react-native';

import type { ClientAccount } from './accountRepository';
import {
  clearAccountSession,
  readAccountProfile,
  readAccountSession,
  storeAccountSession,
} from './accountSessionStore';

export type { ClientAccount };
export { clearAccountSession, readAccountProfile, readAccountSession, storeAccountSession };

export interface AccountApiResponse {
  account?: ClientAccount;
  token?: string;
  verificationEmailSent?: boolean;
  message?: string;
  error?: string;
  code?: string;
}

export function accountApiUrl(path: string) {
  const baseUrl = process.env.EXPO_PUBLIC_BOOKING_API_URL?.replace(/\/+$/, '');
  if (baseUrl) return `${baseUrl}${path}`;
  if (Platform.OS === 'web') return path;
  throw new Error('The account API is not configured for this app build.');
}

export async function requestAccountApi(
  path: string,
  init: RequestInit = {},
): Promise<{ response: Response; body: AccountApiResponse }> {
  const response = await fetch(accountApiUrl(path), init);
  let body: AccountApiResponse;
  try {
    body = await response.json();
  } catch {
    throw new Error('The account service returned an invalid response.');
  }
  if (!body || typeof body !== 'object') {
    throw new Error('The account service returned an invalid response.');
  }
  return { response, body };
}
