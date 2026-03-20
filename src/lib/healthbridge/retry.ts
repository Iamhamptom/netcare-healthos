// Retry logic with exponential backoff for Healthbridge switch submissions
// Retries on network errors and 5xx responses, NOT on 4xx client errors

export interface RetryConfig {
  maxAttempts: number;  // default: 3
  baseDelayMs: number;  // default: 1000
  maxDelayMs: number;   // default: 10000
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

/** Default retryable check: retry on TypeError (network) and 5xx status codes */
function defaultIsRetryable(error: unknown): boolean {
  // Network errors (fetch failures, DNS, connection refused)
  if (error instanceof TypeError) return true;

  // HTTP 5xx responses wrapped in an error with a status property
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    return status >= 500 && status < 600;
  }

  // Check error message for common network error patterns
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("econnrefused") ||
      msg.includes("econnreset") ||
      msg.includes("etimedout") ||
      msg.includes("socket hang up") ||
      msg.includes("network") ||
      msg.includes("fetch failed")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Execute an async function with exponential backoff retry.
 *
 * @param fn - The async function to execute
 * @param config - Partial retry configuration (merged with defaults)
 * @param isRetryable - Custom function to determine if an error is retryable
 * @returns The result of fn()
 * @throws The last error if all attempts are exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>,
  isRetryable?: (error: unknown) => boolean,
): Promise<T> {
  const cfg: RetryConfig = { ...DEFAULT_CONFIG, ...config };
  const shouldRetry = isRetryable || defaultIsRetryable;
  let lastError: unknown;

  for (let attempt = 0; attempt < cfg.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isLastAttempt = attempt === cfg.maxAttempts - 1;
      if (isLastAttempt || !shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(
        cfg.baseDelayMs * Math.pow(2, attempt),
        cfg.maxDelayMs,
      );

      console.log(
        `[healthbridge:retry] Attempt ${attempt + 1}/${cfg.maxAttempts} failed: ${error instanceof Error ? error.message : String(error)}. Retrying in ${delay}ms...`,
      );

      await sleep(delay);
    }
  }

  // Should not reach here, but TypeScript needs it
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
