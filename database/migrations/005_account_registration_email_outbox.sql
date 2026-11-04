CREATE TABLE IF NOT EXISTS account_registration_email_outbox (
  account_id uuid PRIMARY KEY REFERENCES client_accounts (id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sending', 'sent')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  locked_at timestamptz,
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS account_registration_email_outbox_pending_idx
  ON account_registration_email_outbox (created_at)
  WHERE status = 'pending';