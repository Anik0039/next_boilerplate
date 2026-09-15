import { randomUUID } from "node:crypto";

const SAFE_CORRELATION_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export type SecurityAuditEvent = Readonly<{
  eventType: string;
  outcome: "accepted" | "rejected" | "failed";
  correlationId: string;
  reason?: string;
  details?: Readonly<Record<string, string | number | boolean | null>>;
}>;

export function getCorrelationId(request: Request) {
  const supplied = request.headers.get("x-correlation-id")?.trim();
  return supplied && SAFE_CORRELATION_ID.test(supplied)
    ? supplied
    : randomUUID();
}

export function redactUrl(value: string | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.slice(0, 1024);
  } catch {
    return "invalid-or-relative-url";
  }
}

export function writeSecurityAuditEvent(event: SecurityAuditEvent) {
  console.info(
    JSON.stringify({
      category: "security",
      timestamp: new Date().toISOString(),
      ...event,
    }),
  );
}
