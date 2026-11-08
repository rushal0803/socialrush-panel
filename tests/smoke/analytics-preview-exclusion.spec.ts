import { test, expect } from '@playwright/test';

test('local collection is a no-op even before JSON/body processing', async ({ request }) => {
  const response = await request.post('/api/analytics', {
    headers: { 'Content-Type': 'text/plain' }, data: 'invalid analytics body',
  });
  expect(response.status()).toBe(204);
  expect(await response.text()).toBe('');
  expect(response.headers()['set-cookie']).toBeUndefined();
});
