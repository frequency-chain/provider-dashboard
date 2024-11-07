import { test, expect } from '@playwright/test';

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
  await expect(page.getByText(/What is the difference between Mainnet and Testnets\?/)).toBeVisible();

  // Click the Home button
  await page.getByText(/Home/).click();
  await page.waitForURL('**/');
  await expect(page.getByText('Provider Login')).toBeVisible();
});

test('Become a provider routes', async ({page}) => {
  for (const name of ['Mainnet', 'testnet', 'LoCalHoSt']) {
    await page.goto(`/become-a-provider/${name}`);
    await page.waitForURL(`**/become-a-provider/${name}`);
    await expect(page.getByText(/Become a Provider/)).toBeVisible();
  }
});

test('Become a provider direct connection', async ({ page }) => {
  await page.goto('/become-a-provider/mainnet');
  await page.waitForURL('**/become-a-provider/mainnet');
  await expect(page.getByText(/Connected to Mainnet/i)).toBeVisible();
  await expect(page.getByText(/No accounts found/i)).toBeVisible();

  await page.goto('/become-a-provider/testnet');
  await page.waitForURL('**/become-a-provider/testnet');
  await expect(page.getByText(/Connected to Testnet on Paseo/)).toBeVisible();
  await expect(page.getByText(/No accounts found/i)).toBeVisible();
})

test('On Become a provider page, can change networks', async ({page}) => {
  await page.goto('/become-a-provider/mainnet');
  await page.waitForURL('**/become-a-provider/mainnet');
  await expect(page.getByText(/Connected to Mainnet/i)).toBeVisible();
  await page.getByText(/Change networks/).click({ force: true});
  await expect(page.getByText(/Connected to Mainnet/i)).not.toBeVisible();
  await expect(page.getByLabel(/Select a Network/i)).toBeVisible();
})

test('On provider login page, can change networks', async ({page}) => {
  await page.goto('/');
  await page.waitForURL('**/');
  await expect(page.getByText('Provider Login')).toBeVisible();

  await page.locator('select#network').selectOption({index: 1});
  await page.locator('select#network').dispatchEvent('change');


  await expect(page.getByText(/Connected to Mainnet/i)).toBeVisible();
  await page.getByText(/Change networks/).click({ force: true});
  await expect(page.getByText(/Connected to Mainnet/i)).not.toBeVisible();
  await expect(page.getByLabel(/Select a Network/i)).toBeVisible();
})
