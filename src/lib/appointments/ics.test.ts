// @vitest-environment node
import { describe, test, expect } from 'vitest'
import { generateICS, generateCancellationICS, generateICSFilename, generateCalendarFeed } from './ics'
import type { Appointment } from '@/types/appointments'

const mockAppointment: Appointment = {
  id: 123,
  appointment_date: '2025-01-15',
  appointment_time: '14:00',
  duration_minutes: 60,
  customer_name: 'Jan de Vries',
  customer_email: 'jan@example.com',
  customer_phone: '0612345678',
  customer_street: 'Hoofdstraat 1',
  customer_postal_code: '1234 AB',
  customer_city: 'Amsterdam',
  remarks: 'Graag parkeerplaats reserveren',
  status: 'confirmed',
  edit_token: 'abc123',
  admin_notes: null,
  ip_address: null,
  created_at: new Date('2025-01-10'),
  updated_at: new Date('2025-01-10'),
  cancelled_at: null,
  reminder_sent_at: null,
  deleted_at: null,
}

describe('generateICS', () => {
  test('generates valid ICS format', () => {
    const ics = generateICS(mockAppointment)

    // Check ICS structure
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('END:VEVENT')
    expect(ics).toContain('VERSION:2.0')
  })

  test('includes correct date and time', () => {
    const ics = generateICS(mockAppointment)

    // Start: 2025-01-15 14:00 -> 20250115T140000
    expect(ics).toContain('DTSTART:20250115T140000')
    // End: 14:00 + 60min = 15:00 -> 20250115T150000
    expect(ics).toContain('DTEND:20250115T150000')
  })

  test('includes customer info in summary and description', () => {
    const ics = generateICS(mockAppointment)

    expect(ics).toContain('SUMMARY:Afspraak: Jan de Vries')
    expect(ics).toContain('jan@example.com')
    expect(ics).toContain('0612345678')
    expect(ics).toContain('Hoofdstraat 1')
  })

  test('includes remarks in description', () => {
    const ics = generateICS(mockAppointment)

    expect(ics).toContain('Graag parkeerplaats reserveren')
  })

  test('generates unique UID', () => {
    const ics = generateICS(mockAppointment)

    expect(ics).toContain('UID:appointment-123@assymo.be')
  })

  test('sets METHOD:REQUEST for new appointments', () => {
    const ics = generateICS(mockAppointment)

    expect(ics).toContain('METHOD:REQUEST')
    expect(ics).toContain('STATUS:CONFIRMED')
  })

  test('escapes special characters', () => {
    const appointmentWithSpecialChars: Appointment = {
      ...mockAppointment,
      customer_name: 'Test; User, Name',
      remarks: 'Line 1\nLine 2',
    }

    const ics = generateICS(appointmentWithSpecialChars)

    // Semicolons and commas should be escaped
    expect(ics).toContain('Test\\; User\\, Name')
  })

  test('handles appointment without remarks', () => {
    const appointmentNoRemarks: Appointment = {
      ...mockAppointment,
      remarks: null,
    }

    const ics = generateICS(appointmentNoRemarks)

    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).not.toContain('Opmerkingen:')
  })

  test('calculates end time correctly for different durations', () => {
    const shortAppointment: Appointment = {
      ...mockAppointment,
      appointment_time: '09:30',
      duration_minutes: 30,
    }

    const ics = generateICS(shortAppointment)

    // 09:30 + 30min = 10:00
    expect(ics).toContain('DTSTART:20250115T093000')
    expect(ics).toContain('DTEND:20250115T100000')
  })
})

describe('generateCancellationICS', () => {
  test('generates valid cancellation ICS', () => {
    const ics = generateCancellationICS(mockAppointment)

    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
  })

  test('sets METHOD:CANCEL and STATUS:CANCELLED', () => {
    const ics = generateCancellationICS(mockAppointment)

    expect(ics).toContain('METHOD:CANCEL')
    expect(ics).toContain('STATUS:CANCELLED')
  })

  test('includes GEANNULEERD in summary', () => {
    const ics = generateCancellationICS(mockAppointment)

    expect(ics).toContain('SUMMARY:GEANNULEERD: Afspraak Jan de Vries')
  })

  test('uses same UID as original appointment', () => {
    const ics = generateCancellationICS(mockAppointment)

    expect(ics).toContain('UID:appointment-123@assymo.be')
  })

  test('increments SEQUENCE for cancellation', () => {
    const originalIcs = generateICS(mockAppointment)
    const cancelIcs = generateCancellationICS(mockAppointment)

    expect(originalIcs).toContain('SEQUENCE:0')
    expect(cancelIcs).toContain('SEQUENCE:1')
  })
})

describe('generateICSFilename', () => {
  test('generates filename with date', () => {
    const filename = generateICSFilename(mockAppointment)

    expect(filename).toBe('assymo-afspraak-20250115.ics')
  })

  test('removes dashes from date', () => {
    const appointmentDifferentDate: Appointment = {
      ...mockAppointment,
      appointment_date: '2025-12-31',
    }

    const filename = generateICSFilename(appointmentDifferentDate)

    expect(filename).toBe('assymo-afspraak-20251231.ics')
  })
})

describe('generateCalendarFeed', () => {
  const mockAppointment2: Appointment = {
    ...mockAppointment,
    id: 456,
    appointment_date: '2025-01-20',
    appointment_time: '10:00',
    customer_name: 'Piet Jansen',
    customer_email: 'piet@example.com',
  }

  test('generates valid ICS feed with multiple events', () => {
    const feed = generateCalendarFeed([mockAppointment, mockAppointment2])

    // Check overall structure
    expect(feed).toContain('BEGIN:VCALENDAR')
    expect(feed).toContain('END:VCALENDAR')
    expect(feed).toContain('METHOD:PUBLISH')

    // Should have two events
    const eventCount = (feed.match(/BEGIN:VEVENT/g) || []).length
    expect(eventCount).toBe(2)
  })

  test('includes calendar name header', () => {
    const feed = generateCalendarFeed([mockAppointment])

    expect(feed).toContain('X-WR-CALNAME:Assymo Afspraken')
  })

  test('allows custom calendar name', () => {
    const feed = generateCalendarFeed([mockAppointment], 'Custom Calendar')

    expect(feed).toContain('X-WR-CALNAME:Custom Calendar')
  })

  test('includes timezone header', () => {
    const feed = generateCalendarFeed([mockAppointment])

    expect(feed).toContain('X-WR-TIMEZONE:Europe/Brussels')
  })

  test('generates empty calendar when no appointments', () => {
    const feed = generateCalendarFeed([])

    expect(feed).toContain('BEGIN:VCALENDAR')
    expect(feed).toContain('END:VCALENDAR')
    expect(feed).not.toContain('BEGIN:VEVENT')
  })

  test('includes unique UIDs for each appointment', () => {
    const feed = generateCalendarFeed([mockAppointment, mockAppointment2])

    expect(feed).toContain('UID:appointment-123@assymo.be')
    expect(feed).toContain('UID:appointment-456@assymo.be')
  })

  test('includes customer details in each event', () => {
    const feed = generateCalendarFeed([mockAppointment, mockAppointment2])

    expect(feed).toContain('SUMMARY:Afspraak: Jan de Vries')
    expect(feed).toContain('SUMMARY:Afspraak: Piet Jansen')
  })
})
