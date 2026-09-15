import { createHash } from "node:crypto";

import { RequestSecurityError } from "./request-security-error";

export type StoredHttpResult = Readonly<{
  status: number;
  body: string;
  headers: Readonly<Record<string, string>>;
}>;

type ClaimResult =
  | { status: "claimed" }
  | { status: "in-progress" }
  | { status: "conflict" }
  | { status: "replay"; result: StoredHttpResult };

export interface IdempotencyStore {
  claim(
    key: string,
    fingerprint: string,
    expiresAtMs: number,
    nowMs?: number,
  ): Promise<ClaimResult>;
  complete(
    key: string,
    fingerprint: string,
    result: StoredHttpResult,
  ): Promise<void>;
  abandon(key: string, fingerprint: string): Promise<void>;
}

type IdempotencyRecord = {
  fingerprint: string;
  expiresAtMs: number;
  result?: StoredHttpResult;
};

/** Test/reference implementation only; production requires a shared durable store. */
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly records = new Map<string, IdempotencyRecord>();

  async claim(
    key: string,
    fingerprint: string,
    expiresAtMs: number,
    nowMs = Date.now(),
  ): Promise<ClaimResult> {
    const current = this.records.get(key);
    if (current && current.expiresAtMs <= nowMs) this.records.delete(key);

    const existing = this.records.get(key);
    if (existing) {
      if (existing.fingerprint !== fingerprint) return { status: "conflict" };
      return existing.result
        ? { status: "replay", result: existing.result }
        : { status: "in-progress" };
    }

    this.records.set(key, { fingerprint, expiresAtMs });
    return { status: "claimed" };
  }

  async complete(key: string, fingerprint: string, result: StoredHttpResult) {
    const existing = this.records.get(key);
    if (!existing || existing.fingerprint !== fingerprint) {
      throw new Error("Cannot complete an unclaimed idempotency key.");
    }
    existing.result = result;
  }

  async abandon(key: string, fingerprint: string) {
    const existing = this.records.get(key);
    if (existing?.fingerprint === fingerprint && !existing.result) {
      this.records.delete(key);
    }
  }
}

export function createRequestFingerprint(
  method: string,
  pathname: string,
  canonicalBody: string,
) {
  return createHash("sha256")
    .update(`${method.toUpperCase()}\n${pathname}\n${canonicalBody}`)
    .digest("base64url");
}

export async function executeIdempotently(
  options: Readonly<{
    store: IdempotencyStore;
    scope: string;
    idempotencyKey: string;
    fingerprint: string;
    retentionMs?: number;
    nowMs?: number;
    operation: () => Promise<StoredHttpResult>;
  }>,
): Promise<Readonly<{ replayed: boolean; result: StoredHttpResult }>> {
  const storageKey = `${options.scope}:${options.idempotencyKey}`;
  const claim = await options.store.claim(
    storageKey,
    options.fingerprint,
    (options.nowMs ?? Date.now()) +
      (options.retentionMs ?? 24 * 60 * 60 * 1000),
    options.nowMs,
  );

  if (claim.status === "conflict") {
    throw new RequestSecurityError(
      409,
      "IDEMPOTENCY_KEY_REUSED",
      "The idempotency key was already used for a different request.",
    );
  }
  if (claim.status === "in-progress") {
    throw new RequestSecurityError(
      409,
      "REQUEST_ALREADY_IN_PROGRESS",
      "A request with this idempotency key is already being processed.",
      { "Retry-After": "2" },
    );
  }
  if (claim.status === "replay") {
    return { replayed: true, result: claim.result };
  }

  try {
    const result = await options.operation();
    await options.store.complete(storageKey, options.fingerprint, result);
    return { replayed: false, result };
  } catch (error) {
    await options.store.abandon(storageKey, options.fingerprint);
    throw error;
  }
}
