"use client";

import { FormEvent, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  FieldError,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { CheckIcon, MailCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTracking } from "@/lib/tracking";
import { TurnstileWidget, type TurnstileInstance } from "@/components/forms/TurnstileWidget";
import {
  getVisibleFieldsForProduct,
  getInitialFormData,
  isValidEmail,
  type FieldConfig,
  type Subject,
  type FormDataState,
  type FieldOption,
} from "@/config/contactForm";

type FormStatus = "idle" | "submitting" | "success" | "error";

export interface ProductOption {
  id: string;
  name: string;
}

interface ContactFormProps {
  className?: string;
  /** Product options for the "Offerte aanvragen" subject (from solutions) */
  products?: ProductOption[];
  /** Pre-select "Offerte aanvragen" subject with this product (e.g., on solution pages) */
  defaultProduct?: string;
}

export default function ContactForm({ className, products = [], defaultProduct }: ContactFormProps) {
  const [formData, setFormData] = useState<FormDataState>(() => {
    const initial = getInitialFormData();
    // If a default product is provided, pre-select "Offerte aanvragen" and the product
    if (defaultProduct) {
      initial.subject = "Offerte aanvragen";
      initial.product = defaultProduct;
    }
    return initial;
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { track } = useTracking();
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";
  const currentSubject = formData.subject as Subject;
  const currentProduct = formData.product as string | null;

  // Get visible fields based on subject and product
  const visibleFields = getVisibleFieldsForProduct(currentSubject, currentProduct);

  const isFormValid = visibleFields
    .filter((field) => field.required)
    .every((field) => {
      const value = formData[field.name];
      if (field.name === "email") return isValidEmail(String(value || ""));
      if (typeof value === "string") return value.trim() !== "";
      return Boolean(value);
    });

  function updateField(name: string, value: string | boolean | File | null) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting || isSuccess || !isFormValid) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const data = new FormData();

      visibleFields.forEach((field) => {
        const value = formData[field.name];
        if (field.type === "file" && value instanceof File) {
          data.set(field.name, value);
        } else if (field.type === "checkbox") {
          data.set(field.name, String(value));
        } else if (typeof value === "string") {
          data.set(field.name, value);
        }
      });

      if (turnstileToken) {
        data.set("turnstile_token", turnstileToken);
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(
          json.error || "Er is iets misgegaan. Probeer later opnieuw.",
        );
      }

      track("contact_form_submitted", {
        subject: formData.subject,
        has_attachment: formData.bestand instanceof File,
        source: defaultProduct ? "product_page" : "general",
        product: defaultProduct || undefined,
      });
      setStatus("success");
    } catch (err) {
      track("contact_form_error", {
        error_type: err instanceof Error ? err.message : "unknown",
      });
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Er is iets misgegaan. Probeer later opnieuw.",
      );
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  }

  function getFieldOptions(field: FieldConfig): FieldOption[] {
    // For dynamic options (product field), use the products prop
    if (field.dynamicOptions && field.name === "product") {
      return products.map((p) => ({ value: p.name, label: p.name }));
    }
    return field.options || [];
  }

  function renderField(field: FieldConfig) {
    const isDisabled = isSubmitting || isSuccess;
    const value = formData[field.name];

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        return (
          <Field key={field.name}>
            <FieldLabel htmlFor={field.name}>
              {field.label}{field.required && " *"}
            </FieldLabel>
            <Input
              id={field.name}
              type={field.type}
              required={field.required}
              value={String(value || "")}
              onChange={(e) => updateField(field.name, e.target.value)}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              disabled={isDisabled}
            />
          </Field>
        );

      case "textarea":
        return (
          <Field key={field.name}>
            <FieldLabel htmlFor={field.name}>
              {field.label}{field.required && " *"}
            </FieldLabel>
            <Textarea
              id={field.name}
              required={field.required}
              value={String(value || "")}
              onChange={(e) => updateField(field.name, e.target.value)}
              className="min-h-40"
              placeholder={field.placeholder}
              disabled={isDisabled}
            />
          </Field>
        );

      case "select": {
        const options = getFieldOptions(field);
        // Don't render if dynamic options but no options available
        if (field.dynamicOptions && options.length === 0) {
          return null;
        }
        return (
          <Field key={field.name}>
            <FieldLabel htmlFor={field.name}>
              {field.label}{field.required && " *"}
            </FieldLabel>
            <Select
              value={String(value || "")}
              onValueChange={(v) => updateField(field.name, v)}
              disabled={isDisabled}
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue placeholder="Selecteer..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        );
      }

      case "file":
        return (
          <Field key={field.name}>
            <FieldLabel htmlFor={field.name}>
              {field.label}{field.required && " *"}
            </FieldLabel>
            <Input
              id={field.name}
              type="file"
              accept={field.accept}
              onChange={(e) =>
                updateField(field.name, e.target.files?.[0] || null)
              }
              disabled={isDisabled}
            />
          </Field>
        );

      case "checkbox":
        return (
          <Field key={field.name} orientation="horizontal">
            <Checkbox
              id={field.name}
              checked={Boolean(value)}
              onCheckedChange={(checked) =>
                updateField(field.name, checked === true)
              }
              disabled={isDisabled}
            />
            <FieldLabel htmlFor={field.name} className="font-normal">
              {field.label}
            </FieldLabel>
          </Field>
        );

      default:
        return null;
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <FieldGroup>
        {visibleFields.map(renderField)}

        <TurnstileWidget
          ref={turnstileRef}
          onSuccess={setTurnstileToken}
          onError={() => setTurnstileToken(null)}
          onExpire={() => setTurnstileToken(null)}
        />

        {status === "error" && <FieldError>{errorMessage}</FieldError>}

        <Button
          type="submit"
          disabled={isSubmitting || (!isSuccess && (!isFormValid || !turnstileToken))}
          className={cn(
            "w-fit px-3.5 py-2 flex items-center gap-1.5 text-accent-light bg-accent-dark transition-colors duration-250 hover:text-accent-dark hover:bg-accent-light rounded-full",
            isSubmitting &&
              "text-stone-600 bg-stone-200 hover:text-stone-600 hover:bg-stone-200",
            isSuccess &&
              "text-stone-600 bg-stone-200 hover:text-stone-600 hover:bg-stone-200",
          )}
        >
          {isSubmitting && (
            <>
              <Spinner className="size-4" />
              <span>Laden...</span>
            </>
          )}
          {isSuccess && (
            <>
              <CheckIcon className="size-4" />
              <span>Gelukt!</span>
            </>
          )}
          {!isSubmitting && !isSuccess && (
            <>
              <MailCheckIcon className="size-4" />
              <span>Versturen</span>
            </>
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
