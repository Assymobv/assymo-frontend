import { describe, it, expect } from "vitest";
import { buildBookingSource } from "./source";

describe("buildBookingSource", () => {
  it("captures referrer, landing URL and user-agent", () => {
    const result = buildBookingSource(
      {
        referrer: "https://www.google.com/",
        landing_url: "https://www.assymo.be/afspraak?utm_source=gmb",
      },
      "Mozilla/5.0 (iPhone)"
    );
    expect(result).toEqual({
      referrer: "https://www.google.com/",
      landing_url: "https://www.assymo.be/afspraak?utm_source=gmb",
      user_agent: "Mozilla/5.0 (iPhone)",
    });
  });

  it("defaults missing or non-string fields to empty strings", () => {
    expect(buildBookingSource(null, null)).toEqual({
      referrer: "",
      landing_url: "",
      user_agent: "",
    });
    expect(
      buildBookingSource({ referrer: 123, landing_url: undefined }, undefined as unknown as null)
    ).toEqual({ referrer: "", landing_url: "", user_agent: "" });
  });

  it("ignores non-object source payloads", () => {
    expect(buildBookingSource("not-an-object", "UA")).toEqual({
      referrer: "",
      landing_url: "",
      user_agent: "UA",
    });
  });

  it("caps oversized values to prevent row bloat", () => {
    const huge = "x".repeat(5000);
    const result = buildBookingSource(
      { referrer: huge, landing_url: huge },
      huge
    );
    expect(result.referrer).toHaveLength(512);
    expect(result.landing_url).toHaveLength(1024);
    expect(result.user_agent).toHaveLength(512);
  });
});
