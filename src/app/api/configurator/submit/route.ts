import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { sql } from "@/lib/db";
import { resend } from "@/lib/resend";
import { RESEND_CONFIG, DEFAULT_TEST_EMAIL } from "@/config/resend";
import {
  calculatePrice,
  formatPrice,
  createQuoteSubmission,
  getQuestionsForProduct,
} from "@/lib/configurator";
import { QuoteEmail, QuoteAdminNotification } from "@/emails";
import { formatDateNL, formatTimeNL } from "@/lib/appointments/utils";

/**
 * Get the recipient email - in test mode, all emails go to test email
 */
function getRecipient(email: string): string {
  return RESEND_CONFIG.isTestMode ? DEFAULT_TEST_EMAIL : email;
}

/**
 * Get site ID by slug
 */
async function getSiteIdBySlug(slug: string): Promise<string | null> {
  const rows = await sql`SELECT id FROM sites WHERE slug = ${slug}`;
  return rows[0]?.id || null;
}

/**
 * Format answer value for display in email
 */
function formatAnswerValue(
  value: string | string[] | number | undefined
): string {
  if (value === undefined || value === null) {
    return "-";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "-";
  }

  if (typeof value === "number") {
    return String(value);
  }

  return String(value);
}

interface SubmitRequestBody {
  product_slug: string;
  answers: Record<string, string | string[] | number>;
  contact: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  appointment?: {
    date: string;
    time: string;
    id?: number;
  };
  site?: string;
  turnstile_token?: string;
}

/**
 * POST /api/configurator/submit
 *
 * Submit a quote request from the configurator wizard.
 * - Calculates price
 * - Stores submission in database
 * - Sends quote email to customer
 * - Sends notification email to admin
 */
export async function POST(request: NextRequest) {
  try {
    const body: SubmitRequestBody = await request.json();
    const { product_slug, answers, contact, appointment, site = "assymo" } = body;

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

    // Validate required fields
    if (!product_slug) {
      return NextResponse.json(
        { error: "product_slug is required" },
        { status: 400 }
      );
    }

    if (!contact?.name || !contact?.email) {
      return NextResponse.json(
        { error: "Contact name and email are required" },
        { status: 400 }
      );
    }

    // Get site ID
    const siteId = await getSiteIdBySlug(site);
    if (!siteId) {
      return NextResponse.json(
        { error: "Invalid site" },
        { status: 400 }
      );
    }

    // Calculate price
    const priceResult = await calculatePrice(
      { product_slug, answers: answers || {} },
      site
    );

    // Get questions for building configuration summary
    const questions = await getQuestionsForProduct(product_slug, site);

    // Build configuration items for email
    const configurationItems: { label: string; value: string }[] = [];
    for (const [key, value] of Object.entries(answers || {})) {
      // Find the question label
      const question = questions.find((q) => q.question_key === key);
      let displayValue = formatAnswerValue(value);

      // For select types, try to find the option label
      if (question?.options && typeof value === "string") {
        const option = question.options.find((o) => o.value === value);
        if (option) {
          displayValue = option.label;
        }
      } else if (question?.options && Array.isArray(value)) {
        const labels = value.map((v) => {
          const option = question.options?.find((o) => o.value === v);
          return option?.label || v;
        });
        displayValue = labels.join(", ");
      }

      configurationItems.push({
        label: question?.label || key.replace(/_/g, " "),
        value: displayValue,
      });
    }

    // Get product name (use slug as fallback)
    const productName = product_slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // Store submission in database
    const submission = await createQuoteSubmission(siteId, {
      configuration: {
        product_slug,
        answers,
      },
      price_estimate_min: priceResult.min,
      price_estimate_max: priceResult.max,
      contact_name: contact.name,
      contact_email: contact.email.toLowerCase(),
      contact_phone: contact.phone,
      contact_address: contact.address,
      appointment_id: appointment?.id,
    });

    // Format price for emails
    const priceMinFormatted = formatPrice(priceResult.min);
    const priceMaxFormatted = formatPrice(priceResult.max);

    // Format appointment details if present
    const hasAppointment = !!appointment?.date && !!appointment?.time;
    const appointmentDateFormatted = appointment?.date
      ? formatDateNL(appointment.date)
      : undefined;
    const appointmentTimeFormatted = appointment?.time
      ? formatTimeNL(appointment.time)
      : undefined;

    // Send emails in parallel (don't block on failures)
    const emailPromises: Promise<{ success: boolean; error?: string }>[] = [];

    // Customer email
    emailPromises.push(
      (async () => {
        try {
          const { error } = await resend.emails.send({
            from: RESEND_CONFIG.fromAddress,
            to: [getRecipient(contact.email)],
            subject: `${RESEND_CONFIG.subjects.quoteCustomer} - ${productName}`,
            react: QuoteEmail({
              customerName: contact.name,
              productName,
              configuration: configurationItems,
              priceMin: priceMinFormatted,
              priceMax: priceMaxFormatted,
              hasAppointment,
              appointmentDate: appointmentDateFormatted,
              appointmentTime: appointmentTimeFormatted,
            }),
          });

          if (error) {
            console.error("Failed to send customer quote email:", error);
            return { success: false, error: error.message };
          }
          return { success: true };
        } catch (err) {
          console.error("Error sending customer quote email:", err);
          return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }
      })()
    );

    // Admin notification email
    emailPromises.push(
      (async () => {
        try {
          const { error } = await resend.emails.send({
            from: RESEND_CONFIG.fromAddress,
            to: [RESEND_CONFIG.quoteRecipient],
            subject: `${RESEND_CONFIG.subjects.quoteAdmin}: ${contact.name} - ${productName}`,
            react: QuoteAdminNotification({
              customerName: contact.name,
              customerEmail: contact.email,
              customerPhone: contact.phone || "-",
              customerAddress: contact.address || "-",
              productName,
              configuration: configurationItems,
              priceMin: priceMinFormatted,
              priceMax: priceMaxFormatted,
              hasAppointment,
              appointmentDate: appointmentDateFormatted,
              appointmentTime: appointmentTimeFormatted,
            }),
          });

          if (error) {
            console.error("Failed to send admin notification email:", error);
            return { success: false, error: error.message };
          }
          return { success: true };
        } catch (err) {
          console.error("Error sending admin notification email:", err);
          return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }
      })()
    );

    // Wait for emails (don't fail request if emails fail)
    const emailResults = await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      submission_id: submission.id,
      price: {
        min: priceResult.min,
        max: priceResult.max,
        min_formatted: priceMinFormatted,
        max_formatted: priceMaxFormatted,
      },
      emails: {
        customer: emailResults[0]?.success ?? false,
        admin: emailResults[1]?.success ?? false,
      },
    });
  } catch (error) {
    console.error("Error submitting quote:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het versturen van de offerte" },
      { status: 500 }
    );
  }
}
