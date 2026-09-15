import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading } from "./heading";

describe("Heading", () => {
  it("renders the requested semantic level", () => {
    render(<Heading level={1}>Corporate Internet Banking</Heading>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Corporate Internet Banking",
    );
  });
});
