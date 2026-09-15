import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseJsonRequest } from "./request-body";

const schema = z.object({ value: z.string().max(10) }).strict();

describe("bounded request parsing", () => {
  it("parses a valid JSON request through its runtime schema", async () => {
    const request = new Request("https://bank.example/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "safe" }),
    });
    await expect(
      parseJsonRequest(request, schema, { maximumBytes: 128 }),
    ).resolves.toEqual({ value: "safe" });
  });

  it("rejects oversized and unexpected content", async () => {
    const oversized = new Request("https://bank.example/api/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "too-large" }),
    });
    await expect(
      parseJsonRequest(oversized, schema, { maximumBytes: 5 }),
    ).rejects.toMatchObject({ code: "PAYLOAD_TOO_LARGE" });

    const form = new Request("https://bank.example/api/test", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "{}",
    });
    await expect(
      parseJsonRequest(form, schema, { maximumBytes: 128 }),
    ).rejects.toMatchObject({ code: "UNSUPPORTED_MEDIA_TYPE" });
  });
});
