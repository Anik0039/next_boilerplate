import { createHash } from "node:crypto";

export type RateLimitDecision = Readonly<{
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAtMs: number;
}>;

type Bucket = { count: number; resetAtMs: number };

/** Per-process defense in depth; the production gateway owns distributed limits. */
export class InMemoryRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private operations = 0;

  consume(
    key: string,
    policy: Readonly<{ limit: number; windowMs: number }>,
    nowMs = Date.now(),
  ): RateLimitDecision {
    this.operations += 1;
    if (this.operations % 128 === 0) {
      for (const [storedKey, bucket] of this.buckets) {
        if (bucket.resetAtMs <= nowMs) this.buckets.delete(storedKey);
      }
    }
    if (!this.buckets.has(key) && this.buckets.size >= 10_000) {
      key = "overflow";
    }

    const existing = this.buckets.get(key);
    const bucket =
      !existing || existing.resetAtMs <= nowMs
        ? { count: 0, resetAtMs: nowMs + policy.windowMs }
        : existing;

    bucket.count += 1;
    this.buckets.set(key, bucket);

    return {
      allowed: bucket.count <= policy.limit,
      limit: policy.limit,
      remaining: Math.max(0, policy.limit - bucket.count),
      resetAtMs: bucket.resetAtMs,
    };
  }
}

const globalRateLimiter = globalThis as typeof globalThis & {
  __cibRateLimiter?: InMemoryRateLimiter;
};

export const applicationRateLimiter =
  globalRateLimiter.__cibRateLimiter ?? new InMemoryRateLimiter();
globalRateLimiter.__cibRateLimiter = applicationRateLimiter;

export function getRateLimitSubject(
  request: Request,
  trustProxyHeaders: boolean,
) {
  let address = "unattributed";
  if (trustProxyHeaders) {
    address =
      request.headers.get("x-azure-clientip")?.trim() ||
      request.headers.get("cf-connecting-ip")?.trim() ||
      request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim() ||
      address;
  }

  return createHash("sha256").update(address).digest("hex").slice(0, 24);
}
