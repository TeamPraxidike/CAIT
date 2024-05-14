import { test, expect } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });

	expect(await page.textContent('h1')).toBe('CAIT');
});
