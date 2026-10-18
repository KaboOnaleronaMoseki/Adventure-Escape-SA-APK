CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text,
  notes text,
  activity_ids text[] NOT NULL DEFAULT '{}',
  activity_start_at timestamptz,
  accommodation_ids text[] NOT NULL DEFAULT '{}',
  check_in_date date,
  check_out_date date,
  CHECK (cardinality(activity_ids) = 0 OR activity_start_at IS NOT NULL),
  CHECK (cardinality(activity_ids) > 0 OR activity_start_at IS NULL),
  CHECK (cardinality(accommodation_ids) = 0 OR check_in_date IS NOT NULL),
  CHECK (cardinality(accommodation_ids) = 0 OR check_out_date IS NOT NULL),
  CHECK (cardinality(accommodation_ids) > 0 OR check_in_date IS NULL),
  CHECK (cardinality(accommodation_ids) > 0 OR check_out_date IS NULL),
  CHECK (check_out_date IS NULL OR check_out_date >= check_in_date),
  CHECK (cardinality(activity_ids) > 0 OR cardinality(accommodation_ids) > 0)
);

CREATE INDEX IF NOT EXISTS bookings_activity_start_idx
  ON bookings (activity_start_at)
  WHERE status IN ('pending', 'confirmed');

CREATE INDEX IF NOT EXISTS bookings_activity_ids_idx
  ON bookings USING gin (activity_ids);

CREATE INDEX IF NOT EXISTS bookings_accommodation_ids_idx
  ON bookings USING gin (accommodation_ids);

CREATE INDEX IF NOT EXISTS bookings_stay_dates_idx
  ON bookings (check_in_date, check_out_date)
  WHERE status IN ('pending', 'confirmed');

CREATE TABLE IF NOT EXISTS booking_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id uuid REFERENCES bookings (id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status = 'declined'),
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
