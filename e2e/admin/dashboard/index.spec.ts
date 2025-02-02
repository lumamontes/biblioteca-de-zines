import { test, expect } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;
const VALID_ZINE_SLUG = "luana-goes-girlhood";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      throw new Error("Test user credentials not set");
    }
    await page.goto("/login");
    await page.getByPlaceholder("Digite seu email").fill(TEST_EMAIL);
    await page.getByPlaceholder("Digite sua senha").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL("**/dashboard", { timeout: 60000 });
    await expect(page).toHaveURL("/dashboard");
  });

  test("should display dashboard content", async ({ page }) => {
    await expect(page.locator("h1")).toHaveText("Zines Recebidas");
    await expect(page.locator('button:has-text("Sair")')).toBeVisible();

    await expect(page.locator('[data-testId="welcome-section"]')).toBeVisible();
    await expect(page.locator('[data-testId="uploads-section"]')).toBeVisible();

    const uploadPreviews = await page
      .locator('[data-testId="upload-preview"]')
      .count();
    expect(uploadPreviews).toBeGreaterThan(0);
  });

  test("should display a specific zine", async ({ page }) => {
    const zineLocator = page.locator(`a[href="/zines/${VALID_ZINE_SLUG}"]`);
    await expect(zineLocator).toBeVisible();

    await zineLocator.click();
    await page.waitForURL(`/zines/${VALID_ZINE_SLUG}`);
    await expect(page).toHaveURL(`/zines/${VALID_ZINE_SLUG}`);
  });

  test("should allow logout", async ({ page }) => {
    await page.click('button:text("Sair")');
    await page.waitForURL("/login");
    await expect(page).toHaveURL("/login");
  });
});
