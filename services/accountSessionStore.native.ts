import * as SecureStore from 'expo-secure-store';

import type { ClientAccount } from './accountRepository';

const SESSION_KEY = 'adventure-escape-client-session';
const ACCOUNT_KEY = 'adventure-escape-client-profile';

export async function storeAccountSession(token: string, account: ClientAccount) {
  await SecureStore.setItemAsync(SESSION_KEY, token);
  await SecureStore.setItemAsync(ACCOUNT_KEY, JSON.stringify(account));
}

export async function readAccountSession() {
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function readAccountProfile() {
  const stored = await SecureStore.getItemAsync(ACCOUNT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as ClientAccount;
  } catch {
    await SecureStore.deleteItemAsync(ACCOUNT_KEY);
    return null;
  }
}

export async function clearAccountSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(SESSION_KEY),
    SecureStore.deleteItemAsync(ACCOUNT_KEY),
  ]);
}
