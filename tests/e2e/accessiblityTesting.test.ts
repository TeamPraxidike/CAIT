import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// TODO: skip for now, make an issue for that
test.describe.skip('pages', () => {
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
});
