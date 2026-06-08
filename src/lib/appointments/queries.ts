import { sql } from "@/lib/db";
import type {
  Appointment,
  AppointmentSettings,
  DateOverride,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  UpdateSettingsInput,
  CreateDateOverrideInput,
  AppointmentStatus,
} from "@/types/appointments";
import { generateEditToken } from "./utils";

// =============================================================================
// Appointment Settings (Weekly Schedule)
// =============================================================================

/**
 * Get all appointment settings (weekly schedule)
 */
export async function getAppointmentSettings(): Promise<AppointmentSettings[]> {
  const rows = await sql`
    SELECT
      id,
      day_of_week,
      is_open,
      open_time::text,
      close_time::text,
      slot_duration_minutes,
      created_at,
      updated_at
    FROM appointment_opening_hours
    ORDER BY day_of_week
  `;

  return rows as AppointmentSettings[];
}

/**
 * Get settings for a specific day of the week
 */
export async function getSettingsForDay(
  dayOfWeek: number
): Promise<AppointmentSettings | null> {
  const rows = await sql`
    SELECT
      id,
      day_of_week,
      is_open,
      open_time::text,
      close_time::text,
      slot_duration_minutes,
      created_at,
      updated_at
    FROM appointment_opening_hours
    WHERE day_of_week = ${dayOfWeek}
  `;

  return (rows[0] as AppointmentSettings) || null;
}

/**
 * Update settings for a day of the week
 */
export async function updateSettings(
  input: UpdateSettingsInput
): Promise<AppointmentSettings> {
  const rows = await sql`
    UPDATE appointment_opening_hours
    SET
      is_open = ${input.is_open},
      open_time = ${input.open_time ?? null},
      close_time = ${input.close_time ?? null},
      slot_duration_minutes = ${input.slot_duration_minutes ?? 60},
      updated_at = NOW()
    WHERE day_of_week = ${input.day_of_week}
    RETURNING
      id,
      day_of_week,
      is_open,
      open_time::text,
      close_time::text,
      slot_duration_minutes,
      created_at,
      updated_at
  `;

  return rows[0] as AppointmentSettings;
}

// =============================================================================
// Date Overrides
// =============================================================================

/**
 * Get date overrides within a date range
 * Includes both single-date overrides and date ranges that overlap with the query range
 * Also includes recurring overrides that match the month/day or day of week
 */
export async function getDateOverrides(
  startDate: string,
  endDate: string
): Promise<DateOverride[]> {
  const rows = await sql`
    SELECT
      id,
      date::text,
      end_date::text,
      is_closed,
      open_time::text,
      close_time::text,
      reason,
      is_recurring,
      recurrence_day_of_week,
      show_on_website,
      created_at
    FROM appointment_date_overrides
    WHERE
      -- Single date or range start falls within query range
      (date >= ${startDate}::date AND date <= ${endDate}::date)
      -- Or range overlaps with query range
      OR (end_date IS NOT NULL AND date <= ${endDate}::date AND end_date >= ${startDate}::date)
      -- Or yearly recurring override matches any date in the range (by month/day)
      OR is_recurring = true
      -- Or weekly recurring override (always include, will be filtered in code)
      OR recurrence_day_of_week IS NOT NULL
    ORDER BY date
  `;

  return rows as DateOverride[];
}

/**
 * Get all date overrides (for admin)
 */
export async function getAllDateOverrides(): Promise<DateOverride[]> {
  const rows = await sql`
    SELECT
      id,
      date::text,
      end_date::text,
      is_closed,
      open_time::text,
      close_time::text,
      reason,
      is_recurring,
      recurrence_day_of_week,
      show_on_website,
      created_at
    FROM appointment_date_overrides
    ORDER BY
      -- Weekly recurring first, then by date desc
      CASE WHEN recurrence_day_of_week IS NOT NULL THEN 0 ELSE 1 END,
      recurrence_day_of_week,
      date DESC
  `;

  return rows as DateOverride[];
}

/**
 * Get override for a specific date
 * Checks for exact date match, date ranges, weekly recurring, and yearly recurring
 */
export async function getDateOverride(
  date: string
): Promise<DateOverride | null> {
  // Extract month, day, and day of week for recurring checks
  const dateObj = new Date(date);
  const month = dateObj.getMonth() + 1; // 1-indexed
  const day = dateObj.getDate();
  // Convert JS day (0=Sun) to our system (0=Mon)
  const jsDayOfWeek = dateObj.getDay();
  const dayOfWeek = jsDayOfWeek === 0 ? 6 : jsDayOfWeek - 1;

  const rows = await sql`
    SELECT
      id,
      date::text,
      end_date::text,
      is_closed,
      open_time::text,
      close_time::text,
      reason,
      is_recurring,
      recurrence_day_of_week,
      show_on_website,
      created_at
    FROM appointment_date_overrides
    WHERE
      -- Exact date match
      date = ${date}::date
      -- Or date falls within a range
      OR (end_date IS NOT NULL AND date <= ${date}::date AND end_date >= ${date}::date)
      -- Or weekly recurring matches day of week
      OR recurrence_day_of_week = ${dayOfWeek}
      -- Or yearly recurring matches month/day
      OR (is_recurring = true AND EXTRACT(MONTH FROM date) = ${month} AND EXTRACT(DAY FROM date) = ${day})
    ORDER BY
      -- Priority: exact > range > weekly recurring > yearly recurring
      CASE
        WHEN date = ${date}::date THEN 1
        WHEN end_date IS NOT NULL THEN 2
        WHEN recurrence_day_of_week IS NOT NULL THEN 3
        ELSE 4
      END
    LIMIT 1
  `;

  return (rows[0] as DateOverride) || null;
}

/**
 * Create a date override
 */
export async function createDateOverride(
  input: CreateDateOverrideInput
): Promise<DateOverride> {
  const rows = await sql`
    INSERT INTO appointment_date_overrides (
      date,
      end_date,
      is_closed,
      open_time,
      close_time,
      reason,
      is_recurring,
      recurrence_day_of_week,
      show_on_website
    )
    VALUES (
      ${input.date}::date,
      ${input.end_date ?? null}::date,
      ${input.is_closed},
      ${input.open_time ?? null},
      ${input.close_time ?? null},
      ${input.reason ?? null},
      ${input.is_recurring ?? false},
      ${input.recurrence_day_of_week ?? null},
      ${input.show_on_website ?? false}
    )
    RETURNING
      id,
      date::text,
      end_date::text,
      is_closed,
      open_time::text,
      close_time::text,
      reason,
      is_recurring,
      recurrence_day_of_week,
      show_on_website,
      created_at
  `;

  return rows[0] as DateOverride;
}

/**
 * Delete a date override
 */
export async function deleteDateOverride(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM appointment_date_overrides
    WHERE id = ${id}
    RETURNING id
  `;

  return result.length > 0;
}

/**
 * Get public closures for website display
 * Returns only overrides with show_on_website = true
 * that are current or upcoming (or recurring)
 */
export async function getPublicClosures(): Promise<DateOverride[]> {
  const rows = await sql`
    SELECT
      id,
      date::text,
      end_date::text,
      is_closed,
      open_time::text,
      close_time::text,
      reason,
      is_recurring,
      recurrence_day_of_week,
      show_on_website,
      created_at
    FROM appointment_date_overrides
    WHERE show_on_website = true
      AND (
        -- Single date: show from 7 days before until day passes
        (end_date IS NULL AND recurrence_day_of_week IS NULL AND NOT is_recurring
         AND date >= CURRENT_DATE AND date <= CURRENT_DATE + INTERVAL '7 days')
        -- Date range: show from 7 days before start until end passes
        OR (end_date IS NOT NULL AND NOT is_recurring
            AND date <= CURRENT_DATE + INTERVAL '7 days' AND end_date >= CURRENT_DATE)
        -- Yearly recurring: show if this/next year's occurrence is within 7 days
        OR (is_recurring = true AND (
          MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::int, EXTRACT(MONTH FROM date)::int, EXTRACT(DAY FROM date)::int)
            BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
          OR MAKE_DATE(EXTRACT(YEAR FROM CURRENT_DATE)::int + 1, EXTRACT(MONTH FROM date)::int, EXTRACT(DAY FROM date)::int)
            BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        ))
        -- Weekly recurring: next occurrence is always within 7 days
        OR recurrence_day_of_week IS NOT NULL
      )
    ORDER BY
      -- Put recurring at the end, sort others by date
      CASE
        WHEN recurrence_day_of_week IS NOT NULL THEN 2
        WHEN is_recurring THEN 1
        ELSE 0
      END,
      recurrence_day_of_week,
      date ASC
  `;

  return rows as DateOverride[];
}

// =============================================================================
// Appointments
// =============================================================================

/**
 * Get appointments within a date range
 */
export async function getAppointmentsByDateRange(
  startDate: string,
  endDate: string,
  status?: AppointmentStatus | "all"
): Promise<Appointment[]> {
  if (status && status !== "all") {
    const rows = await sql`
      SELECT
        id,
        appointment_date::text,
        appointment_time::text,
        duration_minutes,
        customer_name,
        customer_email,
        customer_phone,
        customer_street,
        customer_postal_code,
        customer_city,
        remarks,
        status,
        edit_token,
        admin_notes,
        ip_address,
        created_at,
        updated_at,
        cancelled_at,
        reminder_sent_at
      FROM appointments
      WHERE appointment_date >= ${startDate}::date
        AND appointment_date <= ${endDate}::date
        AND status = ${status}
        AND deleted_at IS NULL
      ORDER BY appointment_date, appointment_time
    `;
    return rows as Appointment[];
  }

  const rows = await sql`
    SELECT
      id,
      appointment_date::text,
      appointment_time::text,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      customer_street,
      customer_postal_code,
      customer_city,
      remarks,
      status,
      edit_token,
      admin_notes,
      ip_address,
      created_at,
      updated_at,
      cancelled_at,
      reminder_sent_at,
      deleted_at
    FROM appointments
    WHERE appointment_date >= ${startDate}::date
      AND appointment_date <= ${endDate}::date
      AND deleted_at IS NULL
    ORDER BY appointment_date, appointment_time
  `;

  return rows as Appointment[];
}

/**
 * Get all appointments (for admin, with optional filters)
 */
export async function getAllAppointments(
  limit = 100,
  offset = 0
): Promise<Appointment[]> {
  const rows = await sql`
    SELECT
      id,
      appointment_date::text,
      appointment_time::text,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      customer_street,
      customer_postal_code,
      customer_city,
      remarks,
      status,
      edit_token,
      admin_notes,
      ip_address,
      created_at,
      updated_at,
      cancelled_at,
      reminder_sent_at,
      deleted_at
    FROM appointments
    WHERE deleted_at IS NULL
    ORDER BY appointment_date DESC, appointment_time DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return rows as Appointment[];
}

/**
 * Get a single appointment by ID
 */
export async function getAppointmentById(
  id: number
): Promise<Appointment | null> {
  const rows = await sql`
    SELECT
      id,
      appointment_date::text,
      appointment_time::text,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      customer_street,
      customer_postal_code,
      customer_city,
      remarks,
      status,
      edit_token,
      admin_notes,
      ip_address,
      created_at,
      updated_at,
      cancelled_at,
      reminder_sent_at,
      deleted_at
    FROM appointments
    WHERE id = ${id}
  `;

  return (rows[0] as Appointment) || null;
}

/**
 * Get a single appointment by edit token (for public access)
 */
export async function getAppointmentByToken(
  token: string
): Promise<Appointment | null> {
  const rows = await sql`
    SELECT
      id,
      appointment_date::text,
      appointment_time::text,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      customer_street,
      customer_postal_code,
      customer_city,
      remarks,
      status,
      edit_token,
      admin_notes,
      ip_address,
      created_at,
      updated_at,
      cancelled_at,
      reminder_sent_at,
      deleted_at
    FROM appointments
    WHERE edit_token = ${token}
      AND deleted_at IS NULL
  `;

  return (rows[0] as Appointment) || null;
}

/**
 * Check if a time slot is already booked
 */
export async function isSlotBooked(
  date: string,
  time: string
): Promise<boolean> {
  const rows = await sql`
    SELECT id FROM appointments
    WHERE appointment_date = ${date}::date
      AND appointment_time = ${time}::time
      AND status != 'cancelled'
      AND deleted_at IS NULL
    LIMIT 1
  `;

  return rows.length > 0;
}

/**
 * Get booked slots for a date
 */
export async function getBookedSlots(date: string): Promise<string[]> {
  const rows = await sql`
    SELECT appointment_time::text as time
    FROM appointments
    WHERE appointment_date = ${date}::date
      AND status != 'cancelled'
      AND deleted_at IS NULL
  `;

  return rows.map((row) => (row as { time: string }).time);
}

/**
 * Get all booked slots for a date range in a single query
 */
export async function getBookedSlotsInRange(
  startDate: string,
  endDate: string
): Promise<Map<string, string[]>> {
  const rows = await sql`
    SELECT appointment_date::text as date, appointment_time::text as time
    FROM appointments
    WHERE appointment_date >= ${startDate}::date
      AND appointment_date <= ${endDate}::date
      AND status != 'cancelled'
      AND deleted_at IS NULL
  `;

  const map = new Map<string, string[]>();
  for (const row of rows) {
    const { date, time } = row as { date: string; time: string };
    const existing = map.get(date);
    if (existing) {
      existing.push(time);
    } else {
      map.set(date, [time]);
    }
  }

  return map;
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  input: CreateAppointmentInput,
  ipAddress?: string,
  bookingSource?: object
): Promise<Appointment> {
  const editToken = generateEditToken();

  const rows = await sql`
    INSERT INTO appointments (
      appointment_date,
      appointment_time,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      customer_street,
      customer_postal_code,
      customer_city,
      remarks,
      edit_token,
      ip_address,
      booking_source
    )
    VALUES (
      ${input.appointment_date}::date,
      ${input.appointment_time}::time,
      60,
      ${input.customer_name},
      ${input.customer_email},
      ${input.customer_phone},
      ${input.customer_street},
      ${input.customer_postal_code},
      ${input.customer_city},
      ${input.remarks ?? null},
      ${editToken},
      ${ipAddress ?? null},
      ${bookingSource ? JSON.stringify(bookingSource) : null}::jsonb
    )
    RETURNING
      id,
      appointment_date::text,
      appointment_time::text,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      customer_street,
      customer_postal_code,
      customer_city,
      remarks,
      status,
      edit_token,
      admin_notes,
      ip_address,
      created_at,
      updated_at,
      cancelled_at,
      reminder_sent_at,
      deleted_at
  `;

  return rows[0] as Appointment;
}

/**
 * Update an appointment
 */
export async function updateAppointment(
  id: number,
  input: UpdateAppointmentInput
): Promise<Appointment | null> {
  // Build dynamic update - only update provided fields
  const updates: string[] = [];
  const values: unknown[] = [];

  if (input.appointment_date !== undefined) {
    updates.push("appointment_date = $1::date");
    values.push(input.appointment_date);
  }
  if (input.appointment_time !== undefined) {
    updates.push(`appointment_time = $${values.length + 1}::time`);
    values.push(input.appointment_time);
  }
  if (input.customer_name !== undefined) {
    updates.push(`customer_name = $${values.length + 1}`);
    values.push(input.customer_name);
  }
  if (input.customer_email !== undefined) {
    updates.push(`customer_email = $${values.length + 1}`);
    values.push(input.customer_email);
  }
  if (input.customer_phone !== undefined) {
    updates.push(`customer_phone = $${values.length + 1}`);
    values.push(input.customer_phone);
  }
  if (input.customer_street !== undefined) {
    updates.push(`customer_street = $${values.length + 1}`);
    values.push(input.customer_street);
  }
  if (input.customer_postal_code !== undefined) {
    updates.push(`customer_postal_code = $${values.length + 1}`);
    values.push(input.customer_postal_code);
  }
  if (input.customer_city !== undefined) {
    updates.push(`customer_city = $${values.length + 1}`);
    values.push(input.customer_city);
  }
  if (input.remarks !== undefined) {
    updates.push(`remarks = $${values.length + 1}`);
    values.push(input.remarks);
  }
  if (input.status !== undefined) {
    updates.push(`status = $${values.length + 1}`);
    values.push(input.status);
  }
  if (input.admin_notes !== undefined) {
    updates.push(`admin_notes = $${values.length + 1}`);
    values.push(input.admin_notes);
  }

  if (updates.length === 0) {
    return getAppointmentById(id);
  }

  // For simplicity, use individual field updates
  const rows = await sql`
    UPDATE appointments
    SET
      appointment_date = COALESCE(${input.appointment_date ?? null}::date, appointment_date),
      appointment_time = COALESCE(${input.appointment_time ?? null}::time, appointment_time),
      customer_name = COALESCE(${input.customer_name ?? null}, customer_name),
      customer_email = COALESCE(${input.customer_email ?? null}, customer_email),
      customer_phone = COALESCE(${input.customer_phone ?? null}, customer_phone),
      customer_street = COALESCE(${input.customer_street ?? null}, customer_street),
      customer_postal_code = COALESCE(${input.customer_postal_code ?? null}, customer_postal_code),
      customer_city = COALESCE(${input.customer_city ?? null}, customer_city),
      remarks = COALESCE(${input.remarks ?? null}, remarks),
      status = COALESCE(${input.status ?? null}, status),
      admin_notes = COALESCE(${input.admin_notes ?? null}, admin_notes),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id,
      appointment_date::text,
      appointment_time::text,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      customer_street,
      customer_postal_code,
      customer_city,
      remarks,
      status,
      edit_token,
      admin_notes,
      ip_address,
      created_at,
      updated_at,
      cancelled_at,
      reminder_sent_at,
      deleted_at
  `;

  return (rows[0] as Appointment) || null;
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(id: number): Promise<Appointment | null> {
  const rows = await sql`
    UPDATE appointments
    SET
      status = 'cancelled',
      cancelled_at = NOW(),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id,
      appointment_date::text,
      appointment_time::text,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      customer_street,
      customer_postal_code,
      customer_city,
      remarks,
      status,
      edit_token,
      admin_notes,
      ip_address,
      created_at,
      updated_at,
      cancelled_at,
      reminder_sent_at,
      deleted_at
  `;

  return (rows[0] as Appointment) || null;
}

/**
 * Soft-delete (archive) an appointment.
 *
 * Sets `deleted_at` so the appointment disappears from all admin views,
 * availability calculations and public token access, while the row is
 * preserved in the database (recoverable, never physically removed).
 *
 * Use `cancelAppointment` for the lighter "cancelled" state (record stays
 * visible but greyed out).
 */
export async function softDeleteAppointment(
  id: number
): Promise<Appointment | null> {
  const rows = await sql`
    UPDATE appointments
    SET
      deleted_at = NOW(),
      updated_at = NOW()
    WHERE id = ${id}
      AND deleted_at IS NULL
    RETURNING
      id,
      appointment_date::text,
      appointment_time::text,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      customer_street,
      customer_postal_code,
      customer_city,
      remarks,
      status,
      edit_token,
      admin_notes,
      ip_address,
      created_at,
      updated_at,
      cancelled_at,
      reminder_sent_at,
      deleted_at
  `;

  return (rows[0] as Appointment) || null;
}

/**
 * Search appointments by customer info
 */
export async function searchAppointments(
  query: string,
  limit = 50
): Promise<Appointment[]> {
  const searchPattern = `%${query}%`;

  const rows = await sql`
    SELECT
      id,
      appointment_date::text,
      appointment_time::text,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      customer_street,
      customer_postal_code,
      customer_city,
      remarks,
      status,
      edit_token,
      admin_notes,
      ip_address,
      created_at,
      updated_at,
      cancelled_at,
      reminder_sent_at,
      deleted_at
    FROM appointments
    WHERE
      deleted_at IS NULL
      AND (
        customer_name ILIKE ${searchPattern}
        OR customer_email ILIKE ${searchPattern}
        OR customer_phone ILIKE ${searchPattern}
      )
    ORDER BY appointment_date DESC, appointment_time DESC
    LIMIT ${limit}
  `;

  return rows as Appointment[];
}

/**
 * Get upcoming appointments count
 */
export async function getUpcomingAppointmentsCount(): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*) as count
    FROM appointments
    WHERE appointment_date >= CURRENT_DATE
      AND status = 'confirmed'
      AND deleted_at IS NULL
  `;

  return Number((rows[0] as { count: string }).count);
}

// =============================================================================
// Reminder Queries
// =============================================================================

/**
 * Get appointments that need reminder emails
 *
 * Criteria:
 * - Appointment is tomorrow (within the reminder window)
 * - Status is 'confirmed'
 * - Reminder hasn't been sent yet
 * - Was booked far enough in advance to warrant a reminder
 *
 * @param hoursBeforeAppointment - Send reminder this many hours before appointment
 * @param minHoursAfterBooking - Only send if booked at least this many hours before appointment
 */
export async function getAppointmentsNeedingReminder(
  hoursBeforeAppointment: number,
  minHoursAfterBooking: number
): Promise<Appointment[]> {
  // Calculate the target date (tomorrow if sending 24h reminders)
  // We want appointments that are within the reminder window
  const rows = await sql`
    SELECT
      id,
      appointment_date::text,
      appointment_time::text,
      duration_minutes,
      customer_name,
      customer_email,
      customer_phone,
      customer_street,
      customer_postal_code,
      customer_city,
      remarks,
      status,
      edit_token,
      admin_notes,
      ip_address,
      created_at,
      updated_at,
      cancelled_at,
      reminder_sent_at,
      deleted_at
    FROM appointments
    WHERE status = 'confirmed'
      AND deleted_at IS NULL
      AND reminder_sent_at IS NULL
      -- Appointment is tomorrow (for 24h reminder)
      AND appointment_date = CURRENT_DATE + INTERVAL '1 day'
      -- Was booked far enough in advance (not a last-minute booking)
      AND created_at <= (appointment_date + appointment_time) - (${minHoursAfterBooking} || ' hours')::interval
    ORDER BY appointment_time
  `;

  return rows as Appointment[];
}

/**
 * Mark an appointment's reminder as sent
 */
export async function markReminderSent(id: number): Promise<boolean> {
  const result = await sql`
    UPDATE appointments
    SET reminder_sent_at = NOW()
    WHERE id = ${id}
    RETURNING id
  `;

  return result.length > 0;
}
