import {
  getCorrelationId,
  writeSecurityAuditEvent,
} from "@/security/server/audit-log";
import { SENSITIVE_RESPONSE_HEADERS } from "@/security/server/cache-policy";
import {
  cspReportSchema,
  normalizeCspReports,
} from "@/security/server/csp-report";
import {
  applicationRateLimiter,
  getRateLimitSubject,
} from "@/security/server/rate-limit";
import { parseJsonRequest } from "@/security/server/request-body";
import {
  RequestSecurityError,
  requestSecurityErrorResponse,
} from "@/security/server/request-security-error";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const correlationId = getCorrelationId(request);

  try {
    const rateLimit = applicationRateLimiter.consume(
      `csp-report:${getRateLimitSubject(
        request,
        process.env.TRUST_PROXY_HEADERS === "true",
      )}`,
      { limit: 60, windowMs: 60_000 },
    );

    if (!rateLimit.allowed) {
      throw new RequestSecurityError(
        429,
        "RATE_LIMIT_EXCEEDED",
        "Too many security reports were submitted.",
        {
          "Retry-After": String(
            Math.max(1, Math.ceil((rateLimit.resetAtMs - Date.now()) / 1000)),
          ),
        },
      );
    }

    const report = await parseJsonRequest(request, cspReportSchema, {
      maximumBytes: 16 * 1024,
      acceptedContentTypes: [
        "application/csp-report",
        "application/reports+json",
        "application/json",
      ],
    });

    for (const normalized of normalizeCspReports(report)) {
      const details = Object.fromEntries(
        Object.entries(normalized).filter((entry) => entry[1] !== undefined),
      ) as Record<string, string | number>;
      writeSecurityAuditEvent({
        eventType: "csp_violation",
        outcome: "accepted",
        correlationId,
        details,
      });
    }
  } catch (error) {
    writeSecurityAuditEvent({
      eventType: "csp_report_rejected",
      outcome: "rejected",
      correlationId,
      reason:
        error instanceof RequestSecurityError ? error.code : "INVALID_REPORT",
    });
    return requestSecurityErrorResponse(error);
  }

  return new Response(null, {
    status: 204,
    headers: SENSITIVE_RESPONSE_HEADERS,
  });
}
