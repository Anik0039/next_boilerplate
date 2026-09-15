import { describe, expect, it } from "vitest";

import { assertValidCsrfRequest, createCsrfToken } from "./csrf";
import {
  consumeFinancialRequestNonce,
  InMemoryReplayStore,
  parseFinancialRequestMetadata,
} from "./financial-request";
import { assertTrustedMutationOrigin } from "./origin-policy";

const secret = "test-only-csrf-secret-with-at-least-32-bytes";
const nowMs = Date.parse("2026-09-13T10:00:00.000Z");
const cookieName = "cib-csrf";

function mutationRequest(overrides: Record<string, string> = {}) {
  const token = createCsrfToken({
    secret,
    nowMs,
    nonce: "fixed-test-nonce",
  });
  return new Request("https://bank.example/api/bff/payments", {
    method: "POST",
    headers: {
      cookie: `${cookieName}=${token}`,
      "idempotency-key": "2e570ec4-3ec4-4be5-b8ef-066bfca4f3d7",
      origin: "https://bank.example",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-csrf-token": token,
      "x-request-nonce": "6fe0b6bb-d9a0-46d3-94e5-19b39fdfe2e7",
      "x-request-timestamp": new Date(nowMs).toISOString(),
      ...overrides,
    },
  });
}

describe("financial request integrity", () => {
  it("accepts a trusted, fresh, CSRF-protected mutation once", async () => {
    const request = mutationRequest();
    assertTrustedMutationOrigin(request, new Set(["https://bank.example"]));
    assertValidCsrfRequest(request, { secret, cookieName, nowMs });
    const metadata = parseFinancialRequestMetadata(request, { nowMs });
    const replayStore = new InMemoryReplayStore();

    await expect(
      consumeFinancialRequestNonce(metadata, {
        store: replayStore,
        trustedActorId: "ums-actor-1",
        operation: "create-payment",
        nowMs,
      }),
    ).resolves.toBeUndefined();
    await expect(
      consumeFinancialRequestNonce(metadata, {
        store: replayStore,
        trustedActorId: "ums-actor-1",
        operation: "create-payment",
        nowMs,
      }),
    ).rejects.toMatchObject({ code: "REQUEST_REPLAYED" });
  });

  it("rejects cross-site requests before token processing", () => {
    const request = mutationRequest({
      origin: "https://attacker.example",
      "sec-fetch-site": "cross-site",
    });
    expect(() =>
      assertTrustedMutationOrigin(request, new Set(["https://bank.example"])),
    ).toThrowError(
      expect.objectContaining({ code: "CROSS_SITE_REQUEST_REJECTED" }),
    );
  });

  it("rejects stale requests and tampered CSRF tokens", () => {
    const stale = mutationRequest({
      "x-request-timestamp": "2026-09-13T09:00:00.000Z",
    });
    expect(() => parseFinancialRequestMetadata(stale, { nowMs })).toThrowError(
      expect.objectContaining({ code: "STALE_OR_FUTURE_REQUEST" }),
    );

    const tampered = mutationRequest({ "x-csrf-token": "tampered" });
    expect(() =>
      assertValidCsrfRequest(tampered, { secret, cookieName, nowMs }),
    ).toThrowError(expect.objectContaining({ code: "CSRF_TOKEN_MISMATCH" }));
  });
});
