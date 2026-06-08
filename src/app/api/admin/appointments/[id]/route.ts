import { NextRequest, NextResponse } from "next/server";
import { protectRoute } from "@/lib/permissions";
import {
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  softDeleteAppointment,
  isSlotAvailable,
  sendUpdateEmail,
  sendCancellationEmail,
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
  normalizePostalCode,
} from "@/lib/appointments";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/appointments/[id]
 *
 * Get a single appointment by ID (full details including admin_notes).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, response } = await protectRoute({ feature: "appointments" });
    if (!authorized) return response;

    const { id } = await params;
    const appointmentId = parseInt(id, 10);

    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { error: "Ongeldig ID" },
        { status: 400 }
      );
    }

    const appointment = await getAppointmentById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { error: "Afspraak niet gevonden" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/appointments/[id]
 *
 * Update an appointment (admin can update all fields including status and admin_notes).
 *
 * Request body:
 * - Any appointment field can be updated
 * - send_notification: Whether to notify customer of changes (default false)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, response } = await protectRoute({ feature: "appointments" });
    if (!authorized) return response;

    const { id } = await params;
    const appointmentId = parseInt(id, 10);

    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { error: "Ongeldig ID" },
        { status: 400 }
      );
    }

    const appointment = await getAppointmentById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { error: "Afspraak niet gevonden" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Track original date/time for notification
    const previousDate = appointment.appointment_date;
    const previousTime = appointment.appointment_time;

    // Prepare update data
    const updateData: Record<string, string | undefined> = {};

    // Handle date/time change
    if (body.appointment_date || body.appointment_time) {
      const newDate = body.appointment_date || appointment.appointment_date;
      const newTime = body.appointment_time || appointment.appointment_time;

      // Only check availability if actually changing
      if (newDate !== previousDate || newTime !== previousTime) {
        const available = await isSlotAvailable(newDate, newTime);

        if (!available) {
          return NextResponse.json(
            { error: "Dit tijdslot is niet beschikbaar" },
            { status: 409 }
          );
        }

        if (body.appointment_date) updateData.appointment_date = newDate;
        if (body.appointment_time) updateData.appointment_time = newTime;
      }
    }

    // Handle other fields
    if (body.customer_name !== undefined) {
      updateData.customer_name = body.customer_name.trim();
    }

    if (body.customer_email !== undefined) {
      if (!isValidEmail(body.customer_email)) {
        return NextResponse.json(
          { error: "Ongeldig e-mailadres" },
          { status: 400 }
        );
      }
      updateData.customer_email = body.customer_email.trim().toLowerCase();
    }

    if (body.customer_phone !== undefined) {
      if (!isValidPhone(body.customer_phone)) {
        return NextResponse.json(
          { error: "Ongeldig telefoonnummer" },
          { status: 400 }
        );
      }
      updateData.customer_phone = body.customer_phone.trim();
    }

    if (body.customer_street !== undefined) {
      updateData.customer_street = body.customer_street.trim();
    }

    if (body.customer_postal_code !== undefined) {
      if (!isValidPostalCode(body.customer_postal_code)) {
        return NextResponse.json(
          { error: "Ongeldige postcode" },
          { status: 400 }
        );
      }
      updateData.customer_postal_code = normalizePostalCode(body.customer_postal_code);
    }

    if (body.customer_city !== undefined) {
      updateData.customer_city = body.customer_city.trim();
    }

    if (body.remarks !== undefined) {
      updateData.remarks = body.remarks?.trim() || undefined;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (body.admin_notes !== undefined) {
      updateData.admin_notes = body.admin_notes?.trim() || undefined;
    }

    // Check if there are any updates
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Geen wijzigingen opgegeven" },
        { status: 400 }
      );
    }

    // Update the appointment
    const updatedAppointment = await updateAppointment(appointmentId, updateData);

    if (!updatedAppointment) {
      return NextResponse.json(
        { error: "Kon afspraak niet bijwerken" },
        { status: 500 }
      );
    }

    // Send notification if requested and date/time changed
    const sendNotification = body.send_notification === true;
    const dateTimeChanged =
      updateData.appointment_date || updateData.appointment_time;

    if (sendNotification && dateTimeChanged) {
      sendUpdateEmail(updatedAppointment, previousDate, previousTime).catch(
        (err) => {
          console.error("Failed to send update email:", err);
        }
      );
    }

    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);

    if (
      error instanceof Error &&
      error.message.includes("unique constraint")
    ) {
      return NextResponse.json(
        { error: "Dit tijdslot is niet beschikbaar" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/appointments/[id]
 *
 * Cancel or archive (soft-delete) an appointment. No row is ever physically
 * removed from the database.
 *
 * Query parameters:
 * - archive: If "true", archive the appointment (sets deleted_at — it disappears
 *   from all views and frees the slot, but the record is preserved/recoverable).
 *   Otherwise the appointment is soft-cancelled (status = 'cancelled', stays visible).
 * - notify: If "true", send cancellation email to customer
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, response } = await protectRoute({ feature: "appointments" });
    if (!authorized) return response;

    const { id } = await params;
    const appointmentId = parseInt(id, 10);

    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { error: "Ongeldig ID" },
        { status: 400 }
      );
    }

    const appointment = await getAppointmentById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { error: "Afspraak niet gevonden" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const archive = searchParams.get("archive") === "true";
    const notify = searchParams.get("notify") === "true";

    if (archive) {
      // Archive (soft-delete): preserves the row, hides it everywhere, frees the slot.
      const deleted = await softDeleteAppointment(appointmentId);

      if (!deleted) {
        return NextResponse.json(
          { error: "Kon afspraak niet verwijderen" },
          { status: 500 }
        );
      }

      // Notify the customer of the deletion (reuse cancellation email).
      if (notify) {
        sendCancellationEmail(deleted).catch((err) => {
          console.error("Failed to send cancellation email:", err);
        });
      }

      return NextResponse.json({
        success: true,
        message: "Afspraak verwijderd",
      });
    } else {
      // Soft cancel
      if (appointment.status === "cancelled") {
        return NextResponse.json(
          { error: "Afspraak is al geannuleerd" },
          { status: 400 }
        );
      }

      const cancelled = await cancelAppointment(appointmentId);

      if (!cancelled) {
        return NextResponse.json(
          { error: "Kon afspraak niet annuleren" },
          { status: 500 }
        );
      }

      // Send cancellation email if requested
      if (notify) {
        sendCancellationEmail(cancelled).catch((err) => {
          console.error("Failed to send cancellation email:", err);
        });
      }

      return NextResponse.json({
        success: true,
        message: "Afspraak geannuleerd",
        appointment: cancelled,
      });
    }
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden" },
      { status: 500 }
    );
  }
}
