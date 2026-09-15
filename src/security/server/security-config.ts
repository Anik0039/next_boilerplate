import "server-only";

const DEVELOPMENT_CSRF_SECRET =
  "development-only-csrf-secret-change-before-production";

export class SecurityConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SecurityConfigurationError";
  }
}

function configuredOrigins() {
  return (process.env.APP_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getServerSecurityConfig(requestUrl: string) {
  const production = process.env.NODE_ENV === "production";
  const csrfSecret =
    process.env.CSRF_SECRET?.trim() ||
    (production ? "" : DEVELOPMENT_CSRF_SECRET);

  if (Buffer.byteLength(csrfSecret, "utf8") < 32) {
    throw new SecurityConfigurationError(
      "CSRF_SECRET must contain at least 32 bytes in production.",
    );
  }

  const origins = configuredOrigins();
  if (origins.length === 0) {
    if (production) {
      throw new SecurityConfigurationError(
        "APP_ORIGINS must explicitly list trusted HTTPS origins in production.",
      );
    }
    origins.push(new URL(requestUrl).origin);
  }

  for (const origin of origins) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new SecurityConfigurationError(
        "APP_ORIGINS must contain only exact origins; production origins must use HTTPS.",
      );
    }
    if (
      parsed.origin !== origin ||
      (production && parsed.protocol !== "https:")
    ) {
      throw new SecurityConfigurationError(
        "APP_ORIGINS must contain only exact origins; production origins must use HTTPS.",
      );
    }
  }

  return {
    allowedOrigins: new Set(origins),
    csrfCookieName: production ? "__Host-cib-csrf" : "cib-csrf",
    csrfSecret,
    production,
    trustProxyHeaders: process.env.TRUST_PROXY_HEADERS === "true",
  } as const;
}
