import { describe, expect, it } from 'vitest';

import {
  createOpaqueToken,
  hashAccountPassword,
  hashOpaqueToken,
  normalizeAccountEmail,
  verifyAccountPassword,
} from './accountSecurity';

describe('account security', () => {
  it('hashes passwords and verifies the original without storing plaintext', async () => {
    const password = 'AdventureEscape#2026';
    const hash = await hashAccountPassword(password);

    expect(hash).not.toContain(password);
    await expect(verifyAccountPassword(password, hash)).resolves.toBe(true);
    await expect(verifyAccountPassword('wrong-password', hash)).resolves.toBe(false);
  });

  it('creates random one-time tokens and stores only a stable token digest', () => {
    const first = createOpaqueToken();
    const second = createOpaqueToken();

    expect(first).not.toBe(second);
    expect(hashOpaqueToken(first)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashOpaqueToken(first)).not.toBe(first);
  });

  it('normalizes email addresses for case-insensitive account identity', () => {
    expect(normalizeAccountEmail('  Guest@Example.COM ')).toBe('guest@example.com');
  });
});
