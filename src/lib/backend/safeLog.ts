/**
 * Error logger that strips known secret values before writing to stdout/stderr.
 * Never logs env-var values — only the names of which secrets were redacted.
 */

const SECRET_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET",
  "INGEST_SECRET",
  "SUPABASE_URL",
] as const;

function buildRedactList(): string[] {
  return SECRET_KEYS.flatMap((key) => {
    const val = process.env[key];
    return val && val.length >= 8 ? [val] : [];
  });
}

function redact(input: string): string {
  const secrets = buildRedactList();
  let out = input;
  for (const secret of secrets) {
    out = out.split(secret).join("[REDACTED]");
  }
  return out;
}

function stringify(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function safeError(label: string, err: unknown): void {
  console.error(`[${label}]`, redact(stringify(err)));
}

export function safeWarn(label: string, msg: string): void {
  console.warn(`[${label}]`, redact(msg));
}

export function safeLog(label: string, msg: string): void {
  console.log(`[${label}]`, redact(msg));
}
