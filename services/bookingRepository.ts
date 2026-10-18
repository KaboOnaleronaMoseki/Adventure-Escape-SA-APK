import { DateTime } from 'luxon';
import { randomUUID } from 'node:crypto';
import { PoolClient } from 'pg';

import { getDatabasePool } from './database';
import {
  BookingPricingSummary,
  calculateBookingQuote,
  normalizeBookingQuantities,
} from './bookingCatalog';
import {
  Booking,
  BookingRequest,
  BOOKING_TIME_ZONE,
  toStoredActivityDateTime,
} from './bookingValidation';

export interface BookingRepository {
  createIfAvailable(request: BookingRequest, customerAccountId?: string): Promise<Booking | null>;
  recordDeclinedAttempt(reason: string): Promise<void>;
  claimPendingBookingEmails(
    limit: number,
  ): Promise<{ bookingId: string; payload: Booking }[]>;
  markBookingEmailSent(bookingId: string): Promise<void>;
  markBookingEmailPending(bookingId: string, reason: string): Promise<void>;
}

type BookingRow = {
  id: string;
  status: Booking['status'];
  createdAt: Date;
  customerAccountId: string | null;
  activityQuantities: Record<string, number>;
  accommodationQuantities: Record<string, number>;
  pricing: BookingPricingSummary | null;
  customerName: string;
  email: string;
  phone: string | null;
  notes: string | null;
  activityIds: string[];
  activityDateTime: Date | null;
  accommodationIds: string[];
  checkInDate: string | null;
  checkOutDate: string | null;
};

type BookingEmailRow = {
  bookingId: string;
  payload: Booking;
};

function generateUuid(): string {
  return randomUUID();
}

function lockKeys(request: BookingRequest) {
  const keys = new Set<string>();
  if (request.activityDateTime) {
    const startsAt = toStoredActivityDateTime(request.activityDateTime);
    request.activityIds?.forEach((id) => keys.add(`activity:${id}:${startsAt}`));
  }
  if (request.checkInDate && request.checkOutDate) {
    const checkOut = DateTime.fromISO(request.checkOutDate, { zone: BOOKING_TIME_ZONE });
    for (const id of request.accommodationIds ?? []) {
      let night = DateTime.fromISO(request.checkInDate, { zone: BOOKING_TIME_ZONE });
      while (night < checkOut) {
        keys.add(`accommodation:${id}:${night.toISODate()}`);
        night = night.plus({ days: 1 });
      }
    }
  }
  return [...keys].sort();
}

async function acquireAvailabilityLocks(client: PoolClient, request: BookingRequest) {
  for (const key of lockKeys(request)) {
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [key]);
  }
}

function bookingFromRow(row: BookingRow): Booking {
  return {
    id: row.id,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    ...(row.customerAccountId ? { customerAccountId: row.customerAccountId } : {}),
    ...(Object.keys(row.activityQuantities).length
      ? { activityQuantities: row.activityQuantities }
      : {}),
    ...(Object.keys(row.accommodationQuantities).length
      ? { accommodationQuantities: row.accommodationQuantities }
      : {}),
    ...(row.pricing ? { pricing: row.pricing } : {}),
    customerName: row.customerName,
    email: row.email,
    ...(row.phone ? { phone: row.phone } : {}),
    ...(row.notes ? { notes: row.notes } : {}),
    ...(row.activityIds.length ? { activityIds: row.activityIds } : {}),
    ...(row.activityDateTime
      ? { activityDateTime: row.activityDateTime.toISOString() }
      : {}),
    ...(row.accommodationIds.length
      ? { accommodationIds: row.accommodationIds }
      : {}),
    ...(row.checkInDate ? { checkInDate: row.checkInDate } : {}),
    ...(row.checkOutDate ? { checkOutDate: row.checkOutDate } : {}),
  };
}

const BOOKING_COLUMNS = `
  id,
  status,
  created_at AS "createdAt",
  customer_account_id AS "customerAccountId",
  activity_quantities AS "activityQuantities",
  accommodation_quantities AS "accommodationQuantities",
  pricing,
  customer_name AS "customerName",
  email,
  phone,
  notes,
  activity_ids AS "activityIds",
  activity_start_at AS "activityDateTime",
  accommodation_ids AS "accommodationIds",
  check_in_date::text AS "checkInDate",
  check_out_date::text AS "checkOutDate"
`;

export const bookingRepository: BookingRepository = {
  async createIfAvailable(request, customerAccountId) {
    let client: PoolClient | undefined;
    let transactionStarted = false;
    const activityQuantities = normalizeBookingQuantities(
      request.activityIds,
      request.activityQuantities,
    );
    const accommodationQuantities = normalizeBookingQuantities(
      request.accommodationIds,
      request.accommodationQuantities,
    );
    const pricing = calculateBookingQuote(activityQuantities, accommodationQuantities);

    try {
      client = await getDatabasePool().connect();
      await client.query('BEGIN');
      transactionStarted = true;
      await acquireAvailabilityLocks(client, request);

      const availability = await client.query<{ unavailable: boolean }>(
        `SELECT EXISTS (
          SELECT 1
          FROM bookings
          WHERE status IN ('pending', 'confirmed')
            AND (
              (
                cardinality($2::text[]) > 0
                AND activity_start_at = $1::timestamptz
                AND activity_ids && $2::text[]
              )
              OR (
                cardinality($3::text[]) > 0
                AND accommodation_ids && $3::text[]
                AND daterange(check_in_date, check_out_date, '[)')
                  && daterange($4::date, $5::date, '[)')
              )
            )
        ) AS unavailable`,
        [
          request.activityDateTime ? toStoredActivityDateTime(request.activityDateTime) : null,
          request.activityIds ?? [],
          request.accommodationIds ?? [],
          request.checkInDate ?? null,
          request.checkOutDate ?? null,
        ],
      );
      if (availability.rows[0]?.unavailable) {
        await client.query('ROLLBACK');
        transactionStarted = false;
        return null;
      }

      const result = await client.query<BookingRow>(
        `INSERT INTO bookings (
          id,
          customer_account_id,
          status,
          customer_name,
          email,
          phone,
          notes,
          activity_ids,
          activity_quantities,
          activity_start_at,
          accommodation_ids,
          accommodation_quantities,
          check_in_date,
          check_out_date,
          pricing
        ) VALUES (
          $1,
          $2,
          'pending',
          $3,
          $4,
          $5,
          $6,
          $7,
          $8::jsonb,
          $9,
          $10,
          $11::jsonb,
          $12,
          $13,
          $14::jsonb
        )
        RETURNING ${BOOKING_COLUMNS}`,
        [
          generateUuid(),
          customerAccountId ?? null,
          request.customerName.trim(),
          request.email.trim(),
          request.phone?.trim() || null,
          request.notes?.trim() || null,
          request.activityIds ?? [],
          JSON.stringify(activityQuantities),
          request.activityDateTime ? toStoredActivityDateTime(request.activityDateTime) : null,
          request.accommodationIds ?? [],
          JSON.stringify(accommodationQuantities),
          request.checkInDate ?? null,
          request.checkOutDate ?? null,
          JSON.stringify(pricing),
        ],
      );

      const booking = bookingFromRow(result.rows[0]);
      await client.query(
        `INSERT INTO booking_email_outbox (booking_id, payload)
         VALUES ($1, $2::jsonb)`,
        [booking.id, JSON.stringify(booking)],
      );

      await client.query('COMMIT');
      transactionStarted = false;
      return booking;
    } catch (error) {
      if (transactionStarted && client) {
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('Unable to roll back booking transaction.', rollbackError);
        }
      }
      console.error('Database error while creating booking; no booking was persisted.', error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  },

  async recordDeclinedAttempt(reason) {
    try {
      await getDatabasePool().query(
        `INSERT INTO booking_audit (status, reason)
         VALUES ('declined', $1)`,
        [reason],
      );
    } catch (error) {
      console.error('Database error while persisting declined booking audit record.', error);
      throw error;
    }
  },

  async claimPendingBookingEmails(limit) {
    try {
      const result = await getDatabasePool().query<BookingEmailRow>(
        `WITH candidates AS (
          SELECT booking_id
          FROM booking_email_outbox
          WHERE status = 'pending'
            OR (
              status = 'sending'
              AND (locked_at IS NULL OR locked_at < now() - interval '5 minutes')
            )
          ORDER BY created_at
          LIMIT $1
          FOR UPDATE SKIP LOCKED
        )
        UPDATE booking_email_outbox AS outbox
        SET status = 'sending',
            attempts = attempts + 1,
            locked_at = now()
        FROM candidates
        WHERE outbox.booking_id = candidates.booking_id
        RETURNING outbox.booking_id AS "bookingId", outbox.payload`,
        [Math.max(1, Math.min(Math.floor(limit), 50))],
      );
      return result.rows;
    } catch (error) {
      console.error('Database error while reading the booking email outbox.', error);
      throw error;
    }
  },

  async markBookingEmailSent(bookingId) {
    try {
      await getDatabasePool().query(
        `UPDATE booking_email_outbox
         SET status = 'sent', last_error = NULL, locked_at = NULL, sent_at = now()
         WHERE booking_id = $1`,
        [bookingId],
      );
    } catch (error) {
      console.error('Database error while recording booking email delivery.', error);
      throw error;
    }
  },

  async markBookingEmailPending(bookingId, reason) {
    try {
      await getDatabasePool().query(
        `UPDATE booking_email_outbox
         SET status = 'pending', last_error = $2, locked_at = NULL
         WHERE booking_id = $1`,
        [bookingId, reason.slice(0, 1000)],
      );
    } catch (error) {
      console.error('Database error while updating booking email delivery status.', error);
      throw error;
    }
  },
};
