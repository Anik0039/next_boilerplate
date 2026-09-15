import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy, getCspResponseHeaderName } from "./csp";

describe("content security policy", () => {
  it("enforces CSP in production regardless of a report-only setting", () => {
    expect(getCspResponseHeaderName(true, "report-only")).toBe(
      "Content-Security-Policy",
    );
  });

  it("allows unsafe-eval only in development", () => {
    expect(buildContentSecurityPolicy("nonce", true)).toContain(
      "'unsafe-eval'",
    );
    expect(buildContentSecurityPolicy("nonce", false)).not.toContain(
      "'unsafe-eval'",
    );
  });
});
