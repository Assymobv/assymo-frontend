import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyTurnstile } from "./turnstile";

describe("verifyTurnstile", () => {
  const originalEnv = process.env.TURNSTILE_SECRET_KEY;

  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret-key";
  });

  afterEach(() => {
    process.env.TURNSTILE_SECRET_KEY = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns success when Cloudflare returns success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    const result = await verifyTurnstile("valid-token");
    expect(result).toEqual({ success: true });

    expect(fetch).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("returns failure with error codes when Cloudflare returns failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            "error-codes": ["invalid-input-response"],
          }),
      })
    );

    const result = await verifyTurnstile("bad-token");
    expect(result).toEqual({
      success: false,
      errorCodes: ["invalid-input-response"],
    });
  });

  it("returns failure when fetch throws (network error)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    );

    const result = await verifyTurnstile("any-token");
    expect(result).toEqual({ success: false, errorCodes: ["network-error"] });
  });

  it("passes remoteIp when provided", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    await verifyTurnstile("token", "1.2.3.4");

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = fetchCall[1]?.body as FormData;
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });

  it("skips verification when TURNSTILE_SECRET_KEY is not set", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await verifyTurnstile("any-token");
    expect(result).toEqual({ success: true });
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("TURNSTILE_SECRET_KEY")
    );
  });
});
