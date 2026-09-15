import { RequestSecurityError } from "./request-security-error";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isStateChangingMethod(method: string) {
  return !SAFE_METHODS.has(method.toUpperCase());
}

export function assertTrustedMutationOrigin(
  request: Request,
  allowedOrigins: ReadonlySet<string>,
) {
  if (!isStateChangingMethod(request.method)) return;

  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site" || fetchSite === "same-site") {
    throw new RequestSecurityError(
      403,
      "CROSS_SITE_REQUEST_REJECTED",
      "Cross-site state-changing requests are not allowed.",
    );
  }

  const fetchMode = request.headers.get("sec-fetch-mode")?.toLowerCase();
  if (fetchMode === "no-cors") {
    throw new RequestSecurityError(
      403,
      "UNTRUSTED_FETCH_MODE",
      "The request fetch mode is not allowed.",
    );
  }

  const originHeader = request.headers.get("origin");
  if (!originHeader) {
    throw new RequestSecurityError(
      403,
      "ORIGIN_REQUIRED",
      "An Origin header is required for state-changing requests.",
    );
  }

  let origin: string;
  try {
    origin = new URL(originHeader).origin;
  } catch {
    throw new RequestSecurityError(
      403,
      "INVALID_ORIGIN",
      "The request origin is invalid.",
    );
  }

  if (origin !== originHeader || !allowedOrigins.has(origin)) {
    throw new RequestSecurityError(
      403,
      "UNTRUSTED_ORIGIN",
      "The request origin is not trusted.",
    );
  }
}
