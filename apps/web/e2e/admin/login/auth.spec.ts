import { test } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

test("Save authentication state", async ({ page }) => {
  await page.goto("http://localhost:3000/login");

  if (!TEST_EMAIL || !TEST_PASSWORD) {
    throw new Error("Test user credentials not set");
  }

  await page.getByPlaceholder("Digite seu email").fill(TEST_EMAIL);
  await page.getByPlaceholder("Digite sua senha").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.waitForURL("**/dashboard", { timeout: 60000 });

  await page.context().storageState({ path: "auth.json" });
});
