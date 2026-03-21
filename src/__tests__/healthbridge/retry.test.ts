import { describe, it, expect, vi } from "vitest";
import { withRetry } from "@/lib/healthbridge/retry";

describe("Retry Logic — withRetry", () => {
  it("should succeed on first attempt", async () => {
    const fn = vi.fn().mockResolvedValue("success");
    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 });
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry and succeed on second attempt after TypeError (network error)", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce("recovered");

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 });
    expect(result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should retry on 5xx errors", async () => {
    const error5xx = Object.assign(new Error("Server error"), { status: 503 });
    const fn = vi.fn()
      .mockRejectedValueOnce(error5xx)
      .mockResolvedValueOnce("ok");

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should NOT retry on 4xx errors (client error)", async () => {
    const error4xx = Object.assign(new Error("Not found"), { status: 404 });
    const fn = vi.fn().mockRejectedValue(error4xx);

    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 })
    ).rejects.toThrow("Not found");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should NOT retry on 400 Bad Request", async () => {
    const error400 = Object.assign(new Error("Bad request"), { status: 400 });
    const fn = vi.fn().mockRejectedValue(error400);

    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 })
    ).rejects.toThrow("Bad request");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should throw after all attempts exhausted", async () => {
    const fn = vi.fn().mockRejectedValue(new TypeError("fetch failed"));

    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 })
    ).rejects.toThrow("fetch failed");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("should retry on ECONNREFUSED errors", async () => {
    const connError = new Error("connect ECONNREFUSED 127.0.0.1:443");
    const fn = vi.fn()
      .mockRejectedValueOnce(connError)
      .mockResolvedValueOnce("reconnected");

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 });
    expect(result).toBe("reconnected");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should retry on ETIMEDOUT errors", async () => {
    const timeoutError = new Error("connect ETIMEDOUT");
    const fn = vi.fn()
      .mockRejectedValueOnce(timeoutError)
      .mockResolvedValueOnce("ok");

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 });
    expect(result).toBe("ok");
  });

  it("should retry on socket hang up", async () => {
    const socketError = new Error("socket hang up");
    const fn = vi.fn()
      .mockRejectedValueOnce(socketError)
      .mockResolvedValueOnce("ok");

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 });
    expect(result).toBe("ok");
  });

  it("should NOT retry on generic non-network errors", async () => {
    const genericError = new Error("Some business logic error");
    const fn = vi.fn().mockRejectedValue(genericError);

    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 })
    ).rejects.toThrow("Some business logic error");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should use custom isRetryable function", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("custom retryable"))
      .mockResolvedValueOnce("ok");

    const result = await withRetry(
      fn,
      { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 },
      (error) => error instanceof Error && error.message.includes("custom retryable"),
    );
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should use default config when no config provided", async () => {
    // Just verify it doesn't crash with no config
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn);
    expect(result).toBe("ok");
  });

  it("should handle maxAttempts of 1 (no retries)", async () => {
    const fn = vi.fn().mockRejectedValue(new TypeError("network error"));

    await expect(
      withRetry(fn, { maxAttempts: 1, baseDelayMs: 1, maxDelayMs: 10 })
    ).rejects.toThrow("network error");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should succeed on the last allowed attempt", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new TypeError("fail 1"))
      .mockRejectedValueOnce(new TypeError("fail 2"))
      .mockResolvedValueOnce("success on 3rd");

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 10 });
    expect(result).toBe("success on 3rd");
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
