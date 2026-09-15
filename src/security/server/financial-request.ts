import { z } from "zod";

import { RequestSecurityError } from "./request-security-error";

const financialRequestMetadataSchema = z.object({
  idempotencyKey: z.uuid(),
  requestNonce: z.uuid(),
  requestedAt: z.iso.datetime({ offset: true }),
});

export type FinancialRequestMetadata = z.infer<
  typeof financialRequestMetadataSchema
>;

export interface ReplayStore {
  consume(key: string, expiresAtMs: number, nowMs?: number): Promise<boolean>;
}

/** Test/reference implementation only; production requires a shared atomic store. */
export class InMemoryReplayStore implements ReplayStore {
  private readonly nonces = new Map<string, number>();

  async consume(key: string, expiresAtMs: number, nowMs = Date.now()) {
    for (const [storedKey, expiry] of this.nonces) {
      if (expiry <= nowMs) this.nonces.delete(storedKey);
    }
    if (this.nonces.has(key)) return false;
    this.nonces.set(key, expiresAtMs);
    return true;
  }
}

export function parseFinancialRequestMetadata(
  request: Request,
  options: Readonly<{
    nowMs?: number;
    maximumAgeMs?: number;
    maximumClockSkewMs?: number;
  }> = {},
) {
  const result = financialRequestMetadataSchema.safeParse({
    idempotencyKey: request.headers.get("idempotency-key"),
    requestNonce: request.headers.get("x-request-nonce"),
    requestedAt: request.headers.get("x-request-timestamp"),
  });

  if (!result.success) {
    throw new RequestSecurityError(
      400,
      "FINANCIAL_REQUEST_HEADERS_REQUIRED",
      "Valid idempotency and replay-protection headers are required.",
    );
  }

  const nowMs = options.nowMs ?? Date.now();
  const maximumAgeMs = options.maximumAgeMs ?? 2 * 60 * 1000;
  const maximumClockSkewMs = options.maximumClockSkewMs ?? 30_000;
  const requestedAtMs = Date.parse(result.data.requestedAt);

  if (
    requestedAtMs > nowMs + maximumClockSkewMs ||
    nowMs - requestedAtMs > maximumAgeMs
  ) {
    throw new RequestSecurityError(
      409,
      "STALE_OR_FUTURE_REQUEST",
      "The request timestamp is outside the accepted window.",
    );
  }

  return result.data;
}

export async function consumeFinancialRequestNonce(
  metadata: FinancialRequestMetadata,
  options: Readonly<{
    store: ReplayStore;
    trustedActorId: string;
    operation: string;
    nowMs?: number;
    retentionMs?: number;
  }>,
) {
  const nowMs = options.nowMs ?? Date.now();
  const accepted = await options.store.consume(
    `${options.trustedActorId}:${options.operation}:${metadata.requestNonce}`,
    nowMs + (options.retentionMs ?? 5 * 60 * 1000),
    nowMs,
  );

  if (!accepted) {
    throw new RequestSecurityError(
      409,
      "REQUEST_REPLAYED",
      "The request nonce has already been used.",
    );
  }
}
