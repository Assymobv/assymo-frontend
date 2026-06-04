"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "./Calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  CalendarIcon,
  Loader2Icon,
  CalendarClockIcon,
  CircleUserRoundIcon,
  CheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTracking } from "@/lib/tracking";
import { toast } from "sonner";
import type { DateAvailability } from "@/types/appointments";
import { formatDateNL } from "@/lib/appointments/utils";
import { actionVariants } from "../shared/Action";
import { Label } from "../ui/label";
import { TurnstileWidget, type TurnstileInstance } from "@/components/forms/TurnstileWidget";

type FormStep = "datetime" | "details";

interface FormData {
  appointment_date: string;
  appointment_time: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_street: string;
  customer_postal_code: string;
  customer_city: string;
  remarks: string;
}

const initialFormData: FormData = {
  appointment_date: "",
  appointment_time: "",
  customer_name: "",
  customer_email: "",
  customer_phone: "",
  customer_street: "",
  customer_postal_code: "",
  customer_city: "",
  remarks: "",
};

interface BookingFormProps {
  className?: string;
}

export function BookingForm({ className }: BookingFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>("datetime");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [availability, setAvailability] = useState<DateAvailability[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { track } = useTracking();
  const hasTrackedStart = useRef(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  // First-touch source of this booking, captured once on mount. Visitors land
  // directly on /afspraak, so document.referrer here is the true external source.
  const bookingSource = useRef<{ referrer: string; landing_url: string } | null>(
    null,
  );

  // Fetch availability for a month range
  const fetchAvailability = useCallback(async (year: number, month: number) => {
    setLoadingAvailability(true);
    try {
      // Get first day of month
      const startDate = new Date(year, month, 1);
      // Get last day of month
      const endDate = new Date(year, month + 1, 0);

      const startStr = startDate.toISOString().split("T")[0];
      const endStr = endDate.toISOString().split("T")[0];

      const response = await fetch(
        `/api/appointments/availability?start_date=${startStr}&end_date=${endStr}`,
      );

      if (!response.ok) {
        throw new Error("Kon beschikbaarheid niet laden");
      }

      const data = await response.json();
      setAvailability(data.dates || []);
    } catch (err) {
      console.error("Failed to fetch availability:", err);
      toast.error("Kon beschikbaarheid niet laden");
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  // Initial load - fetch availability
  useEffect(() => {
    const now = new Date();
    fetchAvailability(now.getFullYear(), now.getMonth());
  }, [fetchAvailability]);

  // Track booking started (once) and capture first-touch source
  useEffect(() => {
    if (!hasTrackedStart.current) {
      track("booking_started");
      hasTrackedStart.current = true;
    }
    if (bookingSource.current === null) {
      bookingSource.current = {
        referrer: document.referrer || "",
        landing_url: window.location.href || "",
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateTimeSelect = (date: string, time: string) => {
    setFormData((prev) => ({
      ...prev,
      appointment_date: date,
      appointment_time: time,
    }));
    track("booking_date_selected", { date, time });
    setCurrentStep("details");
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleMonthChange = (year: number, month: number) => {
    fetchAvailability(year, month);
  };

  const updateField = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isDetailsValid = () => {
    return (
      formData.customer_name.trim() !== "" &&
      formData.customer_email.trim() !== "" &&
      formData.customer_phone.trim() !== "" &&
      formData.customer_street.trim() !== "" &&
      formData.customer_postal_code.trim() !== "" &&
      formData.customer_city.trim() !== ""
    );
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDetailsValid()) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          turnstile_token: turnstileToken,
          source: bookingSource.current,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kon afspraak niet aanmaken");
      }

      track("booking_completed", {
        date: formData.appointment_date,
        time: formData.appointment_time,
      });
      // Redirect to appointment page with success status (relative URL for correct domain)
      router.push(`/afspraak/${data.appointment.edit_token}?status=booked`);
    } catch (err) {
      console.error("Failed to create appointment:", err);
      track("booking_error", {
        error_type: err instanceof Error ? err.message : "unknown",
      });
      setError(
        err instanceof Error
          ? err.message
          : "Er is iets misgegaan. Probeer opnieuw.",
      );
      toast.error(
        err instanceof Error ? err.message : "Kon afspraak niet aanmaken",
      );
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentStep === "details") setCurrentStep("datetime");
  };

  const steps = [
    { id: "datetime", label: "Datum & tijd", icon: CalendarClockIcon },
    { id: "details", label: "Gegevens", icon: CircleUserRoundIcon },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {/* Progress steps */}
      <div className="flex gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = index < currentStepIndex;

          return (
            <div key={step.id} className="flex-1 flex flex-col gap-3">
              <div
                className={cn(
                  "flex items-center gap-1.5 text-sm",
                  isCompleted && "text-accent-dark",
                  isActive && "text-stone-800 font-medium",
                  !isActive && !isCompleted && "text-stone-600 font-normal",
                )}
              >
                <Icon className="size-4" />
                <span>{step.label}</span>
              </div>
              <div
                className={cn(
                  "h-0.5",
                  isCompleted && "bg-accent-light",
                  isActive && "bg-stone-500",
                  !isActive && !isCompleted && "bg-stone-200",
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-stone-200 p-6">
        {/* Date & time selection */}
        {currentStep === "datetime" && (
          <Calendar
            selectedDate={formData.appointment_date}
            selectedTime={formData.appointment_time}
            onDateTimeSelect={handleDateTimeSelect}
            availability={availability}
            loading={loadingAvailability}
            onMonthChange={handleMonthChange}
          />
        )}

        {/* Customer details */}
        {currentStep === "details" && (
          <div className="flex flex-col gap-6">
            <h3 className="mb-0!">Uw gegevens</h3>
            <form onSubmit={handleDetailsSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="customer_name">
                    Naam *
                  </FieldLabel>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) =>
                      updateField("customer_name", e.target.value)
                    }
                    placeholder="Volledige naam"
                    required
                    autoComplete="name"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="customer_email">
                      E-mailadres *
                    </FieldLabel>
                    <Input
                      id="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) =>
                        updateField("customer_email", e.target.value)
                      }
                      placeholder="email@voorbeeld.be"
                      required
                      autoComplete="email"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="customer_phone">
                      Telefoonnummer *
                    </FieldLabel>
                    <Input
                      id="customer_phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) =>
                        updateField("customer_phone", e.target.value)
                      }
                      placeholder="0412 34 56 78"
                      required
                      autoComplete="tel"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="customer_street">
                    Straat en huisnummer *
                  </FieldLabel>
                  <Input
                    id="customer_street"
                    value={formData.customer_street}
                    onChange={(e) =>
                      updateField("customer_street", e.target.value)
                    }
                    placeholder="Straatnaam 123"
                    required
                    autoComplete="street-address"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="customer_postal_code">
                      Postcode *
                    </FieldLabel>
                    <Input
                      id="customer_postal_code"
                      value={formData.customer_postal_code}
                      onChange={(e) =>
                        updateField("customer_postal_code", e.target.value)
                      }
                      placeholder="1234"
                      required
                      autoComplete="postal-code"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="customer_city">
                      Plaats *
                    </FieldLabel>
                    <Input
                      id="customer_city"
                      value={formData.customer_city}
                      onChange={(e) =>
                        updateField("customer_city", e.target.value)
                      }
                      placeholder="Plaatsnaam"
                      required
                      autoComplete="address-level2"
                    />
                  </Field>
                </div>

                <Separator />

                <Field>
                  <FieldLabel htmlFor="remarks">
                    Opmerkingen (optioneel)
                  </FieldLabel>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => updateField("remarks", e.target.value)}
                    placeholder="Eventuele opmerkingen of vragen..."
                    rows={3}
                  />
                </Field>

                <Separator />

                {/* Selected date/time display */}
                <div className="flex flex-col gap-3">
                  <Label>Datum &amp; tijd</Label>
                  <div className="flex items-center justify-between bg-stone-100 rounded-lg p-4">
                    <p className="mb-0! font-medium">
                      {formatDateNL(formData.appointment_date)}{" "}
                      <span className="font-normal text-stone-600">om</span>{" "}
                      {formData.appointment_time}{" "}
                      <span className="font-normal text-stone-600">uur</span>
                    </p>
                    <button
                      onClick={goBack}
                      className={actionVariants({ variant: "secondary" })}
                    >
                      <CalendarClockIcon />
                      Wijzig
                    </button>
                  </div>
                </div>

                <TurnstileWidget
                  ref={turnstileRef}
                  onSuccess={setTurnstileToken}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                />

                {error && <FieldError>{error}</FieldError>}

                <div className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    disabled={!isDetailsValid() || submitting || !turnstileToken}
                    className={actionVariants({ variant: "primary" })}
                  >
                    {submitting ? (
                      <>
                        <Loader2Icon className="size-4 animate-spin" />
                        Bezig met aanmaken...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="size-4" />
                        Bevestig afspraak
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-stone-500">
                    Na het bevestigen ontvangt u een e-mail met de details van
                    uw afspraak en een link om deze te wijzigen of te annuleren.
                  </p>
                </div>
              </FieldGroup>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
