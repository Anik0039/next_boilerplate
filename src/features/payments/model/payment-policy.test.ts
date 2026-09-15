import { describe, expect, it } from "vitest";

import type { TrustedActorContext } from "@/security/server/trusted-actor";

import {
  approvePayment,
  assertPaymentCanExecute,
  assertPaymentSubmissionAllowed,
  createPendingApproval,
  paymentInstructionSchema,
  PaymentPolicyError,
} from "./payment-policy";

const now = new Date("2026-09-13T10:00:00.000Z");
const maker: TrustedActorContext = {
  actorId: "maker-1",
  authenticatedAt: now,
  assuranceLevel: "standard",
};
const checker: TrustedActorContext = {
  actorId: "checker-1",
  authenticatedAt: now,
  assuranceLevel: "step-up",
  stepUpVerifiedAt: new Date("2026-09-13T09:58:00.000Z"),
};
const policy = {
  perTransactionLimitMinor: BigInt(1_000_000),
  dailyLimitMinor: BigInt(2_000_000),
  stepUpThresholdMinor: BigInt(500_000),
  stepUpMaximumAgeMs: 5 * 60 * 1000,
  requiredCheckerCount: 1,
};
const payment = paymentInstructionSchema.parse({
  paymentId: "7a6d482b-d3c5-4e4b-b85a-45242d63f53d",
  debitAccountId: "account-1",
  beneficiaryId: "beneficiary-1",
  currency: "BDT",
  amountMinor: "600000",
  purpose: "Synthetic test payment",
});

describe("payment security policy", () => {
  it("requires recent step-up for high-value payments", () => {
    expect(() =>
      assertPaymentSubmissionAllowed({
        payment,
        actor: maker,
        policy,
        dailyConsumedMinor: BigInt(0),
        now,
      }),
    ).toThrowError(
      expect.objectContaining<Partial<PaymentPolicyError>>({
        code: "STEP_UP_REQUIRED",
      }),
    );

    expect(() =>
      assertPaymentSubmissionAllowed({
        payment,
        actor: checker,
        policy,
        dailyConsumedMinor: BigInt(0),
        now,
      }),
    ).not.toThrow();
  });

  it("enforces per-transaction and daily limits using minor units", () => {
    expect(() =>
      assertPaymentSubmissionAllowed({
        payment: { ...payment, amountMinor: "1000001" },
        actor: checker,
        policy,
        dailyConsumedMinor: BigInt(0),
        now,
      }),
    ).toThrowError(
      expect.objectContaining({ code: "PER_TRANSACTION_LIMIT_EXCEEDED" }),
    );

    expect(() =>
      assertPaymentSubmissionAllowed({
        payment,
        actor: checker,
        policy,
        dailyConsumedMinor: BigInt(1_500_000),
        now,
      }),
    ).toThrowError(expect.objectContaining({ code: "DAILY_LIMIT_EXCEEDED" }));
  });

  it("requires a distinct checker before execution", () => {
    const pending = createPendingApproval(
      payment.paymentId,
      maker,
      policy.requiredCheckerCount,
    );

    expect(() => approvePayment(pending, maker, policy, now)).toThrowError(
      expect.objectContaining({ code: "MAKER_CANNOT_CHECK" }),
    );
    expect(() => assertPaymentCanExecute(pending)).toThrowError(
      expect.objectContaining({ code: "PAYMENT_NOT_APPROVED" }),
    );
    expect(() =>
      approvePayment(
        pending,
        {
          ...checker,
          stepUpVerifiedAt: new Date("2026-09-13T09:00:00.000Z"),
        },
        policy,
        now,
      ),
    ).toThrowError(expect.objectContaining({ code: "STEP_UP_REQUIRED" }));

    const approved = approvePayment(pending, checker, policy, now);
    expect(approved.status).toBe("approved");
    expect(() => assertPaymentCanExecute(approved)).not.toThrow();
  });
});
