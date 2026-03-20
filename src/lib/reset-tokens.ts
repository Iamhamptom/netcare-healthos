// Shared in-memory reset token store
// In production, this should be stored in the database
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

// Clean up expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of resetTokens) {
    if (data.expiresAt < now) resetTokens.delete(token);
  }
}, 600_000);

export { resetTokens };
