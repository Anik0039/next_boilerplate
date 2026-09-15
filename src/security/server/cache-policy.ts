export const SENSITIVE_RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  Expires: "0",
  Pragma: "no-cache",
} as const;

export const SENSITIVE_STREAM_HEADERS = {
  ...SENSITIVE_RESPONSE_HEADERS,
  "X-Accel-Buffering": "no",
} as const;
