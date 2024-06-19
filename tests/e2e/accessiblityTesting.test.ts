import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('pages', () => {
	test('should not have any automatically detectable accessibility issues in homepage', async ({
		page,
	}) => {
		await page.goto('/');

		const accessibilityScanResults = await new AxeBuilder({
			page,
		}).analyze();

		expect(accessibilityScanResults.violations).toEqual([]);
	});

	test('should not have any automatically detectable accessibility issues in about page', async ({
		page,
	}) => {
		await page.goto('/about');

		const accessibilityScanResults = await new AxeBuilder({
			page,
		}).analyze();

		expect(accessibilityScanResults.violations).toEqual([]);
	});

	test('should not have any automatically detectable accessibility issues in browse page', async ({
		page,
	}) => {
		await page.goto('/browse');

		const accessibilityScanResults = await new AxeBuilder({
			page,
		}).analyze();

		expect(accessibilityScanResults.violations).toEqual([]);
	});
});
