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

export interface AccountRegistrationNotice {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
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
    const client = await getDatabasePool().connect();
    let transactionStarted = false;
    try {
      await client.query('BEGIN');
      transactionStarted = true;
      const result = await client.query<AccountRow>(
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
      const account = toStoredAccount(result.rows[0]);
      const notice: AccountRegistrationNotice = {
        id: account.id,
        fullName: account.fullName,
        email: account.email,
        ...(account.phone ? { phone: account.phone } : {}),
      };
      await client.query(
        `INSERT INTO account_registration_email_outbox (account_id, payload)
         VALUES ($1, $2::jsonb)`,
        [account.id, JSON.stringify(notice)],
      );
      await client.query('COMMIT');
      transactionStarted = false;
      return account;
    } catch (error) {
      if (transactionStarted) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('Unable to roll back account registration transaction.', rollbackError);
        }
      }
      throw error;
    } finally {
      client.release();
    }
  },

  async claimPendingRegistrationEmails(
    limit: number,
  ): Promise<{ accountId: string; payload: AccountRegistrationNotice }[]> {
    const result = await getDatabasePool().query<{
      accountId: string;
      payload: AccountRegistrationNotice;
    }>(
      `WITH candidates AS (
        SELECT account_id
        FROM account_registration_email_outbox
        WHERE status = 'pending'
          OR (
            status = 'sending'
            AND (locked_at IS NULL OR locked_at < now() - interval '5 minutes')
          )
        ORDER BY created_at
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE account_registration_email_outbox AS outbox
      SET status = 'sending', attempts = attempts + 1, locked_at = now()
      FROM candidates
      WHERE outbox.account_id = candidates.account_id
      RETURNING outbox.account_id AS "accountId", outbox.payload`,
      [Math.max(1, Math.min(Math.floor(limit), 50))],
    );
    return result.rows;
  },

  async markRegistrationEmailSent(accountId: string): Promise<void> {
    await getDatabasePool().query(
      `UPDATE account_registration_email_outbox
       SET status = 'sent', last_error = NULL, locked_at = NULL, sent_at = now()
       WHERE account_id = $1`,
      [accountId],
    );
  },

  async markRegistrationEmailPending(accountId: string, reason: string): Promise<void> {
    await getDatabasePool().query(
      `UPDATE account_registration_email_outbox
       SET status = 'pending', last_error = $2, locked_at = NULL
       WHERE account_id = $1`,
      [accountId, reason.slice(0, 1000)],
    );
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
