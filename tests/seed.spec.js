const { test, expect } = require("@playwright/test");

/**
 * Seed environment contract for Playwright agents.
 *
 * This intentionally avoids mutating production data. The first agent pass uses
 * public routes only. Authenticated tests can load a saved storageState later
 * from PLAYWRIGHT_AUTH_STATE when a dedicated test identity exists.
 */
test("seed: Citizen Action is reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});
