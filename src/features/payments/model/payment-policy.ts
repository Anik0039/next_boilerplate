import { z } from "zod";

import type { TrustedActorContext } from "@/security/server/trusted-actor";

const identifier = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/);
const positiveMinorUnits = z.string().regex(/^[1-9][0-9]{0,17}$/);

export const paymentInstructionSchema = z
  .object({
    paymentId: z.uuid(),
    debitAccountId: identifier,
    beneficiaryId: identifier,
    currency: z.string().regex(/^[A-Z]{3}$/),
    amountMinor: positiveMinorUnits,
    purpose: z.string().trim().min(1).max(140),
  })
  .strict();

export type PaymentInstruction = z.infer<typeof paymentInstructionSchema>;

export type PaymentSecurityPolicy = Readonly<{
  perTransactionLimitMinor: bigint;
  dailyLimitMinor: bigint;
  stepUpThresholdMinor: bigint;
  stepUpMaximumAgeMs: number;
  requiredCheckerCount: number;
}>;

export class PaymentPolicyError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "PaymentPolicyError";
  }
}

function assertRecentStepUp(
  actor: TrustedActorContext,
  policy: PaymentSecurityPolicy,
  now: Date,
) {
  const verifiedAt = actor.stepUpVerifiedAt?.getTime();
  if (
    actor.assuranceLevel !== "step-up" ||
    verifiedAt === undefined ||
    verifiedAt > now.getTime() ||
    now.getTime() - verifiedAt > policy.stepUpMaximumAgeMs
  ) {
    throw new PaymentPolicyError(
      "STEP_UP_REQUIRED",
      "A recent UMS-verified step-up authentication is required.",
    );
  }
}

export function assertPaymentSubmissionAllowed(
  options: Readonly<{
    payment: PaymentInstruction;
    actor: TrustedActorContext;
    policy: PaymentSecurityPolicy;
    dailyConsumedMinor: bigint;
    now?: Date;
  }>,
) {
  const amountMinor = BigInt(options.payment.amountMinor);
  if (amountMinor > options.policy.perTransactionLimitMinor) {
    throw new PaymentPolicyError(
      "PER_TRANSACTION_LIMIT_EXCEEDED",
      "The payment exceeds the per-transaction limit.",
    );
  }
  if (
    options.dailyConsumedMinor < BigInt(0) ||
    options.dailyConsumedMinor + amountMinor > options.policy.dailyLimitMinor
  ) {
    throw new PaymentPolicyError(
      "DAILY_LIMIT_EXCEEDED",
      "The payment exceeds the remaining daily limit.",
    );
  }
  if (amountMinor >= options.policy.stepUpThresholdMinor) {
    assertRecentStepUp(
      options.actor,
      options.policy,
      options.now ?? new Date(),
    );
  }
}

export type PaymentApproval = Readonly<{
  paymentId: string;
  makerActorId: string;
  status: "pending-approval" | "approved" | "rejected" | "executed";
  requiredCheckerCount: number;
  checkerActorIds: readonly string[];
  decidedAt?: Date;
}>;

export function createPendingApproval(
  paymentId: string,
  maker: TrustedActorContext,
  requiredCheckerCount: number,
): PaymentApproval {
  if (!Number.isSafeInteger(requiredCheckerCount) || requiredCheckerCount < 1) {
    throw new PaymentPolicyError(
      "INVALID_APPROVAL_POLICY",
      "At least one checker is required.",
    );
  }
  return {
    paymentId,
    makerActorId: maker.actorId,
    status: "pending-approval",
    requiredCheckerCount,
    checkerActorIds: [],
  };
}

export function approvePayment(
  approval: PaymentApproval,
  checker: TrustedActorContext,
  policy: PaymentSecurityPolicy,
  now = new Date(),
): PaymentApproval {
  if (approval.status !== "pending-approval") {
    throw new PaymentPolicyError(
      "PAYMENT_NOT_PENDING",
      "Only a pending payment can be approved.",
    );
  }
  if (checker.actorId === approval.makerActorId) {
    throw new PaymentPolicyError(
      "MAKER_CANNOT_CHECK",
      "The payment maker cannot approve the same payment.",
    );
  }
  if (approval.checkerActorIds.includes(checker.actorId)) {
    throw new PaymentPolicyError(
      "CHECKER_ALREADY_APPROVED",
      "A checker can approve a payment only once.",
    );
  }
  assertRecentStepUp(checker, policy, now);

  const checkerActorIds = [...approval.checkerActorIds, checker.actorId];
  const approved = checkerActorIds.length >= approval.requiredCheckerCount;
  return {
    ...approval,
    checkerActorIds,
    status: approved ? "approved" : "pending-approval",
    decidedAt: approved ? now : undefined,
  };
}

export function rejectPayment(
  approval: PaymentApproval,
  checker: TrustedActorContext,
  policy: PaymentSecurityPolicy,
  now = new Date(),
): PaymentApproval {
  if (approval.status !== "pending-approval") {
    throw new PaymentPolicyError(
      "PAYMENT_NOT_PENDING",
      "Only a pending payment can be rejected.",
    );
  }
  if (checker.actorId === approval.makerActorId) {
    throw new PaymentPolicyError(
      "MAKER_CANNOT_CHECK",
      "The payment maker cannot reject the same payment.",
    );
  }
  assertRecentStepUp(checker, policy, now);
  return { ...approval, status: "rejected", decidedAt: now };
}

export function assertPaymentCanExecute(approval: PaymentApproval) {
  if (approval.status !== "approved") {
    throw new PaymentPolicyError(
      "PAYMENT_NOT_APPROVED",
      "A payment must complete maker-checker approval before execution.",
    );
  }
}
