# Cloudflare Turnstile CAPTCHA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Cloudflare Turnstile bot protection to the contact, booking, and configurator quote forms in the Assymo frontend.

**Architecture:** Per-form Turnstile widget with server-side token verification. A shared `TurnstileWidget` client component wraps `@marsidev/react-turnstile`. A shared `verifyTurnstile()` server utility validates tokens. Each form adds the widget and sends the token; each API route verifies before processing.

**Tech Stack:** `@marsidev/react-turnstile`, Cloudflare Turnstile siteverify API, Next.js 16 App Router

**Spec:** `docs/superpowers/specs/2026-03-25-turnstile-captcha-design.md`

---

## File Structure

**New files:**
- `src/lib/turnstile.ts` — Server-side token verification utility
- `src/lib/turnstile.test.ts` — Unit tests for `verifyTurnstile()`
- `src/components/forms/TurnstileWidget.tsx` — Shared client widget wrapper

**Modified files:**
- `src/app/api/contact/route.ts` — Add token verification
- `src/app/api/appointments/route.ts` — Add token verification
- `src/app/api/configurator/submit/route.ts` — Add token verification (skip when token omitted for re-submission)
- `src/components/forms/ContactForm.tsx` — Add widget + token state
- `src/components/appointments/BookingForm.tsx` — Add widget + token state
- `src/components/configurator/steps/SummaryStep.tsx` — Add widget + token state + gated auto-submit

---

### Task 1: Install package and add error string

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the Turnstile React package**

```bash
pnpm add @marsidev/react-turnstile
```

- [ ] **Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add @marsidev/react-turnstile"
```

---

### Task 2: Server-side verification utility with tests

**Files:**
- Create: `src/lib/turnstile.ts`
- Create: `src/lib/turnstile.test.ts`

- [ ] **Step 1: Write the test file `src/lib/turnstile.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyTurnstile } from "./turnstile";

describe("verifyTurnstile", () => {
  const originalEnv = process.env.TURNSTILE_SECRET_KEY;

  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret-key";
  });

  afterEach(() => {
    process.env.TURNSTILE_SECRET_KEY = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns success when Cloudflare returns success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    const result = await verifyTurnstile("valid-token");
    expect(result).toEqual({ success: true });

    expect(fetch).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("returns failure with error codes when Cloudflare returns failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            "error-codes": ["invalid-input-response"],
          }),
      })
    );

    const result = await verifyTurnstile("bad-token");
    expect(result).toEqual({
      success: false,
      errorCodes: ["invalid-input-response"],
    });
  });

  it("returns failure when fetch throws (network error)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    );

    const result = await verifyTurnstile("any-token");
    expect(result).toEqual({ success: false, errorCodes: ["network-error"] });
  });

  it("passes remoteIp when provided", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    await verifyTurnstile("token", "1.2.3.4");

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = fetchCall[1]?.body as FormData;
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });

  it("skips verification when TURNSTILE_SECRET_KEY is not set", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await verifyTurnstile("any-token");
    expect(result).toEqual({ success: true });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("TURNSTILE_SECRET_KEY")
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test --run src/lib/turnstile.test.ts
```

Expected: FAIL — module `./turnstile` not found.

- [ ] **Step 3: Write `src/lib/turnstile.ts`**

```typescript
interface TurnstileResult {
  success: boolean;
  errorCodes?: string[];
}

export async function verifyTurnstile(
  token: string,
  remoteIp?: string
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn(
      "TURNSTILE_SECRET_KEY is not set — skipping Turnstile verification"
    );
    return { success: true };
  }

  try {
    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: formData }
    );

    const data = await response.json();

    if (data.success) {
      return { success: true };
    }

    return {
      success: false,
      errorCodes: data["error-codes"] || [],
    };
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return { success: false, errorCodes: ["network-error"] };
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test --run src/lib/turnstile.test.ts
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/turnstile.ts src/lib/turnstile.test.ts
git commit -m "feat: add Turnstile server-side verification utility with tests"
```

---

### Task 3: Client-side TurnstileWidget component

**Files:**
- Create: `src/components/forms/TurnstileWidget.tsx`

- [ ] **Step 1: Create `src/components/forms/TurnstileWidget.tsx`**

```tsx
"use client";

import { forwardRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

const TurnstileWidget = forwardRef<TurnstileInstance, TurnstileWidgetProps>(
  function TurnstileWidget({ onSuccess, onError, onExpire, className }, ref) {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey) {
      return null;
    }

    return (
      <Turnstile
        ref={ref}
        siteKey={siteKey}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{
          appearance: "interaction-only",
          language: "nl",
        }}
        className={className}
      />
    );
  }
);

export { TurnstileWidget };
export type { TurnstileInstance };
```

- [ ] **Step 2: Verify the project compiles**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/forms/TurnstileWidget.tsx
git commit -m "feat: add TurnstileWidget client component"
```

---

### Task 4: Add Turnstile to Contact Form + API route

**Files:**
- Modify: `src/components/forms/ContactForm.tsx`
- Modify: `src/app/api/contact/route.ts`

- [ ] **Step 1: Update the Contact Form API route**

In `src/app/api/contact/route.ts`, add the import at the top:

```typescript
import { verifyTurnstile } from "@/lib/turnstile";
```

After `const form = await req.formData();` (line 18), before the subject extraction, add:

```typescript
    // Verify Turnstile token
    const turnstileToken = form.get("turnstile_token") as string;
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim();
    const turnstileResult = await verifyTurnstile(turnstileToken, clientIp);
    if (!turnstileResult.success) {
      console.error("Turnstile verification failed:", turnstileResult.errorCodes);
      return NextResponse.json(
        { error: "Verificatie mislukt. Probeer het opnieuw." },
        { status: 400 }
      );
    }
```

- [ ] **Step 2: Update the ContactForm component**

In `src/components/forms/ContactForm.tsx`:

Update the existing React import to include `useRef`, and add the TurnstileWidget import:

```typescript
import { FormEvent, useState, useRef } from "react";
```

```typescript
import { TurnstileWidget, type TurnstileInstance } from "@/components/forms/TurnstileWidget";
```

Add state and ref inside the component (after the `track` line):

```typescript
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
```

In the `handleSubmit` function, after building the FormData (after the `visibleFields.forEach` block), add the token:

```typescript
      if (turnstileToken) {
        data.set("turnstile_token", turnstileToken);
      }
```

In the catch block, after `setErrorMessage(...)`, reset the widget:

```typescript
      turnstileRef.current?.reset();
      setTurnstileToken(null);
```

Update the submit button disabled condition (line 270) to also require the token:

```typescript
disabled={isSubmitting || (!isSuccess && (!isFormValid || !turnstileToken))}
```

Add the `<TurnstileWidget />` in the JSX, just before the error display (before line 266):

```tsx
        <TurnstileWidget
          ref={turnstileRef}
          onSuccess={setTurnstileToken}
          onError={() => setTurnstileToken(null)}
          onExpire={() => setTurnstileToken(null)}
        />
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/forms/ContactForm.tsx src/app/api/contact/route.ts
git commit -m "feat: add Turnstile CAPTCHA to contact form"
```

---

### Task 5: Add Turnstile to Booking Form + API route

**Files:**
- Modify: `src/components/appointments/BookingForm.tsx`
- Modify: `src/app/api/appointments/route.ts`

- [ ] **Step 1: Update the Appointments API route**

In `src/app/api/appointments/route.ts`, add the import at the top:

```typescript
import { verifyTurnstile } from "@/lib/turnstile";
```

After `const body = await request.json();` (line 35), before the required fields validation, add:

```typescript
    // Verify Turnstile token (required — bots can't skip by omitting it)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim();
    const turnstileResult = await verifyTurnstile(body.turnstile_token, clientIp);
    if (!turnstileResult.success) {
      console.error("Turnstile verification failed:", turnstileResult.errorCodes);
      return NextResponse.json(
        { error: "Verificatie mislukt. Probeer het opnieuw." },
        { status: 400 }
      );
    }
```

Note: This is NOT conditional. A missing or invalid token will fail verification (as it should). The `verifyTurnstile` function already skips verification in dev when `TURNSTILE_SECRET_KEY` is unset, so local development is not affected. The IP extraction reuses the same `x-forwarded-for` header already used later in this route (line 117-118).

- [ ] **Step 2: Update the BookingForm component**

In `src/components/appointments/BookingForm.tsx`:

Add imports:

```typescript
import { TurnstileWidget, type TurnstileInstance } from "@/components/forms/TurnstileWidget";
```

Add `useRef` to the existing react import (it already imports `useRef`).

Add state and ref inside the component (after `const hasTrackedStart = useRef(false);`):

```typescript
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
```

In `handleDetailsSubmit`, update the fetch body to include the token:

```typescript
        body: JSON.stringify({
          ...formData,
          turnstile_token: turnstileToken,
        }),
```

In the catch block (after `toast.error(...)`), reset the widget:

```typescript
      turnstileRef.current?.reset();
      setTurnstileToken(null);
```

Update the submit button disabled condition (line 400) to also require the token:

```typescript
disabled={!isDetailsValid() || submitting || !turnstileToken}
```

Add the `<TurnstileWidget />` in the JSX, just before `{error && <FieldError>...` (before line 395):

```tsx
                <TurnstileWidget
                  ref={turnstileRef}
                  onSuccess={setTurnstileToken}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                />
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/appointments/BookingForm.tsx src/app/api/appointments/route.ts
git commit -m "feat: add Turnstile CAPTCHA to booking form"
```

---

### Task 6: Add Turnstile to Configurator Quote + API route

**Files:**
- Modify: `src/components/configurator/steps/SummaryStep.tsx`
- Modify: `src/app/api/configurator/submit/route.ts`

- [ ] **Step 1: Update the Configurator Submit API route**

In `src/app/api/configurator/submit/route.ts`, add the import at the top:

```typescript
import { verifyTurnstile } from "@/lib/turnstile";
```

After the body is parsed (line 78-79), before the required fields validation, add:

```typescript
    // Verify Turnstile token (skip for re-submissions from bookAppointment flow when token is omitted)
    if (body.turnstile_token) {
      const forwardedFor = request.headers.get("x-forwarded-for");
      const clientIp = forwardedFor?.split(",")[0]?.trim();
      const turnstileResult = await verifyTurnstile(body.turnstile_token, clientIp);
      if (!turnstileResult.success) {
        console.error("Turnstile verification failed:", turnstileResult.errorCodes);
        return NextResponse.json(
          { error: "Verificatie mislukt. Probeer het opnieuw." },
          { status: 400 }
        );
      }
    }
```

Add `turnstile_token?: string;` to the `SubmitRequestBody` interface (after the `site?: string;` field):

```typescript
  turnstile_token?: string;
```

- [ ] **Step 2: Update the SummaryStep component**

In `src/components/configurator/steps/SummaryStep.tsx`:

Update the existing React import to include `useRef`, and add the TurnstileWidget import:

```typescript
import { useState, useEffect, useCallback, useRef } from "react";
```

```typescript
import { TurnstileWidget, type TurnstileInstance } from "@/components/forms/TurnstileWidget";
```

Add state and ref inside the component (after the appointment state block, around line 92):

```typescript
  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
```

**Gate auto-submission on Turnstile token.** Update the auto-submit effect (lines 137-142):

```typescript
  // Submit quote when price is loaded, token is ready, and not yet submitted
  useEffect(() => {
    if (price && turnstileToken && submissionStatus === "idle") {
      submitQuote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, turnstileToken, submissionStatus]);
```

**Send token in `submitQuote`.** In `submitQuote()`, update the fetch body (lines 159-169) to include the token:

```typescript
        body: JSON.stringify({
          product_slug: selectedProduct,
          answers,
          contact: {
            name: contactDetails.name,
            email: contactDetails.email,
            phone: contactDetails.phone,
            address: `${contactDetails.street}, ${contactDetails.postalCode} ${contactDetails.city}`,
          },
          appointment: appointmentData,
          turnstile_token: appointmentData ? undefined : turnstileToken,
        }),
```

Note: `turnstile_token` is set to `undefined` when called from `bookAppointment()` (which passes `appointmentData`), so the API route skips re-verification.

**Send token in `bookAppointment`.** In `bookAppointment()`, update the fetch body (lines 250-259) to include the token:

```typescript
        body: JSON.stringify({
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          customer_name: contactDetails.name,
          customer_email: contactDetails.email,
          customer_phone: contactDetails.phone,
          customer_street: contactDetails.street,
          customer_postal_code: contactDetails.postalCode,
          customer_city: contactDetails.city,
          remarks: `Offerte aanvraag via configurator - ${productName}`,
          turnstile_token: turnstileToken,
        }),
```

**Reset widget on errors.** In `submitQuote()`'s catch block (around line 200), add:

```typescript
      turnstileRef.current?.reset();
      setTurnstileToken(null);
```

In `bookAppointment()`'s catch block (around line 284), add:

```typescript
      turnstileRef.current?.reset();
      setTurnstileToken(null);
```

**Also reset on retry.** In the error banner's retry button onClick (line 372-375), add reset:

```typescript
            onClick={() => {
              setSubmissionStatus("idle");
              turnstileRef.current?.reset();
              setTurnstileToken(null);
            }}
```

The auto-submit effect will re-trigger once a new token arrives after the reset.

**Render the widget.** Add `<TurnstileWidget />` in the JSX. Place it above the Price Card (before line 382), after the error banner:

```tsx
      {/* Turnstile verification */}
      <TurnstileWidget
        ref={turnstileRef}
        onSuccess={setTurnstileToken}
        onError={() => setTurnstileToken(null)}
        onExpire={() => setTurnstileToken(null)}
      />
```

- [ ] **Step 3: Verify compilation**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/configurator/steps/SummaryStep.tsx src/app/api/configurator/submit/route.ts
git commit -m "feat: add Turnstile CAPTCHA to configurator quote submission"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run all tests**

```bash
pnpm test --run
```

Expected: All tests pass, including the new Turnstile tests.

- [ ] **Step 2: Run type check**

```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 3: Run linter**

```bash
pnpm lint
```

Expected: No lint errors.

- [ ] **Step 4: Test build**

```bash
pnpm build
```

Expected: Build succeeds (this also runs tests).
