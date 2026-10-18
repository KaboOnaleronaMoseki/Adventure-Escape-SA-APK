import type { ClientAccount } from './accountRepository';

const SESSION_KEY = 'adventure-escape-client-session';
const ACCOUNT_KEY = 'adventure-escape-client-profile';

export async function storeAccountSession(token: string, account: ClientAccount) {
  if (typeof window === 'undefined') throw new Error('Account sessions are unavailable on this page.');
  window.sessionStorage.setItem(SESSION_KEY, token);
  window.sessionStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
}

export async function readAccountSession() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(SESSION_KEY);
}

export async function readAccountProfile() {
  if (typeof window === 'undefined') return null;
  const stored = window.sessionStorage.getItem(ACCOUNT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as ClientAccount;
  } catch {
    window.sessionStorage.removeItem(ACCOUNT_KEY);
    return null;
  }
}

export async function clearAccountSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(ACCOUNT_KEY);
}
