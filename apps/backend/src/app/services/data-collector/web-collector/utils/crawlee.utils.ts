import { Locator, Page } from '@playwright/test';

export const DEFAULT_TRANSFORMER = (element: Locator) => element.textContent();
export const TRIM_TRANSFORMER = (element: Locator) => DEFAULT_TRANSFORMER(element)
  .then(text => text.trim());

export async function optionalLocator<T>(
  page: Page | Locator,
  selector: string,
  transform: (element: Locator) => Promise<T> = TRIM_TRANSFORMER as unknown as (element: Locator) => Promise<T>
): Promise<T | null> {
  await page.locator(selector).waitFor({ timeout: 2000 }).catch(() => { /* ignore */ });
  if (await page.locator(selector).isVisible()) {
    return transform(page.locator(selector));
  }
  return Promise.resolve(null);
}

export const DATETIME_TRANSFORMER = (element: Locator) => element.getAttribute('datetime')
  .then(datetime => new Date(datetime.trim()).getTime());
