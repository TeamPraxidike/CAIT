import { test, expect } from '@playwright/test';

test('landing page loads and shows hero text', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h2')).toContainText('Community Archive for Integrated Teaching');
});

test('landing page has See Publications button linking to browse', async ({ page }) => {
	await page.goto('/');
	const btn = page.getByRole('button', { name: 'See Publications' });
	await expect(btn).toBeVisible();
	await btn.click();
	await expect(page).toHaveURL(/\/browse/);
});

test('about page loads', async ({ page }) => {
	await page.goto('/about');
	await expect(page.locator('h1')).toContainText('About');
});

test('signin page shows login form', async ({ page }) => {
	await page.goto('/signin');
	await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

test('navigation bar has Sign In link', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
});
