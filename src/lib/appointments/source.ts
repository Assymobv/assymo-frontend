/**
 * Booking source capture.
 *
 * Records where a booking came from (client first-touch referrer + landing URL,
 * plus the server-observed user-agent) so misdirected traffic can be traced and
 * the effect of page-clarity changes measured. Values are size-capped so a
 * hostile client cannot bloat the stored row.
 */

export interface BookingSource {
  referrer: string;
  landing_url: string;
  user_agent: string;
}

const REFERRER_MAX = 512;
const LANDING_URL_MAX = 1024;
const USER_AGENT_MAX = 512;

function cap(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

/**
 * Build a sanitized BookingSource from the (untrusted) client-provided source
 * object and the server-observed user-agent header.
 */
export function buildBookingSource(
  rawSource: unknown,
  userAgent: string | null
): BookingSource {
  const source =
    rawSource && typeof rawSource === "object"
      ? (rawSource as Record<string, unknown>)
      : {};

  return {
    referrer: cap(source.referrer, REFERRER_MAX),
    landing_url: cap(source.landing_url, LANDING_URL_MAX),
    user_agent: cap(userAgent, USER_AGENT_MAX),
  };
}
