import { test, expect } from '@playwright/test';
let root = 'http://localhost:4173/';

test('Navigation from home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Provider Login')).toBeVisible();

  // Go to 'Become a Provider'
  await page.getByTestId('become-a-provider').click();
  await page.waitForURL('**/become-a-provider');
  expect(page.getByText(/Become a Provider/)).toBeVisible();

  await page.getByText(/Back/).click();
  await page.waitForURL('**/');

  // Go to FAQ
  await page.getByText(/FAQ/).click();
  await page.waitForURL('**/faq');
  expect(page.getByText(/What is the difference between Mainnet and Testnets\?/)).toBeVisible();

  // Click the Home button
  await page.getByText(/Home/).click();
  await page.waitForURL('**/');
  await expect(page.getByText('Provider Login')).toBeVisible();
});
