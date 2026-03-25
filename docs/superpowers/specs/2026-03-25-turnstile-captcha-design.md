# Cloudflare Turnstile CAPTCHA Integration

## Overview

Add Cloudflare Turnstile (managed mode) to three public-facing forms across both Assymo and VPG frontends to prevent bot spam and abuse. Turnstile is a free, privacy-friendly CAPTCHA alternative that doesn't require cookie consent.

## Goals

- Protect contact, booking, and configurator quote forms from bot submissions
- Minimal UX friction — managed mode auto-completes for most users
- Allow retry on verification failure (inline error, widget reset)
- Consistent implementation across both Assymo and VPG projects

## Non-Goals

- Protecting the chatbot (already has rate limiting)
- Protecting the newsletter form (out of scope for now)
- Server-side rate limiting (separate concern)

## Approach

Per-form widget pattern. Each protected form renders its own `<Turnstile />` widget, sends the token with form data, and the API route verifies it server-side before processing. Shared code is limited to a reusable widget component and a server-side verify utility.

## Package

`@marsidev/react-turnstile` — React wrapper for Cloudflare Turnstile. Well-maintained, supports Next.js App Router.

## Environment Variables

Two env vars per project (Assymo + VPG each get their own Turnstile site):

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client (public) | Widget renders with this key |
| `TURNSTILE_SECRET_KEY` | Server (secret) | Token verification API calls |

Both must be set in `.env.local` (development) and Vercel (production). Cloudflare provides test keys for local development that always pass/fail.

## Components

### 1. Server Utility: `src/lib/turnstile.ts`

A `verifyTurnstile(token: string, remoteIp?: string): Promise<{ success: boolean; errorCodes?: string[] }>` function that:
- POSTs the token to `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- Includes `TURNSTILE_SECRET_KEY` as the secret and optional `remoteip` for improved detection
- Returns `{ success: true }` or `{ success: false, errorCodes: [...] }` (error codes logged server-side, not exposed to client)
- When `TURNSTILE_SECRET_KEY` is not set: skips verification and returns `{ success: true }` with a console warning (dev-only convenience)

### 2. Client Component: `src/components/forms/TurnstileWidget.tsx`

A thin wrapper around `@marsidev/react-turnstile` that:
- Renders the managed-mode widget with `appearance="interaction-only"` (only shows when Cloudflare needs user interaction)
- Sets `language="nl"` for Dutch challenge text
- Accepts `onSuccess(token)` callback to capture the token
- Accepts `onError()` and `onExpire()` callbacks to clear the token
- Exposes a ref for programmatic reset (retry flow)

### 3. Form Changes

#### ContactForm (`src/components/forms/ContactForm.tsx`)
- Add `turnstileToken` state (initially `null`)
- Render `<TurnstileWidget />` above the submit button
- Include token in FormData as `turnstile_token`
- Disable submit button when token is `null`
- On API verification failure: show error in existing `<FieldError>`, reset widget

#### BookingForm (`src/components/appointments/BookingForm.tsx`)
- Add `turnstileToken` state
- Render `<TurnstileWidget />` above the submit button
- Include `turnstile_token` in the JSON body
- Disable submit button when token is `null`
- On API verification failure: show error in existing `<FieldError>` + toast, reset widget

#### SummaryStep (`src/components/configurator/steps/SummaryStep.tsx`)
- Add `turnstileToken` state
- Render `<TurnstileWidget />` in the summary view
- Gate auto-submission on both `price` AND `turnstileToken` being available (currently only waits for `price`)
- Include `turnstile_token` in JSON body to `/api/configurator/submit`
- On failure: existing error banner with retry button resets the widget
- **Appointment booking flow:** `bookAppointment()` calls `/api/appointments` then re-calls `submitQuote()` with appointment data. The `/api/appointments` call needs a fresh Turnstile token. The second `submitQuote()` call skips Turnstile verification since the quote was already verified and submitted once — pass a flag or omit the token to signal this to the API route.

### 4. API Route Changes

All three routes get the same pattern — extract token, verify early, return 400 on failure:

#### `/api/contact/route.ts`
- After `req.formData()`: get token via `form.get('turnstile_token')`
- Call `verifyTurnstile(token)` before any other validation
- On failure: return error from `t('admin.errors.turnstileVerification')` with status 400

#### `/api/appointments/route.ts`
- After `request.json()`: extract `body.turnstile_token`
- Call `verifyTurnstile(token)` before field validation
- On failure: same error string from `strings.ts`, status 400

#### `/api/configurator/submit/route.ts`
- After `request.json()`: extract `body.turnstile_token`
- Call `verifyTurnstile(token)` before field validation
- On failure: same error string from `strings.ts`, status 400
- When called from the `bookAppointment()` re-submission flow (token omitted): skip Turnstile verification

**Error string:** Add `"Verificatie mislukt. Probeer het opnieuw."` to `src/config/strings.ts` under an appropriate key (e.g., `errors.turnstileVerification`).

## Error Handling

- **Verification failure:** Inline error message in Dutch, widget resets for retry
- **Network error calling Turnstile API:** Treated as verification failure (fail closed)
- **Widget load failure:** Submit button stays disabled (token never set)
- **Token expiry:** Turnstile tokens expire after 300 seconds; `onExpire` clears the token state, user must re-verify

## VPG Replication

Identical implementation in `vpg-frontend`:
- Same package, same component, same utility
- Own Turnstile site (vpg.be domain) with separate key pair
- Same three forms: contact, booking, configurator quote

Assymo is implemented first, then replicated to VPG.

## File Summary

New files:
- `src/lib/turnstile.ts` — server verification utility
- `src/components/forms/TurnstileWidget.tsx` — client widget wrapper

## Testing

- **Local development:** Use Cloudflare's always-pass test site key (`1x00000000000000000000AA`) and secret (`1x0000000000000000000000000000000AA`) in `.env.local`
- **Error flow testing:** Use always-fail test keys (`2x00000000000000000000AB` / `2x0000000000000000000000000000000AA`) to verify retry behavior
- **Unit test:** `verifyTurnstile()` utility with mocked fetch
- **Missing env var:** Verify skip behavior works in dev when `TURNSTILE_SECRET_KEY` is unset

## File Summary

Modified files:
- `src/components/forms/ContactForm.tsx` — widget + token state
- `src/components/appointments/BookingForm.tsx` — widget + token state
- `src/components/configurator/steps/SummaryStep.tsx` — widget + token state + gated auto-submit
- `src/app/api/contact/route.ts` — token verification
- `src/app/api/appointments/route.ts` — token verification
- `src/app/api/configurator/submit/route.ts` — token verification
