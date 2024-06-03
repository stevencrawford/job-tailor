import { Locator, Page, selectors } from '@playwright/test';

export async function registerEngines() {
  // Must be a function that evaluates to a selector engine instance.
  const createTagNameEngine = () => ({
    // Returns the first element matching given selector in the root's subtree.
    query(root, selector) {
      return root.querySelector(selector);
    },

    // Returns all elements matching given selector in the root's subtree.
    queryAll(root, selector) {
      return Array.from(root.querySelectorAll(selector));
    }
  });

  // Register the engine. Selectors will be prefixed with "tag=".
  await selectors.register('tag', createTagNameEngine);
}

export async function clickButton(page: Page, buttonText: string) {
  await page.locator('tag=button').getByText(buttonText).click();
}

export const DEFAULT_TRANSFORMER = (element: Locator) => element.textContent();
export async function optionalLocator(page: Page, selector: string, transform: (element: Locator) => Promise<string> = DEFAULT_TRANSFORMER): Promise<string | null> {
  await page.locator(selector).waitFor({ timeout: 5000 }).catch(() => {/* ignore */});
  if (await page.locator(selector).isVisible()) {
    return transform(page.locator(selector));
  }
  return Promise.resolve(null);
}
