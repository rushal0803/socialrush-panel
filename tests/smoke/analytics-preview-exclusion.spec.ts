import { test, expect } from '@playwright/test';

test('local collection is a no-op even before JSON/body processing', async ({ request }) => {
  const response = await request.post('/api/analytics', {
    headers: { 'Content-Type': 'text/plain' }, data: 'invalid analytics body',
  });
  expect(response.status()).toBe(204);
  expect(await response.text()).toBe('');
  expect(response.headers()['set-cookie']).toBeUndefined();
});


test('local conversion navigation sends no collection beacons', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'doNotTrack', { configurable: true, get: () => '0' }));
  let collectionRequests = 0;
  await page.route('**/api/analytics', route => { collectionRequests++; return route.fulfill({ status: 204 }); });
  await page.goto('/');
  const compare = page.getByRole('navigation', { name: 'Choose your next step' }).getByRole('link', { name: /I want to compare services/ });
  await compare.click();
  await expect(page).toHaveURL(/\/services$/);
  expect(collectionRequests).toBe(0);
});
