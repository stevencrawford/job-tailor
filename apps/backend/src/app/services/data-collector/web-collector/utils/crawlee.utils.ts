import { expect, Locator, Page } from '@playwright/test';

export const TEXT_CONTENT_TRANSFORMER = (element: Locator) => element.textContent();

export const ALL_TEXT_CONTENTS_TRANSFORMER = (element: Locator) => {
  return element.allTextContents();
};
export const TRIM_TRANSFORMER = (element: Locator) => TEXT_CONTENT_TRANSFORMER(element)
  .then(text => text.trim());

export const MULTI_TEXT_TRANSFORMER = (delimiter = ',') => (element: Locator) => ALL_TEXT_CONTENTS_TRANSFORMER(element)
  .then(arr => {
    return arr.map(s => s.trim()).join(delimiter);
  });

export async function optionalLocator<T>(
  page: Page | Locator,
  selector: string,
  transform: (element: Locator) => Promise<T> = TRIM_TRANSFORMER as unknown as (element: Locator) => Promise<T>,
): Promise<T | null> {
  return await expect(page.locator(selector).first()).toBeVisible({ timeout: 2000 })
    .then(async () => await transform(page.locator(selector)))
    .catch(() => Promise.resolve(null) /* ignore and return null */);
}

export const DATETIME_TRANSFORMER = (element: Locator) => element.getAttribute('datetime')
  .then(datetime => new Date(datetime.trim()).getTime());
