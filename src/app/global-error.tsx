"use client";

import { useEffect } from "react";

/**
 * Global error boundary — renders when the root layout itself fails.
 * Must NOT import any client components from the app (they may be broken).
 * Must include its own <html> and <body> tags.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Global error:", error);
    // Report to error tracking API
    fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        severity: "error",
        metadata: { digest: error.digest, boundary: "global-error" },
      }),
    }).catch(() => {
      // Silent fail — don't let reporting cause more errors
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1D3443",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: "#fff",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420, padding: "0 24px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 24px",
              borderRadius: "50%",
              backgroundColor: "rgba(61,169,209,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3DA9D1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#9ca3af",
              marginBottom: 32,
              lineHeight: 1.5,
            }}
          >
            An unexpected error occurred. Please try again or contact support if
            the problem persists.
          </p>

          {error.digest && (
            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginBottom: 24,
                fontFamily: "monospace",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            style={{
              padding: "10px 28px",
              borderRadius: 8,
              backgroundColor: "#3DA9D1",
              color: "#fff",
              fontSize: 15,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
