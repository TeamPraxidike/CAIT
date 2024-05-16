import { test, expect } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });

	expect(await page.textContent('h1')).toBe('CAIT');
});

test('One can login', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });

	await page.click('text=Sign In');

	// one can now open the popup of the user profile
	await page.getByTestId('profile-picture').click({ timeout: 2000 });
	await page.click('text=Profile');

	// now one should be in their profile
	expect(await page.isVisible('text=Saved Publications')).toBeTruthy();

	await page.getByTestId('profile-picture').click({ timeout: 2000 });
	await page.click('text=Log out', { timeout: 2000 });

	expect(await page.isVisible('text=Publish', { timeout: 2000 })).toBeFalsy();
});

test('One can browse the publications', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });

	await page.click('text=Browse Materials');

	await page.waitForSelector('text=Materials');

	// expect(await page.isVisible('text=Difficulty')).toBeTruthy();
	expect(await page.isVisible('text=Publishers')).toBeTruthy();
	expect(await page.isVisible('text=Sort By')).toBeTruthy();
});
