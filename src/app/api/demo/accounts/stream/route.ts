export const dynamic = "force-dynamic";

import { SENSITIVE_STREAM_HEADERS } from "@/security/server/cache-policy";
import {
  demoApiDisabledResponse,
  isDemoApiEnabled,
} from "@/security/server/demo-api";

export async function GET(request: Request) {
  if (!isDemoApiEnabled()) return demoApiDisabledResponse();

  const encoder = new TextEncoder();
  let sequence = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(": connected\n\n"));
      timer = setInterval(() => {
        sequence += 1;
        const event = {
          id: "operating-bdt",
          availableBalance: 12450000 + sequence * 2500,
          observedAt: new Date().toISOString(),
        };
        controller.enqueue(
          encoder.encode(`event: balance\ndata: ${JSON.stringify(event)}\n\n`),
        );
      }, 5000);
    },
    cancel() {
      if (timer) clearInterval(timer);
    },
  });

  request.signal.addEventListener("abort", () => {
    if (timer) clearInterval(timer);
  });

  return new Response(stream, {
    headers: {
      ...SENSITIVE_STREAM_HEADERS,
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
    },
  });
}
