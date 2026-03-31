import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://*.vercel.app`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://api.elevenlabs.io https://generativelanguage.googleapis.com https://*.vercel.app",
  "media-src 'self' https://api.elevenlabs.io",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "*": [
      "./docs/**",
      "./ml/models/**",
      "./ml/training-data/**",
      "./ml/scripts/**",
      "./steinberg/**",
      "./.firecrawl/**",
      "./legal/**",
    ],
  },
  // RAG now uses Supabase pgvector (189K chunks), not local files.
  // Removed outputFileTracingIncludes to keep function bundles under 250MB.
  // Knowledge base files are accessed via RAG v3 at runtime, not bundled.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
          { key: 'Content-Security-Policy', value: cspDirectives },
        ],
      },
    ];
  },
};

export default nextConfig;
