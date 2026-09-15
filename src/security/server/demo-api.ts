export function isDemoApiEnabled(
  environment: Readonly<Record<string, string | undefined>> = process.env,
) {
  return (
    environment.NODE_ENV !== "production" &&
    environment.ENABLE_DEMO_API === "true"
  );
}

export function demoApiDisabledResponse() {
  return Response.json(
    { message: "Not found" },
    {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
