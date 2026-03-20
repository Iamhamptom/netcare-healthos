const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level: keyof typeof LEVELS): boolean {
  return LEVELS[level] >= (LEVELS[LOG_LEVEL as keyof typeof LEVELS] ?? 0);
}

export const logger = {
  debug: (msg: string, data?: Record<string, unknown>) => {
    if (shouldLog("debug")) console.debug(`[DEBUG] ${msg}`, data ? JSON.stringify(data) : "");
  },
  info: (msg: string, data?: Record<string, unknown>) => {
    if (shouldLog("info")) console.info(`[INFO] ${msg}`, data ? JSON.stringify(data) : "");
  },
  warn: (msg: string, data?: Record<string, unknown>) => {
    if (shouldLog("warn")) console.warn(`[WARN] ${msg}`, data ? JSON.stringify(data) : "");
  },
  error: (msg: string, data?: Record<string, unknown>) => {
    if (shouldLog("error")) console.error(`[ERROR] ${msg}`, data ? JSON.stringify(data) : "");
  },
};
