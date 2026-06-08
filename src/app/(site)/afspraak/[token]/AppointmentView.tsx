"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Action, actionVariants } from "@/components/shared/Action";
import {
  Trash2Icon,
  Loader2Icon,
  AlertTriangleIcon,
  CheckIcon,
  XIcon,
  HomeIcon,
  CalendarPlusIcon,
  PencilIcon,
  CircleSlashIcon,
  UserRoundIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PublicAppointmentView } from "@/types/appointments";
import { formatDateNL, formatTimeNL } from "@/lib/appointments/utils";
import { APPOINTMENTS_CONFIG } from "@/config/appointments";
import { generateICS, generateICSFilename } from "@/lib/appointments/ics";

interface AppointmentViewProps {
  token: string;
  initialStatus?: string;
  className?: string;
}

export function AppointmentView({
  token,
  initialStatus,
  className,
}: AppointmentViewProps) {
  const router = useRouter();
  const [appointment, setAppointment] = useState<PublicAppointmentView | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [editData, setEditData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_street: "",
    customer_postal_code: "",
    customer_city: "",
    remarks: "",
  });

  const fetchAppointment = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/appointments/${token}`);
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Afspraak niet gevonden"
            : "Kon afspraak niet laden",
        );
      }

      const data = await response.json();
      setAppointment(data.appointment);
      setEditData({
        customer_name: data.appointment.customer_name,
        customer_email: data.appointment.customer_email,
        customer_phone: data.appointment.customer_phone,
        customer_street: data.appointment.customer_street,
        customer_postal_code: data.appointment.customer_postal_code,
        customer_city: data.appointment.customer_city,
        remarks: data.appointment.remarks || "",
      });
    } catch (err) {
      console.error("Failed to fetch appointment:", err);
      setError(err instanceof Error ? err.message : "Kon afspraak niet laden");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/appointments/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kon wijzigingen niet opslaan");
      }

      toast.success("Wijzigingen opgeslagen");
      setEditing(false);
      fetchAppointment();
    } catch (err) {
      console.error("Failed to save appointment:", err);
      toast.error(
        err instanceof Error ? err.message : "Kon wijzigingen niet opslaan",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const response = await fetch(`/api/appointments/${token}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kon afspraak niet annuleren");
      }

      toast.success("Afspraak geannuleerd");
      router.replace(`/afspraak/${token}?status=cancelled`, { scroll: false });
      fetchAppointment();
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      toast.error(
        err instanceof Error ? err.message : "Kon afspraak niet annuleren",
      );
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const handleDownloadICS = () => {
    if (!appointment) return;

    const fullAppointment = {
      ...appointment,
      edit_token: token,
      admin_notes: null,
      ip_address: null,
      updated_at: appointment.created_at,
      cancelled_at: null,
      reminder_sent_at: null,
      deleted_at: null,
    };

    const icsContent = generateICS(fullAppointment);
    const filename = generateICSFilename(fullAppointment);
    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-16", className)}>
        <Spinner className="size-8" />
      </div>
    );
  }

  // Error state
  if (error || !appointment) {
    return (
      <div className={cn("text-center py-16", className)}>
        <div className="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangleIcon className="size-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Afspraak niet gevonden</h1>
        <p className="text-muted-foreground mb-6">
          {error || "Deze afspraak bestaat niet of is verlopen."}
        </p>
        <Action href="/afspraak" label="Nieuwe afspraak maken" />
      </div>
    );
  }

  const isCancelled =
    appointment.status === "cancelled" || initialStatus === "cancelled";
  const isPast =
    new Date(appointment.appointment_date) <
    new Date(new Date().toDateString());
  const hasChanges =
    editData.customer_name !== appointment.customer_name ||
    editData.customer_email !== appointment.customer_email ||
    editData.customer_phone !== appointment.customer_phone ||
    editData.customer_street !== appointment.customer_street ||
    editData.customer_postal_code !== appointment.customer_postal_code ||
    editData.customer_city !== appointment.customer_city ||
    editData.remarks !== (appointment.remarks || "");

  // Cancelled state
  if (isCancelled) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="size-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XIcon className="size-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Afspraak geannuleerd</h1>
        <p className="text-muted-foreground mb-8">
          Uw afspraak is geannuleerd. U ontvangt een bevestigingsmail.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Action href="/afspraak" label="Nieuwe afspraak maken" />
          <Action
            href="/"
            variant="secondary"
            icon={<HomeIcon />}
            label="Terug naar home"
          />
        </div>
      </div>
    );
  }

  // Main appointment view (fresh booking and return visits)
  return (
    <div className={cn("flex flex-col gap-6 md:gap-10", className)}>
      <header className="flex flex-col gap-2">
        <h1 className="mb-0!">Uw afspraak</h1>
        <p className="text-muted-foreground">
          {initialStatus === "booked"
            ? "Uw afspraak is succesvol ingepland. Binnen enkele minuten ontvangt u een bevestigingsmail."
            : "Bekijk of wijzig uw afspraak hieronder."}
        </p>
      </header>

      <div className="flex gap-6 md:gap-8 p-6 md:p-8 rounded-lg bg-stone-100">
        <div className="flex flex-col h-fit bg-white shadow-sm rounded-[6px]">
          <span className="py-0.5 text-xs uppercase font-medium tracking-wider text-white text-center bg-red-500 rounded-tl-[6px] rounded-tr-[6px]">
            {new Date(appointment.appointment_date).toLocaleDateString(
              "nl-NL",
              { month: "short" },
            )}
          </span>
          <span className="px-4 py-2 text-3xl font-semibold text-center">
            {new Date(appointment.appointment_date).getDate()}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-6 md:gap-8">
          <ul className="flex flex-col gap-6 md:gap-8 *:flex *:flex-col *:gap-1">
            <li>
              <span className="text-xs font-medium uppercase tracking-wider text-stone-600">
                Datum en tijd
              </span>
              <p className="font-medium">
                {formatDateNL(appointment.appointment_date)} om{" "}
                {formatTimeNL(appointment.appointment_time)}
              </p>
            </li>
            <li>
              <span className="text-xs font-medium uppercase tracking-wider text-stone-600">
                Locatie
              </span>
              <p className="font-medium">{APPOINTMENTS_CONFIG.storeAddress}</p>
            </li>
          </ul>

          <button
            onClick={handleDownloadICS}
            className={actionVariants({ variant: "primary" })}
          >
            <CalendarPlusIcon />
            Toevoegen aan agenda
          </button>

          <Separator className="bg-stone-200" />

          {editing ? (
            <div className="flex flex-col gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="edit_name">Naam</FieldLabel>
                  <Input
                    id="edit_name"
                    value={editData.customer_name}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        customer_name: e.target.value,
                      })
                    }
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="edit_email">E-mail</FieldLabel>
                    <Input
                      id="edit_email"
                      type="email"
                      value={editData.customer_email}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          customer_email: e.target.value,
                        })
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit_phone">Telefoon</FieldLabel>
                    <Input
                      id="edit_phone"
                      type="tel"
                      value={editData.customer_phone}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          customer_phone: e.target.value,
                        })
                      }
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="edit_street">
                    Straat en huisnummer
                  </FieldLabel>
                  <Input
                    id="edit_street"
                    value={editData.customer_street}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        customer_street: e.target.value,
                      })
                    }
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="edit_postal">Postcode</FieldLabel>
                    <Input
                      id="edit_postal"
                      value={editData.customer_postal_code}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          customer_postal_code: e.target.value,
                        })
                      }
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="edit_city">Plaats</FieldLabel>
                    <Input
                      id="edit_city"
                      value={editData.customer_city}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          customer_city: e.target.value,
                        })
                      }
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="edit_remarks">Opmerkingen</FieldLabel>
                  <Textarea
                    id="edit_remarks"
                    value={editData.remarks}
                    onChange={(e) =>
                      setEditData({ ...editData, remarks: e.target.value })
                    }
                    rows={3}
                  />
                </Field>
              </FieldGroup>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className={actionVariants({ variant: "primary" })}
                >
                  {saving ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <CheckIcon />
                  )}
                  Opslaan
                </button>
                <button
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className={actionVariants({ variant: "secondary" })}
                >
                  Annuleren
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-600">
                Uw gegevens
              </span>
              <ul className="flex flex-col gap-4 text-base *:flex *:flex-col *:gap-1">
                <li>
                  <span className="text-sm font-medium text-stone-600">
                    Naam
                  </span>
                  <span>{appointment.customer_name}</span>
                </li>
                <li>
                  <span className="text-sm font-medium text-stone-600">
                    E-mailadres
                  </span>
                  {appointment.customer_email}
                </li>
                <li>
                  <span className="text-sm font-medium text-stone-600">
                    Telefoonnummer
                  </span>
                  {appointment.customer_phone}
                </li>
                <li>
                  <span className="text-sm font-medium text-stone-600">
                    Adres
                  </span>
                  {appointment.customer_street}
                  <br></br>
                  {appointment.customer_postal_code} {appointment.customer_city}
                </li>
                {appointment.remarks && (
                  <li>
                    <span className="text-sm font-medium text-stone-600">
                      Opmerkingen
                    </span>
                    {appointment.remarks}
                  </li>
                )}
              </ul>
            </div>
          )}

          <Separator className="bg-stone-200" />

          {!isPast && !editing && (
            <>
              {showCancelConfirm ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-medium text-red-800 mb-3">
                    Weet u zeker dat u deze afspraak wilt annuleren?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className={actionVariants({ variant: "primary" })}
                    >
                      {cancelling ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        <Trash2Icon />
                      )}
                      Ja, annuleren
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={cancelling}
                      className={actionVariants({ variant: "secondary" })}
                    >
                      Nee, behouden
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row flex-start md:items-center gap-4">
                  <button
                    onClick={() => setEditing(true)}
                    className={actionVariants({ variant: "secondary" })}
                  >
                    <PencilIcon />
                    Gegevens wijzigen
                  </button>

                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className={actionVariants({ variant: "secondary" })}
                  >
                    <CircleSlashIcon />
                    Afspraak annuleren
                  </button>
                </div>
              )}
            </>
          )}

          {isPast && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              Deze afspraak heeft al plaatsgevonden en kan niet meer worden
              gewijzigd.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
