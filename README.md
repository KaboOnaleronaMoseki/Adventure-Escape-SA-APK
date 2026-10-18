# Adventure Escape SA Expo app

The original HTML/CSS website remains at the project root. This directory is the native Expo
application, built with React Native and Expo Router.

## Run the app

```powershell
cd path\to\adventure-escape-sa\expo-app
npm install
npm start
```

Choose how you want to run it:

- **Android emulator:** Install Android Studio, create and start an Android Virtual Device, then
  run `npm run android`.
- **iOS Simulator:** On macOS with Xcode installed, start a simulator and run `npm run ios`.
- **Physical iOS or Android device:** Install Expo Go and run `npm run device`. Scan the QR code
  with the Expo Go app. Tunnel mode also works when the device and computer are on different
  networks.
- **Web browser:** Run `npm run web` and open the local URL printed by Expo.

The app supports portrait and landscape orientation and tablet layouts. Emulator launch requires
the relevant platform SDK/simulator to be installed; iOS Simulator is only available on macOS.

The native welcome screen is the app entry point. Tap **Enter the adventure** to open the home
screen. Use the **Menu** button to open the grouped navigation for Home, About, Activities,
Packages, Accommodation, Destinations, Safety, Gallery, Fees, and Contact. The nonfunctional
customer-login preview has been removed. Stack screens use a horizontal slide transition.

## Booking date validation

Booking dates are interpreted in the `Africa/Johannesburg` timezone. The calendar in
`components/BookingDatePicker.tsx` only allows today or later and displays the selected date as
`DD/MM/YYYY`. Activity requests also require a start time at least 24 hours ahead. Accommodation
check-out must be at least one day after check-in; same-day stays are disabled.
An administrator can enable same-day stays by setting `ALLOW_SAME_DAY_CHECKOUT=true` on the server
and `EXPO_PUBLIC_ALLOW_SAME_DAY_CHECKOUT=true` in the app build environment.
The fees calculator applies activity discounts to distinct activity types: 5% for 2, 10% for 3,
and 15% for 4 or more. Repeating the same activity does not count as a multi-activity discount,
and accommodation is not discounted.

Reusable request types and Luxon validation are in `services/bookingValidation.ts`. The fees screen
uses those checks before enabling submission. `app/bookings+api.ts` validates the request again,
records declined-attempt reasons, and creates only pending bookings. The PostgreSQL repository in
`services/bookingRepository.ts` writes ISO timestamps and date values, records declined attempts,
and transactionally blocks overlapping dates for the same selected activity/accommodation.
Apply `database/migrations/001_create_bookings.sql` and then
`database/migrations/002_booking_email_outbox.sql` to PostgreSQL. Configure `DATABASE_URL`,
`RESEND_API_KEY`, and `RESEND_FROM_EMAIL` as server-side secrets before deploying. The sender
address must be verified with Resend. Each accepted request is saved with a durable email
notification in the outbox and immediately dispatched when email configuration is available.
Failed deliveries remain queued for retry rather than losing the booking.

Configure `BOOKING_NOTIFICATION_CRON_SECRET` as a server-side secret and schedule a POST request
to `/booking-notifications` with an `Authorization: Bearer <secret>` header to retry queued email
notifications. Do not expose these secrets in the mobile app or use an `EXPO_PUBLIC_` prefix for
them. Copy `.env.example` to a local environment file for the required server and mobile
configuration. Until the database is connected and migrations have been applied, valid booking
requests receive HTTP 503; the API does not falsely report a saved booking.
If the API returns `booking_storage_unavailable`, check the server logs and confirm that
`DATABASE_URL` points to a reachable PostgreSQL database and both migrations completed, especially
the email outbox migration.

Expo Router server output is enabled in `app.json` so the web build can serve the relative `/bookings`
route.
For native builds, set `EXPO_PUBLIC_BOOKING_API_URL` to the deployed server base URL before building.
The API route requires a server deployment; static-only hosting cannot serve `/bookings`. Run the
focused date-validation tests with `npm test`.

## EAS project

This app is linked to the Expo account `kidx424` and project
`67404152-1013-4a23-b80a-9c2b785297cb`. The `preview` EAS profile creates an internally
distributed Android APK. The `production` profile creates store-distribution builds and increments
the native build number. Build with `npx eas-cli build --profile preview` or
`npx eas-cli build --profile production`.

Code locations:

- `components/BookingDatePicker.tsx` — mobile-friendly, non-typable date calendar.
- `services/bookingValidation.ts` — shared South African timezone rules, booking types, and errors.
- `services/bookingPricing.ts` — reusable booking totals and distinct-activity discount tiers.
- `services/bookingRepository.ts` — PostgreSQL availability, booking, and audit operations.
- `database/migrations/001_create_bookings.sql` — PostgreSQL schema for bookings and audit records.
- `database/migrations/002_booking_email_outbox.sql` — durable booking email queue.
- `app/bookings+api.ts` — server-side POST validation and pending booking creation.
- `app/booking-notifications+api.ts` — authenticated retry endpoint for queued booking email.
- `services/bookingEmail.ts` and `services/bookingEmailProvider.ts` — outbox dispatch and Resend delivery.
- `services/bookingEmail.test.ts` — notification recipient, payload, and error handling tests.
- `services/bookingValidation.test.ts` — date, checkout, and 24-hour cutoff unit tests.
- `services/bookingPricing.test.ts` — automatic activity-discount tier and total tests.
- `app/fees.tsx` — customer-facing booking form and submission.
