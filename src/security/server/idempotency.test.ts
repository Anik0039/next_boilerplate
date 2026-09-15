import { describe, expect, it, vi } from "vitest";

import {
  createRequestFingerprint,
  executeIdempotently,
  InMemoryIdempotencyStore,
} from "./idempotency";

describe("transaction idempotency", () => {
  it("replays the stored result without executing the operation twice", async () => {
    const store = new InMemoryIdempotencyStore();
    const operation = vi.fn(async () => ({
      status: 201,
      body: '{"paymentId":"synthetic"}',
      headers: { "content-type": "application/json" },
    }));
    const options = {
      store,
      scope: "ums-actor-1:create-payment",
      idempotencyKey: "d11034bd-a22c-46c1-bc85-ae88bd129fc1",
      fingerprint: createRequestFingerprint(
        "POST",
        "/payments",
        '{"amountMinor":"100"}',
      ),
      nowMs: 1_000,
      operation,
    };

    await expect(executeIdempotently(options)).resolves.toMatchObject({
      replayed: false,
    });
    await expect(executeIdempotently(options)).resolves.toMatchObject({
      replayed: true,
    });
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it("rejects an idempotency key reused with another payload", async () => {
    const store = new InMemoryIdempotencyStore();
    const shared = {
      store,
      scope: "ums-actor-1:create-payment",
      idempotencyKey: "d11034bd-a22c-46c1-bc85-ae88bd129fc1",
      nowMs: 1_000,
      operation: async () => ({ status: 204, body: "", headers: {} }),
    };
    await executeIdempotently({ ...shared, fingerprint: "first" });
    await expect(
      executeIdempotently({ ...shared, fingerprint: "different" }),
    ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_REUSED" });
  });
});
