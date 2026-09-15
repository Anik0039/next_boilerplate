"use client";

type CachedCsrfToken = { token: string; expiresAtMs: number };

let cachedToken: CachedCsrfToken | undefined;

export async function getCsrfToken() {
  if (cachedToken && cachedToken.expiresAtMs - Date.now() > 30_000) {
    return cachedToken.token;
  }

  const response = await fetch("/api/security/csrf", {
    cache: "no-store",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Unable to establish request integrity.");

  const candidate: unknown = await response.json();
  if (
    !candidate ||
    typeof candidate !== "object" ||
    !("token" in candidate) ||
    !("expiresAt" in candidate) ||
    typeof candidate.token !== "string" ||
    typeof candidate.expiresAt !== "string"
  ) {
    throw new Error("The request-integrity response was invalid.");
  }

  const expiresAtMs = Date.parse(candidate.expiresAt);
  if (!Number.isFinite(expiresAtMs)) {
    throw new Error("The request-integrity response expiry was invalid.");
  }

  cachedToken = { token: candidate.token, expiresAtMs };
  return candidate.token;
}

export function clearCsrfToken() {
  cachedToken = undefined;
}
