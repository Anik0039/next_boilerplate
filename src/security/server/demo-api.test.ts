import { describe, expect, it } from "vitest";

import { isDemoApiEnabled } from "./demo-api";

describe("demo API deployment guard", () => {
  it("cannot be enabled in production through configuration", () => {
    expect(
      isDemoApiEnabled({ NODE_ENV: "production", ENABLE_DEMO_API: "true" }),
    ).toBe(false);
  });

  it("requires explicit opt-in outside production", () => {
    expect(
      isDemoApiEnabled({ NODE_ENV: "development", ENABLE_DEMO_API: "true" }),
    ).toBe(true);
    expect(isDemoApiEnabled({ NODE_ENV: "development" })).toBe(false);
  });
});
