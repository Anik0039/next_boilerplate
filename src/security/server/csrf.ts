import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { RequestSecurityError } from "./request-security-error";

export const CSRF_HEADER_NAME = "x-csrf-token";
export const CSRF_TOKEN_TTL_MS = 20 * 60 * 1000;

type CsrfTokenOptions = Readonly<{
  secret: string;
  nowMs?: number;
  nonce?: string;
}>;

function assertStrongSecret(secret: string) {
  if (Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("CSRF_SECRET must contain at least 32 bytes.");
  }
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createCsrfToken({
  secret,
  nowMs = Date.now(),
  nonce = randomBytes(32).toString("base64url"),
}: CsrfTokenOptions) {
  assertStrongSecret(secret);
  const payload = `v1.${Math.floor(nowMs / 1000)}.${nonce}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyCsrfToken(
  token: string,
  options: Readonly<{
    secret: string;
    nowMs?: number;
    maximumAgeMs?: number;
    maximumClockSkewMs?: number;
  }>,
) {
  const {
    secret,
    nowMs = Date.now(),
    maximumAgeMs = CSRF_TOKEN_TTL_MS,
    maximumClockSkewMs = 30_000,
  } = options;
  assertStrongSecret(secret);

  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;

  const issuedAtSeconds = Number(parts[1]);
  if (!Number.isSafeInteger(issuedAtSeconds)) return false;
  const issuedAtMs = issuedAtSeconds * 1000;
  if (
    issuedAtMs > nowMs + maximumClockSkewMs ||
    nowMs - issuedAtMs > maximumAgeMs
  ) {
    return false;
  }

  const payload = parts.slice(0, 3).join(".");
  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(parts[3]);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function readCookie(request: Request, cookieName: string) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(";")) {
    const separator = cookie.indexOf("=");
    if (separator < 0) continue;
    if (cookie.slice(0, separator).trim() === cookieName) {
      return cookie.slice(separator + 1).trim();
    }
  }
  return null;
}

export function assertValidCsrfRequest(
  request: Request,
  options: Readonly<{
    secret: string;
    cookieName: string;
    nowMs?: number;
  }>,
) {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = readCookie(request, options.cookieName);

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    throw new RequestSecurityError(
      403,
      "CSRF_TOKEN_MISMATCH",
      "The CSRF token is missing or does not match.",
    );
  }

  if (
    !verifyCsrfToken(headerToken, {
      secret: options.secret,
      nowMs: options.nowMs,
    })
  ) {
    throw new RequestSecurityError(
      403,
      "CSRF_TOKEN_INVALID",
      "The CSRF token is invalid or expired.",
    );
  }
}
