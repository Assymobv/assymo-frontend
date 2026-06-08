// Query functions
export {
  // Settings
  getAppointmentSettings,
  getSettingsForDay,
  updateSettings,
  // Date overrides
  getDateOverrides,
  getAllDateOverrides,
  getDateOverride,
  createDateOverride,
  deleteDateOverride,
  getPublicClosures,
  // Appointments
  getAppointmentsByDateRange,
  getAllAppointments,
  getAppointmentById,
  getAppointmentByToken,
  isSlotBooked,
  getBookedSlots,
  getBookedSlotsInRange,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  softDeleteAppointment,
  searchAppointments,
  getUpcomingAppointmentsCount,
} from "./queries";

// Availability
export {
  getDaySchedule,
  getAvailableSlots,
  isSlotAvailable,
  getAvailability,
  getAvailableDates,
  getNextAvailableDate,
} from "./availability";

// Utilities
export {
  generateEditToken,
  formatDateNL,
  formatDateShortNL,
  formatTimeNL,
  formatDateTimeNL,
  timeToMinutes,
  minutesToTime,
  generateTimeSlots,
  toDateString,
  isDateInPast,
  isToday,
  getCurrentTime,
  isTimeInPast,
  getDayOfWeek,
  getDateRange,
  formatAddress,
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
  normalizePostalCode,
} from "./utils";

// ICS generation
export { generateICS, generateCancellationICS, generateICSFilename } from "./ics";

// Email services
export {
  sendConfirmationEmail,
  sendAdminNotification,
  sendCancellationEmail,
  sendUpdateEmail,
  sendNewAppointmentEmails,
} from "./email";
