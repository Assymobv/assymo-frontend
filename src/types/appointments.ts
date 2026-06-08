/**
 * Appointment booking system types
 */

// =============================================================================
// Database Models
// =============================================================================

/**
 * Weekly schedule settings for a day of the week
 */
export interface AppointmentSettings {
  id: number;
  day_of_week: number; // 0=Monday, 1=Tuesday, ..., 6=Sunday
  is_open: boolean;
  open_time: string | null; // "HH:MM" format
  close_time: string | null; // "HH:MM" format
  slot_duration_minutes: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Date-specific override (holiday, special closure, or custom hours)
 */
export interface DateOverride {
  id: number;
  date: string; // "YYYY-MM-DD" format (start date)
  end_date: string | null; // "YYYY-MM-DD" format (end date for ranges, null = single day)
  is_closed: boolean;
  open_time: string | null; // Override hours if not fully closed
  close_time: string | null;
  reason: string | null; // e.g., "Feestdag", "Vakantie"
  is_recurring: boolean; // Repeat yearly (matches month/day regardless of year)
  recurrence_day_of_week: number | null; // 0-6 (Mon-Sun) for weekly recurring, null = not weekly
  show_on_website: boolean; // Publish to public website closures API
  created_at: Date;
}

/**
 * Appointment record
 */
export interface Appointment {
  id: number;
  appointment_date: string; // "YYYY-MM-DD" format
  appointment_time: string; // "HH:MM" format
  duration_minutes: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_street: string;
  customer_postal_code: string;
  customer_city: string;
  remarks: string | null;
  status: AppointmentStatus;
  edit_token: string;
  admin_notes: string | null;
  ip_address: string | null;
  created_at: Date;
  updated_at: Date;
  cancelled_at: Date | null;
  reminder_sent_at: Date | null;
  deleted_at: Date | null;
}

export type AppointmentStatus = "confirmed" | "cancelled" | "completed";

// =============================================================================
// API Input Types
// =============================================================================

/**
 * Input for creating a new appointment (public booking)
 */
export interface CreateAppointmentInput {
  appointment_date: string; // "YYYY-MM-DD"
  appointment_time: string; // "HH:MM"
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_street: string;
  customer_postal_code: string;
  customer_city: string;
  remarks?: string;
}

/**
 * Input for updating an appointment
 */
export interface UpdateAppointmentInput {
  appointment_date?: string;
  appointment_time?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_street?: string;
  customer_postal_code?: string;
  customer_city?: string;
  remarks?: string;
  status?: AppointmentStatus;
  admin_notes?: string;
}

/**
 * Input for updating weekly settings
 */
export interface UpdateSettingsInput {
  day_of_week: number;
  is_open: boolean;
  open_time?: string | null;
  close_time?: string | null;
  slot_duration_minutes?: number;
}

/**
 * Input for creating a date override
 */
export interface CreateDateOverrideInput {
  date: string; // "YYYY-MM-DD" (start date)
  end_date?: string | null; // "YYYY-MM-DD" (end date for ranges)
  is_closed: boolean;
  open_time?: string | null;
  close_time?: string | null;
  reason?: string;
  is_recurring?: boolean; // Repeat yearly
  recurrence_day_of_week?: number | null; // 0-6 (Mon-Sun) for weekly recurring
  show_on_website?: boolean; // Publish to public website
}

// =============================================================================
// Availability Types
// =============================================================================

/**
 * A single time slot
 */
export interface TimeSlot {
  time: string; // "HH:MM" format
  available: boolean;
}

/**
 * Availability for a single date
 */
export interface DateAvailability {
  date: string; // "YYYY-MM-DD"
  is_open: boolean;
  slots: TimeSlot[];
}

/**
 * Response from availability API
 */
export interface AvailabilityResponse {
  dates: DateAvailability[];
}

/**
 * Day schedule info (computed from settings + overrides)
 */
export interface DaySchedule {
  date: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  slot_duration_minutes: number;
  override_reason?: string | null;
}

// =============================================================================
// API Response Types
// =============================================================================

/**
 * Successful appointment creation response
 */
export interface AppointmentCreatedResponse {
  success: true;
  appointment: Appointment;
  edit_url: string;
}

/**
 * Public appointment view (for customer via token)
 */
export interface PublicAppointmentView {
  id: number;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_street: string;
  customer_postal_code: string;
  customer_city: string;
  remarks: string | null;
  status: AppointmentStatus;
  created_at: Date;
}

/**
 * Admin appointment list item
 */
export interface AppointmentListItem {
  id: number;
  appointment_date: string;
  appointment_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: AppointmentStatus;
  created_at: Date;
}

/**
 * Admin appointments filter options
 */
export interface AppointmentsFilter {
  start_date?: string;
  end_date?: string;
  status?: AppointmentStatus | "all";
  search?: string; // Search in name, email, phone
}

/**
 * Public closure info (for website display)
 */
export interface PublicClosure {
  id: number;
  start_date: string; // "YYYY-MM-DD"
  end_date: string | null; // "YYYY-MM-DD" or null for single day
  is_closed: boolean;
  reason: string | null;
  is_recurring: boolean;
}

// =============================================================================
// UI Helper Types
// =============================================================================

/**
 * Day of week with Dutch name
 */
export interface DayOfWeek {
  value: number;
  name: string; // Dutch name
  shortName: string; // Abbreviated
}

/**
 * Days of week constant (Dutch)
 * Note: Week starts on Monday (value 0) through Sunday (value 6)
 * This differs from JavaScript's Date.getDay() which uses Sunday=0
 * Use getDayOfWeek() from utils.ts to convert correctly
 */
export const DAYS_OF_WEEK: DayOfWeek[] = [
  { value: 0, name: "Maandag", shortName: "Ma" },
  { value: 1, name: "Dinsdag", shortName: "Di" },
  { value: 2, name: "Woensdag", shortName: "Wo" },
  { value: 3, name: "Donderdag", shortName: "Do" },
  { value: 4, name: "Vrijdag", shortName: "Vr" },
  { value: 5, name: "Zaterdag", shortName: "Za" },
  { value: 6, name: "Zondag", shortName: "Zo" },
];

/**
 * Status labels (Dutch)
 */
export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  confirmed: "Bevestigd",
  cancelled: "Geannuleerd",
  completed: "Afgerond",
};
