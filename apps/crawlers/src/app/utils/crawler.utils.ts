import { Locator, Page } from '@playwright/test';

export const DEFAULT_TRANSFORMER = (element: Locator) => element.textContent();
export const TRIM_TRANSFORMER = (element: Locator) => DEFAULT_TRANSFORMER(element)
  .then(text => text.trim());

export async function optionalLocator(page: Page, selector: string, transform: (element: Locator) => Promise<string> = TRIM_TRANSFORMER): Promise<string | null> {
  await page.locator(selector).waitFor({ timeout: 5000 }).catch(() => {/* ignore */});
  if (await page.locator(selector).isVisible()) {
    return transform(page.locator(selector));
  }
  return Promise.resolve(null);
}
