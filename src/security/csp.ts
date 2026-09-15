export function buildContentSecurityPolicy(
  nonce: string,
  development: boolean,
) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "report-uri /api/security/csp-report",
    "report-to csp-endpoint",
    ...(development ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

export function getCspResponseHeaderName(
  production: boolean,
  configuredMode: string | undefined,
) {
  return production || configuredMode === "enforce"
    ? "Content-Security-Policy"
    : "Content-Security-Policy-Report-Only";
}
