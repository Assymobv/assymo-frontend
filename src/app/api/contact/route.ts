import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { RESEND_CONFIG } from "@/config/resend";
import { validateFormData, type Subject } from "@/config/contactForm";
import { ContactFormEmail, ContactFormOfferteEmail } from "@/emails";
import { verifyTurnstile } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    const form = await req.formData();

    // Verify Turnstile token
    const turnstileToken = form.get("turnstile_token") as string;
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor?.split(",")[0]?.trim();
    const turnstileResult = await verifyTurnstile(turnstileToken, clientIp);
    if (!turnstileResult.success) {
      console.error("Turnstile verification failed:", turnstileResult.errorCodes);
      return NextResponse.json(
        { error: "Verificatie mislukt. Probeer het opnieuw." },
        { status: 400 }
      );
    }

    const subject = (form.get("subject") as Subject) || "Algemeen";

    // Validate using config
    const validationError = validateFormData(form, subject);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Extract common fields
    const name = (form.get("name") as string) || "";
    const email = (form.get("email") as string) || "";
    const phone = (form.get("phone") as string) || "";
    const street = (form.get("street") as string) || "";
    const postalCode = (form.get("postalCode") as string) || "";
    const city = (form.get("city") as string) || "";
    const newsletterOptIn = form.get("newsletterOptIn") === "true";

    // Send email based on subject
    if (subject === "Offerte aanvragen") {
      const product = (form.get("product") as string) || "";
      const budget = (form.get("budget") as string) || "";
      const extraInfo = (form.get("extraInfo") as string) || "";
      const bestand = form.get("bestand") as File | null;

      // Prepare attachments if file is provided
      const attachments: { filename: string; content: Buffer }[] = [];
      if (bestand && bestand.size > 0) {
        const buffer = Buffer.from(await bestand.arrayBuffer());
        attachments.push({
          filename: bestand.name,
          content: buffer,
        });
      }

      const { error: emailError } = await resend.emails.send({
        from: RESEND_CONFIG.fromAddressContact,
        to: [RESEND_CONFIG.contactRecipient],
        replyTo: email,
        subject: RESEND_CONFIG.subjects.contactOfferte,
        react: ContactFormOfferteEmail({
          name,
          email,
          phone,
          street,
          postalCode,
          city,
          product,
          budget: budget || undefined,
          extraInfo: extraInfo || undefined,
          newsletterOptIn,
          hasBestand: attachments.length > 0,
          bestandNaam: bestand?.name,
        }),
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (emailError) {
        console.error("Failed to send Offerte email:", emailError);
        return NextResponse.json(
          { error: "Kon e-mail niet verzenden. Probeer later opnieuw." },
          { status: 500 }
        );
      }
    } else {
      const message = (form.get("message") as string) || "";

      const { error: emailError } = await resend.emails.send({
        from: RESEND_CONFIG.fromAddressContact,
        to: [RESEND_CONFIG.contactRecipient],
        replyTo: email,
        subject: RESEND_CONFIG.subjects.contactAlgemeen,
        react: ContactFormEmail({
          name,
          email,
          phone,
          street,
          postalCode,
          city,
          message,
        }),
      });

      if (emailError) {
        console.error("Failed to send Algemeen email:", emailError);
        return NextResponse.json(
          { error: "Kon e-mail niet verzenden. Probeer later opnieuw." },
          { status: 500 }
        );
      }
    }

    // Add to newsletter if opted in (for all subjects)
    if (newsletterOptIn && RESEND_CONFIG.audienceId) {
      try {
        await resend.contacts.create({
          email,
          firstName: name.split(" ")[0],
          lastName: name.split(" ").slice(1).join(" ") || undefined,
          unsubscribed: false,
          audienceId: RESEND_CONFIG.audienceId,
        });
      } catch (err) {
        // Don't fail the request if newsletter signup fails
        console.error("Failed to add contact to newsletter:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Er is iets misgegaan. Probeer later opnieuw." },
      { status: 500 }
    );
  }
}
