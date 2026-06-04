# Booking misdirection fix + source capture — design

**Date:** 2026-06-04
**Context:** assymo-frontend `/afspraak` booking flow

## Problem

The booking calendar receives a steady trickle (~1/week, plus unknown share of
blank-remark bookings) of **misdirected real-human bookings** — people booking
dentist, doctor, daycare, or legal appointments on Assymo's calendar. This is
not bot spam: Turnstile (live since 2026-03-25) is working; the data shows real
Belgian residential IPs, coherent Dutch, no bot signatures. The enabling factor
is that the page H1 is the generic "Afspraak" and the SEO title is "Maak een
afspraak", with no brand/purpose until the footer.

A CAPTCHA cannot stop this — these visitors pass it. The remedy is clarity, not
friction.

## Goals

1. Make `/afspraak` unmistakably Assymo + garden/outdoor-project specific so
   misdirected visitors self-correct before booking. Zero added friction for
   genuine customers ("soft clarity" approach, chosen by owner).
2. Capture the traffic source on each booking so the channel can be confirmed
   and the fix measured before/after.

## Non-goals

- No confirmation gate / purpose dropdown (rejected: adds friction).
- No admin UI for source data (read via SQL for now).
- No change to the chatbot booking path (only ~3 bookings; carries no referrer).

## Design

### 1. Page clarity (content + one code line)

- **CMS `pageHeader` of page slug `afspraak`**:
  - `title`: `Afspraak` → `Maak een afspraak bij Assymo`
  - `subtitle`: prepend one bold line naming the work, keep existing text:
    > Plan een bezoek aan onze toonzaal in Sint-Job-in-'t-Goor voor uw
    > **tuinhuis, carport, poort of overkapping op maat.**
  - Implemented with `jsonb_set` on `sections->0->title` / `->subtitle` only.
- **SEO metadata** in `src/app/(site)/afspraak/page.tsx`:
  - title `Maak een afspraak` → `Afspraak maken bij Assymo – tuinhuizen, carports & poorten`
  - description naming the garden-construction focus.
  - Reshapes the Google snippet so misdirected searchers skip the result.

### 2. Source capture

- **DB**: `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS booking_source JSONB`.
  Additive; existing rows get `NULL`. Row count asserted equal before/after.
- **Client** (`BookingForm.tsx`): at mount capture
  `{ referrer: document.referrer, landing_url: window.location.href }`; include
  as `source` in the POST body. Visitors land directly on `/afspraak`, so the
  mount-time referrer is the true external source.
- **API** (`/api/appointments/route.ts`): read `body.source`, size-cap it, add
  server-side `user_agent`, persist into `booking_source` via `createAppointment`.
- **queries.ts** `createAppointment`: accept optional `bookingSource` arg, write
  to the new column.

### 3. Testing & rollout

- Run the additive migration **first**, then deploy (insert never hits a missing
  column).
- `npx tsc --noEmit` + existing Vitest; add one test asserting the API forwards
  `booking_source`.
- After a few days: `SELECT booking_source->>'referrer', count(*) ... GROUP BY 1`
  to confirm the channel and watch off-topic bookings drop.

## Data-safety guarantees

- Schema change is `ADD COLUMN IF NOT EXISTS` only — no rewrite of existing rows.
- CMS edit uses `jsonb_set` on two keys; rest of the JSONB preserved; prior value
  printed for reversibility.
- No `DELETE` / `DROP` / `TRUNCATE` / unscoped `UPDATE`.
- Row counts verified equal before/after each DB operation.
