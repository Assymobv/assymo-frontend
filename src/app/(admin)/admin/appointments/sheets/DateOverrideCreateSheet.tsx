"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { t } from "@/config/strings";
import { DAYS_OF_WEEK } from "@/types/appointments";

type ExceptionType = "one-time" | "weekly" | "yearly";

interface DateOverrideCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function DateOverrideCreateSheet({
  open,
  onOpenChange,
  onCreated,
}: DateOverrideCreateSheetProps) {
  const [saving, setSaving] = useState(false);
  const [exceptionType, setExceptionType] = useState<ExceptionType>("one-time");
  const [formData, setFormData] = useState({
    date: "",
    end_date: "",
    is_closed: true,
    open_time: "10:00",
    close_time: "17:00",
    reason: "",
    recurrence_day_of_week: 0,
    show_on_website: false,
    hasDateRange: false,
  });

  const resetForm = () => {
    setExceptionType("one-time");
    setFormData({
      date: "",
      end_date: "",
      is_closed: true,
      open_time: "10:00",
      close_time: "17:00",
      reason: "",
      recurrence_day_of_week: 0,
      show_on_website: false,
      hasDateRange: false,
    });
  };

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  const handleCreate = async () => {
    // Validation based on exception type
    if (exceptionType === "weekly") {
      // Weekly only needs day of week (always valid since default is 0)
    } else {
      // One-time and yearly need a date
      if (!formData.date) {
        toast.error(t("admin.messages.selectDate"));
        return;
      }

      if (formData.hasDateRange && !formData.end_date) {
        toast.error(t("admin.messages.selectEndDate"));
        return;
      }
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/appointments/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // For weekly recurring, use today's date as placeholder (not used in matching)
          date: exceptionType === "weekly"
            ? new Date().toISOString().split("T")[0]
            : formData.date,
          end_date: (exceptionType === "one-time" || exceptionType === "yearly") && formData.hasDateRange
            ? formData.end_date
            : null,
          is_closed: formData.is_closed,
          open_time: formData.is_closed ? null : formData.open_time,
          close_time: formData.is_closed ? null : formData.close_time,
          reason: formData.reason || undefined,
          is_recurring: exceptionType === "yearly",
          recurrence_day_of_week: exceptionType === "weekly"
            ? formData.recurrence_day_of_week
            : null,
          show_on_website: formData.show_on_website,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create");
      }

      toast.success(t("admin.messages.overrideAdded"));
      onOpenChange(false);
      onCreated();
    } catch (error) {
      console.error("Failed to create override:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("admin.misc.overrideCouldNotAdd"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (type: ExceptionType) => {
    setExceptionType(type);
    // Reset date fields when switching types
    setFormData((prev) => ({
      ...prev,
      date: "",
      end_date: "",
      hasDateRange: false,
    }));
  };

  const isFormValid = exceptionType === "weekly" || !!formData.date;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-hidden w-full md:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t("admin.misc.addOverride")}</SheetTitle>
          <SheetDescription>
            {t("admin.misc.addOverrideDesc")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <FieldGroup>
            {/* Exception Type Selector */}
            <Field>
              <FieldLabel>{t("admin.misc.exceptionType")}</FieldLabel>
              <Tabs
                value={exceptionType}
                onValueChange={(v) => handleTypeChange(v as ExceptionType)}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="one-time" className="flex-1">
                    {t("admin.misc.oneTime")}
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="flex-1">
                    {t("admin.misc.weekly")}
                  </TabsTrigger>
                  <TabsTrigger value="yearly" className="flex-1">
                    {t("admin.misc.yearly")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </Field>

            <FieldSeparator />

            {/* Date Selection - varies by type */}
            <FieldSet>
              {exceptionType === "weekly" ? (
                // Weekly: Day of week picker
                <Field>
                  <FieldLabel>{t("admin.misc.dayOfWeek")}</FieldLabel>
                  <Select
                    value={String(formData.recurrence_day_of_week)}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        recurrence_day_of_week: parseInt(value, 10),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={String(day.value)}>
                          {day.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ) : (
                // One-time or Yearly: Date picker
                <>
                  <Field>
                    <FieldLabel>
                      {formData.hasDateRange
                        ? t("admin.labels.startDate")
                        : t("admin.labels.date")}
                    </FieldLabel>
                    <DatePicker
                      value={formData.date ? new Date(formData.date + "T12:00:00") : undefined}
                      onChange={(date) => {
                        const dateStr = date
                          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                          : "";
                        setFormData({ ...formData, date: dateStr });
                      }}
                      disablePast={exceptionType !== "yearly"}
                    />
                  </Field>

                  {/* Date range option - for one-time and yearly */}
                  <Field orientation="horizontal">
                    <Checkbox
                      id="hasDateRange"
                      checked={formData.hasDateRange}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          hasDateRange: !!checked,
                          end_date: "",
                        })
                      }
                    />
                    <FieldLabel htmlFor="hasDateRange">
                      {t("admin.misc.multipleDays")}
                    </FieldLabel>
                  </Field>

                  {formData.hasDateRange && (
                    <Field>
                      <FieldLabel>{t("admin.labels.endDate")}</FieldLabel>
                      <DatePicker
                        value={formData.end_date ? new Date(formData.end_date + "T12:00:00") : undefined}
                        onChange={(date) => {
                          const dateStr = date
                            ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                            : "";
                          setFormData({ ...formData, end_date: dateStr });
                        }}
                        disablePast={exceptionType !== "yearly"}
                      />
                    </Field>
                  )}
                </>
              )}
            </FieldSet>

            <FieldSeparator />

            {/* Hours Section */}
            <FieldSet>
              <Field orientation="horizontal">
                <Checkbox
                  id="is_closed"
                  checked={formData.is_closed}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_closed: !!checked })
                  }
                />
                <FieldLabel htmlFor="is_closed">
                  {t("admin.misc.fullyClosed")}
                </FieldLabel>
              </Field>

              {!formData.is_closed && (
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>{t("admin.misc.from")}</FieldLabel>
                    <Input
                      type="time"
                      value={formData.open_time}
                      onChange={(e) =>
                        setFormData({ ...formData, open_time: e.target.value })
                      }
                      className="[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </Field>
                  <Field>
                    <FieldLabel>{t("admin.misc.to")}</FieldLabel>
                    <Input
                      type="time"
                      value={formData.close_time}
                      onChange={(e) =>
                        setFormData({ ...formData, close_time: e.target.value })
                      }
                      className="[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                  </Field>
                </div>
              )}
            </FieldSet>

            <FieldSeparator />

            {/* Reason */}
            <Field>
              <FieldLabel>{t("admin.misc.reasonOptional")}</FieldLabel>
              <Input
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder={t("admin.placeholders.holidayVacation")}
              />
            </Field>

            <FieldSeparator />

            {/* Website visibility */}
            <Field orientation="horizontal">
              <FieldLabel htmlFor="show_on_website">
                {t("admin.misc.showOnWebsite")}
              </FieldLabel>
              <Switch
                id="show_on_website"
                checked={formData.show_on_website}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, show_on_website: checked })
                }
              />
            </Field>
          </FieldGroup>
        </div>

        <SheetFooter>
          <Button onClick={handleCreate} disabled={saving || !isFormValid}>
            {saving ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <CheckIcon className="size-4" />
            )}
            {t("admin.buttons.save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
