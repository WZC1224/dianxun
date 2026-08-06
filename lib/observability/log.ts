/**
 * Structured process logs for ops questions (degrade? which upstream? how slow?).
 * No secrets/PII. Full APM/Sentry deferred until production deploy (ADR-0003).
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const DENY =
  /^(password|passwd|secret|token|authorization|cookie|set-cookie|api[_-]?key)$/i;

function sanitize(
  fields: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (DENY.test(key)) continue;
    if (value === undefined) continue;
    out[key] = value;
  }
  return out;
}

export function errFields(err: unknown): Record<string, string> {
  if (err instanceof Error) {
    return { errName: err.name, errMessage: err.message.slice(0, 500) };
  }
  return { errMessage: String(err).slice(0, 500) };
}

export function log(
  level: LogLevel,
  event: string,
  fields: Record<string, unknown> = {},
): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...sanitize(fields),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
