import { test, expect } from '@playwright/test';

const routes = ['/#/login-aluno', '/#/plataforma'];

for (const route of routes) {
  test.describe(`visual: ${route}`, () => {
    test(`375x667`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(route);
      // Aguarda fontes/imagens críticas
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveScreenshot({ fullPage: true });
    });

    test(`768x1024`, async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveScreenshot({ fullPage: true });
    });

    test(`1366x768`, async ({ page }) => {
      await page.setViewportSize({ width: 1366, height: 768 });
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  });
}

