import { expect, test } from "@playwright/test";

test("enforces browser security headers", async ({ page }) => {
  const response = await page.goto("/");

  expect(response).not.toBeNull();
  const headers = response!.headers();
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["content-security-policy-report-only"]).toBeUndefined();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["cross-origin-resource-policy"]).toBe("same-origin");
  expect(headers["reporting-endpoints"]).toContain("csp-endpoint=");
});

test("rejects malformed security reports", async ({ request }) => {
  const response = await request.post("/api/security/csp-report", {
    data: "not-a-csp-report",
    headers: { "content-type": "text/plain" },
  });

  expect(response.status()).toBe(415);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: "UNSUPPORTED_MEDIA_TYPE" },
  });
});

test("fails closed for unprotected financial BFF mutations", async ({
  request,
}) => {
  const response = await request.post("/api/bff/not-implemented", {
    data: { amountMinor: "100" },
  });

  expect(response.status()).toBe(403);
  await expect(response.json()).resolves.toMatchObject({
    error: { code: "ORIGIN_REQUIRED" },
  });
});
