import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("renders the application identity in a banner", () => {
    render(<SiteHeader />);

    const banner = screen.getByRole("banner");
    expect(banner).toContainElement(
      screen.getByRole("heading", {
        level: 1,
        name: "Corporate Internet Banking",
      }),
    );
    expect(screen.getByText("Prototype")).toBeInTheDocument();
  });
});
