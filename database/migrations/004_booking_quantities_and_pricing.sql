ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS activity_quantities jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS accommodation_quantities jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS pricing jsonb;
