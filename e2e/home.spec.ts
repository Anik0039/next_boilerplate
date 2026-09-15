import { expect, test } from "@playwright/test";

test("loads the account summary", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Account summary" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Show balances" }),
  ).toBeVisible();
});
