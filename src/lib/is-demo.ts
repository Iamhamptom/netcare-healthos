// Demo mode: use in-memory data instead of SQLite
// Only enabled when explicitly set — never auto-enable on Vercel
export const isDemoMode = process.env.DEMO_MODE === "true";
