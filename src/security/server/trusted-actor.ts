/**
 * Populated only by the future server-side UMS/Keycloak adapter after token or
 * session verification. Never construct this context from request body fields,
 * query parameters, or browser-supplied identity/role headers.
 */
export type TrustedActorContext = Readonly<{
  actorId: string;
  authenticatedAt: Date;
  assuranceLevel: "standard" | "step-up";
  stepUpVerifiedAt?: Date;
}>;

export interface TrustedActorProvider {
  verifyRequest(request: Request): Promise<TrustedActorContext>;
}
