const { test, expect } = require("@playwright/test");

test.describe("Citizen Action public smoke", () => {
  test("home page renders the feed shell", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("login page renders authentication entry point", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator("body")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /continue with google|sign in with email/i }),
    ).toBeVisible();
  });

  test("governance directory renders", async ({ page }) => {
    await page.goto("/governance");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByText("Governance", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("group", { name: "Governance directory view" })).toBeVisible();
  });

  test("privacy page is reachable from authentication flow", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("link", { name: "Privacy Policy" }).click();
    await expect(page).toHaveURL(/\/auth\/privacy$/);
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Citizen Action mobile smoke", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true });

  test("governance remains usable on mobile", async ({ page }) => {
    await page.goto("/governance");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByText("Governance", { exact: true }).first()).toBeVisible();
  });
});
