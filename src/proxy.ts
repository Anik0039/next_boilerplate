import { NextRequest, NextResponse } from "next/server";

import {
  buildContentSecurityPolicy,
  getCspResponseHeaderName,
} from "@/security/csp";
import { assertValidCsrfRequest } from "@/security/server/csrf";
import { parseFinancialRequestMetadata } from "@/security/server/financial-request";
import { assertTrustedMutationOrigin } from "@/security/server/origin-policy";
import { requestSecurityErrorResponse } from "@/security/server/request-security-error";
import {
  getServerSecurityConfig,
  SecurityConfigurationError,
} from "@/security/server/security-config";

function isFinancialBffMutation(request: NextRequest) {
  return (
    request.nextUrl.pathname.startsWith("/api/bff/") &&
    !["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())
  );
}

export async function proxy(request: NextRequest) {
  if (isFinancialBffMutation(request)) {
    try {
      const security = getServerSecurityConfig(request.url);
      assertTrustedMutationOrigin(request, security.allowedOrigins);
      assertValidCsrfRequest(request, {
        secret: security.csrfSecret,
        cookieName: security.csrfCookieName,
      });
      parseFinancialRequestMetadata(request);
    } catch (error) {
      if (error instanceof SecurityConfigurationError) {
        return Response.json(
          {
            error: {
              code: "SECURITY_CONFIGURATION_INVALID",
              message: "The security service is unavailable.",
            },
          },
          { status: 503, headers: { "Cache-Control": "no-store" } },
        );
      }
      return requestSecurityErrorResponse(error);
    }

    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isDevelopment = process.env.NODE_ENV === "development";
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = buildContentSecurityPolicy(
    nonce,
    isDevelopment,
  );
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  const headerName = getCspResponseHeaderName(
    process.env.NODE_ENV === "production",
    process.env.CSP_MODE,
  );
  response.headers.set(headerName, contentSecurityPolicy);
  response.headers.set(
    "Reporting-Endpoints",
    'csp-endpoint="/api/security/csp-report"',
  );
  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
