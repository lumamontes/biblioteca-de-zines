import { test, expect } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;
test.describe("Login Page", () => {
  test.use({ storageState: "auth.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display the login form", async ({ page }) => {
    await expect(page.locator("h1")).toHaveText("Biblioteca de Zines");
    await expect(page.locator("form")).toBeVisible();

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(manifestHref).toBe("/site.webmanifest");
    if (!manifestHref) throw new Error("Manifest link is missing");
    const manifestResponse = await page.request.get(new URL(manifestHref, page.url()).toString());
    expect(manifestResponse.ok()).toBe(true);
    expect(new URL(manifestResponse.url()).origin).toBe(new URL(page.url()).origin);
  });

  test("should log in successfully", async ({ page }) => {
    if (!TEST_EMAIL || !TEST_PASSWORD) {
      throw new Error("Test user credentials not set");
    }
    await page.getByPlaceholder("Digite seu email").fill(TEST_EMAIL);
    await page.getByPlaceholder("Digite sua senha").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();

    await page.waitForURL("**/dashboard", { timeout: 60000 });
    await expect(page).toHaveURL("/dashboard");
  });

  test("should show error on invalid login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/login");
    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/login\?error=invalid/);
    await expect(page.getByRole("alert")).toHaveText(
      "Não foi possível entrar. Verifique seu email e senha e tente novamente.",
    );
  });

  test("should return safely when auth confirmation fails", async ({ page }) => {
    await page.goto("/auth/confirm");

    await expect(page).toHaveURL(/\/login\?error=auth/);
    await expect(page.getByRole("alert")).toHaveText(
      "Não foi possível concluir a autenticação. Tente novamente.",
    );
  });
});
