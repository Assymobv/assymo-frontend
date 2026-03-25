import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  createAppointment,
  isSlotAvailable,
  sendNewAppointmentEmails,
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
  normalizePostalCode,
} from "@/lib/appointments";
import type { CreateAppointmentInput } from "@/types/appointments";

/**
 * POST /api/appointments
 *
 * Create a new appointment booking.
 *
 * Request body:
 * - appointment_date: Date in YYYY-MM-DD format
 * - appointment_time: Time in HH:MM format
 * - customer_name: Customer's full name
 * - customer_email: Customer's email address
 * - customer_phone: Customer's phone number
 * - customer_street: Street address
 * - customer_postal_code: Postal code
 * - customer_city: City
 * - remarks: Optional remarks/notes
 *
 * Returns:
 * - success: boolean
 * - appointment: Created appointment data (includes edit_token for building manage URL)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    // Validate required fields
    const requiredFields = [
      "appointment_date",
      "appointment_time",
      "customer_name",
      "customer_email",
      "customer_phone",
      "customer_street",
      "customer_postal_code",
      "customer_city",
    ];

    for (const field of requiredFields) {
      if (!body[field] || (typeof body[field] === "string" && !body[field].trim())) {
        return NextResponse.json(
          { error: `Veld '${getFieldLabel(field)}' is verplicht` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    if (!isValidEmail(body.customer_email)) {
      return NextResponse.json(
        { error: "Ongeldig e-mailadres" },
        { status: 400 }
      );
    }

    // Validate phone format
    if (!isValidPhone(body.customer_phone)) {
      return NextResponse.json(
        { error: "Ongeldig telefoonnummer" },
        { status: 400 }
      );
    }

    // Validate postal code format
    if (!isValidPostalCode(body.customer_postal_code)) {
      return NextResponse.json(
        { error: "Ongeldige postcode (formaat: 1234 AB)" },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.appointment_date)) {
      return NextResponse.json(
        { error: "Ongeldige datum (formaat: YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(body.appointment_time)) {
      return NextResponse.json(
        { error: "Ongeldige tijd (formaat: HH:MM)" },
        { status: 400 }
      );
    }

    // Check if the slot is still available
    const available = await isSlotAvailable(
      body.appointment_date,
      body.appointment_time
    );

    if (!available) {
      return NextResponse.json(
        {
          error: "Dit tijdslot is helaas niet meer beschikbaar. Kies een ander tijdstip.",
          code: "SLOT_UNAVAILABLE",
        },
        { status: 409 }
      );
    }

    // Create the appointment
    const input: CreateAppointmentInput = {
      appointment_date: body.appointment_date,
      appointment_time: body.appointment_time,
      customer_name: body.customer_name.trim(),
      customer_email: body.customer_email.trim().toLowerCase(),
      customer_phone: body.customer_phone.trim(),
      customer_street: body.customer_street.trim(),
      customer_postal_code: normalizePostalCode(body.customer_postal_code),
      customer_city: body.customer_city.trim(),
      remarks: body.remarks?.trim() || undefined,
    };

    const appointment = await createAppointment(input, clientIp || undefined);

    // Send confirmation emails (don't block on email failures)
    sendNewAppointmentEmails(appointment).catch((err) => {
      console.error("Failed to send appointment emails:", err);
    });

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        customer_name: appointment.customer_name,
        customer_email: appointment.customer_email,
        status: appointment.status,
        edit_token: appointment.edit_token,
      },
    });
  } catch (error) {
    console.error("Error creating appointment:", error);

    // Handle unique constraint violation (double booking)
    if (
      error instanceof Error &&
      error.message.includes("unique constraint")
    ) {
      return NextResponse.json(
        {
          error: "Dit tijdslot is helaas niet meer beschikbaar. Kies een ander tijdstip.",
          code: "SLOT_UNAVAILABLE",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het maken van de afspraak" },
      { status: 500 }
    );
  }
}

/**
 * Get Dutch label for field name
 */
function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    appointment_date: "Datum",
    appointment_time: "Tijd",
    customer_name: "Naam",
    customer_email: "E-mailadres",
    customer_phone: "Telefoonnummer",
    customer_street: "Straat en huisnummer",
    customer_postal_code: "Postcode",
    customer_city: "Plaats",
  };
  return labels[field] || field;
}
