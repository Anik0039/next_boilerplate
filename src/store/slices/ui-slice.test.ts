import { describe, expect, it } from "vitest";
import { toggleBalanceMask, uiReducer } from "./ui-slice";

describe("ui reducer", () => {
  it("toggles balance masking", () => {
    expect(uiReducer(undefined, toggleBalanceMask()).maskBalances).toBe(false);
  });
});
