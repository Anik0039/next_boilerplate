import { z } from "zod";

import { RequestSecurityError } from "./request-security-error";

const DEFAULT_JSON_CONTENT_TYPES = ["application/json"];

function normalizedContentType(request: Request) {
  return request.headers.get("content-type")?.split(";", 1)[0]?.trim() ?? "";
}

async function readBodyWithLimit(request: Request, maximumBytes: number) {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (!Number.isSafeInteger(parsedLength) || parsedLength < 0) {
      throw new RequestSecurityError(
        400,
        "INVALID_CONTENT_LENGTH",
        "The request content length is invalid.",
      );
    }
    if (parsedLength > maximumBytes) {
      throw new RequestSecurityError(
        413,
        "PAYLOAD_TOO_LARGE",
        "The request payload is too large.",
      );
    }
  }

  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maximumBytes) {
      await reader.cancel();
      throw new RequestSecurityError(
        413,
        "PAYLOAD_TOO_LARGE",
        "The request payload is too large.",
      );
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function parseJsonRequest<T>(
  request: Request,
  schema: z.ZodType<T>,
  options: Readonly<{
    maximumBytes: number;
    acceptedContentTypes?: readonly string[];
  }>,
) {
  const acceptedContentTypes =
    options.acceptedContentTypes ?? DEFAULT_JSON_CONTENT_TYPES;
  if (!acceptedContentTypes.includes(normalizedContentType(request))) {
    throw new RequestSecurityError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "The request content type is not supported.",
    );
  }

  const body = await readBodyWithLimit(request, options.maximumBytes);
  let candidate: unknown;

  try {
    candidate = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(body),
    );
  } catch {
    throw new RequestSecurityError(
      400,
      "MALFORMED_JSON",
      "The request body must contain valid JSON.",
    );
  }

  const result = schema.safeParse(candidate);
  if (!result.success) {
    throw new RequestSecurityError(
      422,
      "INVALID_REQUEST_SCHEMA",
      "The request body does not match the required schema.",
    );
  }

  return result.data;
}
