import { SENSITIVE_RESPONSE_HEADERS } from "./cache-policy";

export class RequestSecurityError extends Error {
  constructor(
    readonly status: 400 | 403 | 409 | 413 | 415 | 422 | 429 | 503,
    readonly code: string,
    message: string,
    readonly responseHeaders: Record<string, string> = {},
  ) {
    super(message);
    this.name = "RequestSecurityError";
  }
}

export function requestSecurityErrorResponse(error: unknown) {
  const securityError =
    error instanceof RequestSecurityError
      ? error
      : new RequestSecurityError(
          400,
          "INVALID_REQUEST",
          "The request could not be processed.",
        );

  return Response.json(
    { error: { code: securityError.code, message: securityError.message } },
    {
      status: securityError.status,
      headers: {
        ...SENSITIVE_RESPONSE_HEADERS,
        ...securityError.responseHeaders,
      },
    },
  );
}
