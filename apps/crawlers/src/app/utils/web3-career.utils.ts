import { Locator } from '@playwright/test';

export const JOB_TITLE_TRANSFORMER = (element: Locator) => element.innerText()
  .then(text => text.split('\n').at(1));

export const TIMESTAMP_TRANSFORMER = (element: Locator) => element.getAttribute('datetime')
  .then(datetime => new Date(datetime.trim()).getTime());
