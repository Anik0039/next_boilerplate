import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import { getCsrfToken } from "@/security/csrf-client";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "same-origin",
  prepareHeaders(headers) {
    headers.set("Accept", "application/json");
    return headers;
  },
});

function isMutation(args: string | FetchArgs): args is FetchArgs {
  return (
    typeof args !== "string" &&
    !["GET", "HEAD", "OPTIONS"].includes((args.method ?? "GET").toUpperCase())
  );
}

const secureBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (!isMutation(args)) return rawBaseQuery(args, api, extraOptions);

  const headers = new Headers();
  if (args.headers instanceof Headers) {
    args.headers.forEach((value, key) => headers.set(key, value));
  } else if (Array.isArray(args.headers)) {
    for (const [key, value] of args.headers) {
      if (key && value !== undefined) headers.set(key, value);
    }
  } else if (args.headers) {
    for (const [key, value] of Object.entries(args.headers)) {
      if (value !== undefined) headers.set(key, value);
    }
  }
  headers.set("x-csrf-token", await getCsrfToken());
  headers.set("x-request-nonce", crypto.randomUUID());
  headers.set("x-request-timestamp", new Date().toISOString());
  if (!headers.has("idempotency-key")) {
    headers.set("idempotency-key", crypto.randomUUID());
  }

  return rawBaseQuery({ ...args, headers }, api, extraOptions);
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: secureBaseQuery,
  endpoints: () => ({}),
});
