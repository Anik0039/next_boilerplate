import { NextResponse } from "next/server";

import { createCsrfToken, CSRF_TOKEN_TTL_MS } from "@/security/server/csrf";
import { SENSITIVE_RESPONSE_HEADERS } from "@/security/server/cache-policy";
import {
  applicationRateLimiter,
  getRateLimitSubject,
} from "@/security/server/rate-limit";
import {
  getServerSecurityConfig,
  SecurityConfigurationError,
} from "@/security/server/security-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(request: Request) {
  try {
    const security = getServerSecurityConfig(request.url);
    const rateLimit = applicationRateLimiter.consume(
      `csrf:${getRateLimitSubject(request, security.trustProxyHeaders)}`,
      { limit: 30, windowMs: 60_000 },
    );

    if (!rateLimit.allowed) {
      return Response.json(
        {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many CSRF token requests.",
          },
        },
        {
          status: 429,
          headers: {
            ...SENSITIVE_RESPONSE_HEADERS,
            "Retry-After": String(
              Math.max(1, Math.ceil((rateLimit.resetAtMs - Date.now()) / 1000)),
            ),
          },
        },
      );
    }

    const nowMs = Date.now();
    const token = createCsrfToken({ secret: security.csrfSecret, nowMs });
    const response = NextResponse.json(
      { token, expiresAt: new Date(nowMs + CSRF_TOKEN_TTL_MS).toISOString() },
      { headers: SENSITIVE_RESPONSE_HEADERS },
    );
    response.cookies.set(security.csrfCookieName, token, {
      httpOnly: true,
      maxAge: Math.floor(CSRF_TOKEN_TTL_MS / 1000),
      path: "/",
      sameSite: "strict",
      secure: security.production,
    });
    return response;
  } catch (error) {
    if (error instanceof SecurityConfigurationError) {
      return Response.json(
        {
          error: {
            code: "SECURITY_CONFIGURATION_INVALID",
            message: "The security service is unavailable.",
          },
        },
        { status: 503, headers: SENSITIVE_RESPONSE_HEADERS },
      );
    }
    throw error;
  }
}
