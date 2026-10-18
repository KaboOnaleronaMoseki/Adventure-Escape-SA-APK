CREATE TABLE IF NOT EXISTS client_accounts (
  id uuid PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  email_normalized text NOT NULL UNIQUE,
  phone text,
  password_hash text NOT NULL,
  email_verified_at timestamptz,
  verification_token_hash text,
  verification_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((verification_token_hash IS NULL) = (verification_expires_at IS NULL))
);

CREATE TABLE IF NOT EXISTS client_account_sessions (
  token_hash text PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES client_accounts (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);

CREATE INDEX IF NOT EXISTS client_account_sessions_account_idx
  ON client_account_sessions (account_id, expires_at)
  WHERE revoked_at IS NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS customer_account_id uuid
  REFERENCES client_accounts (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS bookings_customer_account_idx
  ON bookings (customer_account_id)
  WHERE customer_account_id IS NOT NULL;
