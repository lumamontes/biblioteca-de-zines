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

  test("should keep review cards and actions within the viewport", async ({ page }) => {
    const overflow = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));

    expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewportWidth);

    const uploadPreviews = page.locator('[data-testid="upload-preview"]');
    const previewCount = await uploadPreviews.count();
    const layout = await page.evaluate(() => {
      const cards = [...document.querySelectorAll<HTMLElement>('[data-testid="upload-preview"]')];
      const actions = cards
        .map((card) => card.querySelector<HTMLElement>('[data-testid="upload-actions"]'))
        .filter((action): action is HTMLElement => Boolean(action));

      return {
        viewportWidth: window.innerWidth,
        actionWidths: actions.map((action) => Math.round(action.getBoundingClientRect().width)),
        actionLefts: actions.map((action) => Math.round(action.getBoundingClientRect().left)),
        actionTopOffsets: actions.map((action, index) => Math.round(
          action.getBoundingClientRect().top - cards[index].getBoundingClientRect().top,
        )),
        actionBounds: actions.map((action, index) => {
          const actionRect = action.getBoundingClientRect();
          const cardRect = cards[index].getBoundingClientRect();
          return {
            left: actionRect.left,
            right: actionRect.right,
            cardLeft: cardRect.left,
            cardRight: cardRect.right,
            top: actionRect.top,
            cardTop: cardRect.top,
          };
        }),
        filterWrapping: getComputedStyle(document.querySelector('[data-testid="uploads-section"] > div') as HTMLElement).flexWrap,
      };
    });

    expect(layout.filterWrapping).toBe("wrap");

    if (layout.viewportWidth >= 640 && layout.actionWidths.length > 0) {
      expect(new Set(layout.actionWidths)).toEqual(new Set([200]));
      expect(new Set(layout.actionLefts).size).toBe(1);
      expect(layout.actionTopOffsets.every((offset) => offset <= 1)).toBe(true);
    }

    expect(layout.actionBounds.every((bounds) => (
      bounds.left >= bounds.cardLeft
      && bounds.right <= bounds.cardRight
      && bounds.top >= bounds.cardTop
    ))).toBe(true);

    for (let index = 0; index < previewCount; index += 1) {
      const preview = uploadPreviews.nth(index);
      const cardOverflow = await preview.evaluate((element) => ({
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      }));

      expect(cardOverflow.scrollWidth).toBeLessThanOrEqual(cardOverflow.clientWidth);
      await expect(preview.locator('[data-testid="upload-actions"]')).toBeVisible();
    }

    const firstPreview = uploadPreviews.first();
    const longContentLayout = await firstPreview.evaluate((card) => {
      const content = card.querySelector<HTMLElement>('[data-testid="upload-content"]');
      if (!content) return null;

      const longLink = document.createElement("a");
      longLink.className = "break-words";
      longLink.href = "https://example.com/";
      longLink.textContent = `https://example.com/${"long-segment".repeat(30)}`;
      content.append(longLink);

      const result = {
        overflowWrap: getComputedStyle(longLink).overflowWrap,
        scrollWidth: card.scrollWidth,
        clientWidth: card.clientWidth,
      };
      longLink.remove();
      return result;
    });

    expect(longContentLayout).not.toBeNull();
    expect(longContentLayout?.overflowWrap).toBe("break-word");
    expect(longContentLayout?.scrollWidth).toBeLessThanOrEqual(longContentLayout?.clientWidth ?? 0);

    await firstPreview.getByRole("button", { name: "Editar" }).click();
    const editPreview = page.locator('[data-testid="upload-preview"]').first();
    await expect(editPreview.locator('[data-testid="upload-actions"]')).toBeVisible();

    const editOverflow = await editPreview.evaluate((card) => ({
      scrollWidth: card.scrollWidth,
      clientWidth: card.clientWidth,
    }));
    expect(editOverflow.scrollWidth).toBeLessThanOrEqual(editOverflow.clientWidth);

    const editLayout = await editPreview.evaluate((card) => {
      const action = card.querySelector<HTMLElement>('[data-testid="upload-actions"]');
      const content = card.querySelector<HTMLElement>('[data-testid="upload-content"]');
      if (!action || !content) return null;

      const longLink = document.createElement("a");
      longLink.className = "break-words";
      longLink.href = "https://example.com/";
      longLink.textContent = `https://example.com/${"edit-long-segment".repeat(30)}`;
      content.append(longLink);

      const cardRect = card.getBoundingClientRect();
      const actionRect = action.getBoundingClientRect();
      const result = {
        overflowWrap: getComputedStyle(longLink).overflowWrap,
        scrollWidth: card.scrollWidth,
        clientWidth: card.clientWidth,
        actionWidth: actionRect.width,
        actionLeft: actionRect.left,
        actionTopOffset: actionRect.top - cardRect.top,
      };
      longLink.remove();
      return result;
    });

    expect(editLayout).not.toBeNull();
    expect(editLayout?.overflowWrap).toBe("break-word");
    expect(editLayout?.scrollWidth).toBeLessThanOrEqual(editLayout?.clientWidth ?? 0);

    if ((editLayout?.clientWidth ?? 0) >= 640) {
      expect(Math.round(editLayout?.actionWidth ?? 0)).toBe(200);
      expect(editLayout?.actionLeft).toBeGreaterThanOrEqual(0);
      expect(editLayout?.actionTopOffset).toBeLessThanOrEqual(1);
    }
  });

  test("should allow logout", async ({ page }) => {
    await page.click('button:text("Sair")');
    await page.waitForURL("/login");
    await expect(page).toHaveURL("/login");
  });
});
