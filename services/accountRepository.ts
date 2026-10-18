import { getDatabasePool } from './database';
import { hashOpaqueToken } from './accountSecurity';

export interface ClientAccount {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
}

export interface StoredClientAccount extends ClientAccount {
  passwordHash: string;
}

export function publicClientAccount(account: StoredClientAccount): ClientAccount {
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    ...(account.phone ? { phone: account.phone } : {}),
    emailVerified: account.emailVerified,
  };
}

interface AccountRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  emailVerifiedAt: Date | null;
}

const ACCOUNT_COLUMNS = `
  id,
  full_name AS "fullName",
  email,
  phone,
  password_hash AS "passwordHash",
  email_verified_at AS "emailVerifiedAt"
`;

function toStoredAccount(row: AccountRow): StoredClientAccount {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    ...(row.phone ? { phone: row.phone } : {}),
    emailVerified: row.emailVerifiedAt !== null,
    passwordHash: row.passwordHash,
  };
}

export const accountRepository = {
  async create(input: {
    id: string;
    fullName: string;
    email: string;
    normalizedEmail: string;
    phone?: string;
    passwordHash: string;
    verificationTokenHash: string;
    verificationExpiresAt: Date;
  }): Promise<StoredClientAccount> {
    const result = await getDatabasePool().query<AccountRow>(
      `INSERT INTO client_accounts (
        id, full_name, email, email_normalized, phone, password_hash,
        verification_token_hash, verification_expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING ${ACCOUNT_COLUMNS}`,
      [
        input.id,
        input.fullName,
        input.email,
        input.normalizedEmail,
        input.phone ?? null,
        input.passwordHash,
        input.verificationTokenHash,
        input.verificationExpiresAt,
      ],
    );
    return toStoredAccount(result.rows[0]);
  },

  async findByEmail(email: string): Promise<StoredClientAccount | null> {
    const result = await getDatabasePool().query<AccountRow>(
      `SELECT ${ACCOUNT_COLUMNS}
       FROM client_accounts
       WHERE email_normalized = $1`,
      [email],
    );
    return result.rows[0] ? toStoredAccount(result.rows[0]) : null;
  },

  async issueVerification(
    email: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<StoredClientAccount | null> {
    const result = await getDatabasePool().query<AccountRow>(
      `UPDATE client_accounts
       SET verification_token_hash = $2,
           verification_expires_at = $3
       WHERE email_normalized = $1
         AND email_verified_at IS NULL
       RETURNING ${ACCOUNT_COLUMNS}`,
      [email, tokenHash, expiresAt],
    );
    return result.rows[0] ? toStoredAccount(result.rows[0]) : null;
  },

  async verifyEmail(tokenHash: string): Promise<StoredClientAccount | null> {
    const result = await getDatabasePool().query<AccountRow>(
      `UPDATE client_accounts
       SET email_verified_at = now(),
           verification_token_hash = NULL,
           verification_expires_at = NULL
       WHERE verification_token_hash = $1
         AND verification_expires_at > now()
         AND email_verified_at IS NULL
       RETURNING ${ACCOUNT_COLUMNS}`,
      [tokenHash],
    );
    return result.rows[0] ? toStoredAccount(result.rows[0]) : null;
  },

  async createSession(accountId: string, token: string, expiresAt: Date): Promise<void> {
    await getDatabasePool().query(
      `INSERT INTO client_account_sessions (token_hash, account_id, expires_at)
       VALUES ($1, $2, $3)`,
      [hashOpaqueToken(token), accountId, expiresAt],
    );
  },

  async findAccountForSession(token: string): Promise<StoredClientAccount | null> {
    const result = await getDatabasePool().query<AccountRow>(
      `SELECT ${ACCOUNT_COLUMNS}
       FROM client_account_sessions AS sessions
       JOIN client_accounts AS accounts ON accounts.id = sessions.account_id
       WHERE sessions.token_hash = $1
         AND sessions.expires_at > now()
         AND sessions.revoked_at IS NULL
         AND accounts.email_verified_at IS NOT NULL`,
      [hashOpaqueToken(token)],
    );
    return result.rows[0] ? toStoredAccount(result.rows[0]) : null;
  },

  async revokeSession(token: string): Promise<void> {
    await getDatabasePool().query(
      `UPDATE client_account_sessions
       SET revoked_at = now()
       WHERE token_hash = $1
         AND revoked_at IS NULL`,
      [hashOpaqueToken(token)],
    );
  },
};
