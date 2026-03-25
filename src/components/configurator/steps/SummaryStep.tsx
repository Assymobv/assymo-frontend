"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle2Icon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { TurnstileWidget, type TurnstileInstance } from "@/components/forms/TurnstileWidget";
import type { WizardAnswers, ContactDetails } from "../Wizard";

// =============================================================================
// Types
// =============================================================================

interface ProductOption {
  slug: string;
  name: string;
}

interface PriceData {
  min: number;
  min_formatted: string;
  range_formatted: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DateAvailability {
  date: string;
  is_open: boolean;
  slots: TimeSlot[];
}

interface SummaryStepProps {
  selectedProduct: string | null;
  products: ProductOption[];
  answers: WizardAnswers;
  contactDetails: ContactDetails;
  onSubmissionComplete?: (data: {
    submissionId: string;
    appointmentId?: number;
    appointmentDate?: string;
    appointmentTime?: string;
  }) => void;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function SummaryStep({
  selectedProduct,
  products,
  answers,
  contactDetails,
  onSubmissionComplete,
  className,
}: SummaryStepProps) {
  const productName =
    products.find((p) => p.slug === selectedProduct)?.name || selectedProduct;

  // Price calculation state
  const [price, setPrice] = useState<PriceData | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Submission state
  const [submissionStatus, setSubmissionStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Appointment state
  const [showAppointmentPicker, setShowAppointmentPicker] = useState(false);
  const [availability, setAvailability] = useState<DateAvailability[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Turnstile state
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Calendar navigation
  const [calendarStartDate, setCalendarStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Calculate price on mount
  useEffect(() => {
    async function fetchPrice() {
      if (!selectedProduct) {
        setPriceLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/configurator/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_slug: selectedProduct,
            answers,
          }),
        });

        if (!response.ok) {
          throw new Error("Kon prijs niet berekenen");
        }

        const data = await response.json();
        setPrice(data.price);
      } catch (err) {
        console.error("Error fetching price:", err);
        setPriceError("Er is iets misgegaan bij het berekenen van de prijs.");
      } finally {
        setPriceLoading(false);
      }
    }

    fetchPrice();
  }, [selectedProduct, answers]);

  // Submit quote when price is loaded, token is ready, and not yet submitted
  useEffect(() => {
    if (price && turnstileToken && submissionStatus === "idle") {
      submitQuote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, turnstileToken, submissionStatus]);

  // Submit quote function
  const submitQuote = async (appointmentData?: {
    date: string;
    time: string;
    id?: number;
  }) => {
    if (submissionStatus === "submitting") return;

    setSubmissionStatus("submitting");
    setSubmissionError(null);

    try {
      const response = await fetch("/api/configurator/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kon offerte niet versturen");
      }

      const data = await response.json();
      setSubmissionId(data.submission_id);
      setSubmissionStatus("success");

      if (appointmentData) {
        setAppointmentId(appointmentData.id ?? null);
        setAppointmentBooked(true);
      }

      // Notify parent
      onSubmissionComplete?.({
        submissionId: data.submission_id,
        appointmentId: appointmentData?.id,
        appointmentDate: appointmentData?.date,
        appointmentTime: appointmentData?.time,
      });
    } catch (err) {
      console.error("Error submitting quote:", err);
      setSubmissionError(
        err instanceof Error
          ? err.message
          : "Er is iets misgegaan bij het versturen.",
      );
      setSubmissionStatus("error");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  // Fetch availability for appointments
  const fetchAvailability = useCallback(async (startDate: Date) => {
    setAvailabilityLoading(true);

    try {
      const start = startDate.toISOString().split("T")[0];
      const end = new Date(startDate);
      end.setDate(end.getDate() + 28); // 4 weeks
      const endStr = end.toISOString().split("T")[0];

      const response = await fetch(
        `/api/appointments/availability?startDate=${start}&endDate=${endStr}`,
      );

      if (!response.ok) {
        throw new Error("Kon beschikbaarheid niet ophalen");
      }

      const data = await response.json();
      setAvailability(data.dates || []);
    } catch (err) {
      console.error("Error fetching availability:", err);
      setAvailability([]);
    } finally {
      setAvailabilityLoading(false);
    }
  }, []);

  // Fetch availability when showing picker
  useEffect(() => {
    if (showAppointmentPicker) {
      fetchAvailability(calendarStartDate);
    }
  }, [showAppointmentPicker, calendarStartDate, fetchAvailability]);

  // Book appointment
  const bookAppointment = async () => {
    if (!selectedDate || !selectedTime) return;

    setBookingLoading(true);
    setBookingError(null);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kon afspraak niet boeken");
      }

      const data = await response.json();

      // Now resubmit the quote with the appointment info
      await submitQuote({
        date: selectedDate,
        time: selectedTime,
        id: data.appointment?.id,
      });

      setAppointmentId(data.appointment?.id);
      setAppointmentBooked(true);
    } catch (err) {
      console.error("Error booking appointment:", err);
      setBookingError(
        err instanceof Error
          ? err.message
          : "Er is iets misgegaan bij het boeken.",
      );
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setBookingLoading(false);
    }
  };

  // Get first available slot
  const getFirstAvailableSlot = (): { date: string; time: string } | null => {
    for (const day of availability) {
      if (day.is_open) {
        const availableSlot = day.slots.find((s) => s.available);
        if (availableSlot) {
          return { date: day.date, time: availableSlot.time };
        }
      }
    }
    return null;
  };

  // Select first available slot
  const selectFirstAvailable = () => {
    const first = getFirstAvailableSlot();
    if (first) {
      setSelectedDate(first.date);
      setSelectedTime(first.time);
    }
  };

  // Get slots for selected date
  const selectedDateSlots =
    availability.find((d) => d.date === selectedDate)?.slots || [];

  // Navigate calendar
  const navigateCalendar = (direction: "prev" | "next") => {
    const newDate = new Date(calendarStartDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));

    // Don't go before today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) {
      return;
    }

    setCalendarStartDate(newDate);
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // Format time for display
  const formatTimeDisplay = (timeStr: string) => {
    return `${timeStr} uur`;
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Success Banner */}
      {submissionStatus === "success" && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
          <CheckCircle2Icon className="size-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-green-800">Mail verstuurd!</p>
            <p className="text-sm text-green-700 mt-1">
              U ontvangt binnen enkele minuten een bevestiging per e-mail op{" "}
              <strong>{contactDetails.email}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {submissionStatus === "error" && submissionError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="font-medium text-red-800">Er is iets misgegaan</p>
          <p className="text-sm text-red-700 mt-1">{submissionError}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              setSubmissionStatus("idle");
              turnstileRef.current?.reset();
              setTurnstileToken(null);
            }}
          >
            Opnieuw proberen
          </Button>
        </div>
      )}

      {/* Turnstile verification */}
      <TurnstileWidget
        ref={turnstileRef}
        onSuccess={setTurnstileToken}
        onError={() => setTurnstileToken(null)}
        onExpire={() => setTurnstileToken(null)}
      />

      {/* Price Card */}
      <Card className="bg-accent-dark text-accent-light">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg opacity-80">Prijsschatting</CardTitle>
        </CardHeader>
        <CardContent>
          {priceLoading ? (
            <div className="flex items-center gap-2">
              <Spinner className="size-5" />
              <span>Prijs berekenen...</span>
            </div>
          ) : priceError ? (
            <p className="text-red-300">{priceError}</p>
          ) : price ? (
            <>
              <p className="text-3xl font-bold">{price.range_formatted}</p>
              <p className="text-sm opacity-70 mt-2">
                Dit is een indicatieve vanafprijs. De uiteindelijke prijs is
                afhankelijk van een plaatsbezoek.
              </p>
            </>
          ) : (
            <p className="opacity-70">Geen prijs beschikbaar</p>
          )}
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Uw configuratie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-stone-500">Product</dt>
            <dd className="mt-1 text-sm text-stone-900">
              {productName || "Niet geselecteerd"}
            </dd>
          </div>

          {Object.entries(answers).length > 0 ? (
            <div className="border-t pt-4">
              <dt className="text-sm font-medium text-stone-500 mb-2">
                Keuzes
              </dt>
              <dl className="space-y-2">
                {Object.entries(answers).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <dt className="text-stone-600 capitalize">
                      {key.replace(/_/g, " ")}
                    </dt>
                    <dd className="text-stone-900 font-medium">
                      {formatAnswerValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <p className="text-sm text-stone-500 italic">
              Geen aanvullende keuzes gemaakt
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contact Details Summary */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Uw gegevens</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <SummaryRow label="Naam" value={contactDetails.name} />
            <SummaryRow label="E-mail" value={contactDetails.email} />
            <SummaryRow label="Telefoon" value={contactDetails.phone} />
            <SummaryRow label="Adres" value={`${contactDetails.street}, ${contactDetails.postalCode} ${contactDetails.city}`} />
          </dl>
        </CardContent>
      </Card>

      {/* Appointment Section */}
      {submissionStatus === "success" && !appointmentBooked && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="size-5" />
              Afspraak inplannen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAppointmentPicker ? (
              <>
                <p className="text-sm text-stone-600 mb-4">
                  Plan direct een vrijblijvend plaatsbezoek in. Tijdens dit
                  bezoek nemen we de exacte afmetingen op en bespreken we uw
                  wensen.
                </p>
                <Button
                  onClick={() => setShowAppointmentPicker(true)}
                  className="w-full bg-accent-dark text-accent-light hover:bg-accent-dark/90"
                >
                  Afspraak maken
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                {/* Quick select */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectFirstAvailable}
                  disabled={availabilityLoading || !getFirstAvailableSlot()}
                >
                  Eerstvolgende beschikbaar
                </Button>

                {/* Calendar navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateCalendar("prev")}
                    disabled={availabilityLoading}
                  >
                    <ChevronLeftIcon className="size-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {calendarStartDate.toLocaleDateString("nl-NL", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateCalendar("next")}
                    disabled={availabilityLoading}
                  >
                    <ChevronRightIcon className="size-4" />
                  </Button>
                </div>

                {/* Date picker */}
                {availabilityLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="size-5" />
                    <span className="ml-2 text-stone-500">
                      Beschikbaarheid laden...
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-stone-500 py-1"
                      >
                        {day}
                      </div>
                    ))}
                    {availability.slice(0, 28).map((day) => {
                      const hasSlots =
                        day.is_open && day.slots.some((s) => s.available);
                      const isSelected = day.date === selectedDate;

                      return (
                        <button
                          key={day.date}
                          onClick={() => {
                            if (hasSlots) {
                              setSelectedDate(day.date);
                              setSelectedTime(null);
                            }
                          }}
                          disabled={!hasSlots}
                          className={cn(
                            "p-2 text-sm rounded-md transition-colors",
                            hasSlots
                              ? "hover:bg-stone-100 cursor-pointer"
                              : "text-stone-300 cursor-not-allowed",
                            isSelected && "bg-accent-dark text-accent-light",
                          )}
                        >
                          {new Date(day.date).getDate()}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Time slots */}
                {selectedDate && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-stone-700 mb-2">
                      {formatDateDisplay(selectedDate)}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedDateSlots
                        .filter((s) => s.available)
                        .map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedTime(slot.time)}
                            className={cn(
                              "p-2 text-sm rounded-md border transition-colors",
                              selectedTime === slot.time
                                ? "border-accent-dark bg-accent-dark text-accent-light"
                                : "border-stone-200 hover:border-stone-300",
                            )}
                          >
                            {slot.time}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Booking error */}
                {bookingError && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {bookingError}
                  </div>
                )}

                {/* Confirm button */}
                {selectedDate && selectedTime && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-stone-600 mb-3">
                      Uw afspraak:{" "}
                      <strong>
                        {formatDateDisplay(selectedDate)} om{" "}
                        {formatTimeDisplay(selectedTime)}
                      </strong>
                    </p>
                    <Button
                      onClick={bookAppointment}
                      disabled={bookingLoading}
                      className="w-full bg-accent-dark text-accent-light hover:bg-accent-dark/90"
                    >
                      {bookingLoading ? (
                        <>
                          <Spinner className="size-4 mr-2" />
                          Bezig met boeken...
                        </>
                      ) : (
                        "Afspraak bevestigen"
                      )}
                    </Button>
                  </div>
                )}

                {/* Cancel button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAppointmentPicker(false);
                    setSelectedDate(null);
                    setSelectedTime(null);
                  }}
                >
                  Annuleren
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Appointment Confirmed */}
      {appointmentBooked && selectedDate && selectedTime && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
              <CheckCircle2Icon className="size-5" />
              Afspraak bevestigd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              <strong>{formatDateDisplay(selectedDate)}</strong> om{" "}
              <strong>{formatTimeDisplay(selectedTime)}</strong>
            </p>
            <p className="text-sm text-green-600 mt-2">
              U ontvangt een aparte bevestigingsmail met alle details.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submitting indicator */}
      {submissionStatus === "submitting" && (
        <div className="flex items-center justify-center py-4 text-stone-500">
          <Spinner className="size-5 mr-2" />
          <span>Offerte versturen...</span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Helper Components
// =============================================================================

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <dt className="text-stone-600">{label}</dt>
      <dd className="text-stone-900 font-medium">{value || "-"}</dd>
    </div>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatAnswerValue(
  value:
    | string
    | string[]
    | number
    | { length: number; width: number; height?: number }
    | undefined,
): string {
  if (value === undefined || value === null) {
    return "-";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "-";
  }

  if (typeof value === "object" && "length" in value && "width" in value) {
    const dims = value as { length: number; width: number; height?: number };
    const parts = [`${dims.length}m x ${dims.width}m`];
    if (dims.height) {
      parts.push(`x ${dims.height}m`);
    }
    return parts.join(" ");
  }

  if (typeof value === "number") {
    return String(value);
  }

  return String(value);
}
