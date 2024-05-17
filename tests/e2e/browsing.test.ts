import { test, expect } from '@playwright/test';

test('user should be able to post a new publication', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });

	await page
		.getByRole('button', { name: 'Sign In' })
		.click({ timeout: 2000 });
	await page.getByRole('link', { name: 'Publish' }).click({ timeout: 2000 });

	expect(
		await page.isVisible('text=Choose Your Publication Type', {
			timeout: 2000,
		}),
	).toBeTruthy();

	await page
		.locator('.col-start-1 > div:nth-child(2) > a')
		.first()
		.click({ timeout: 2000 });

	expect(
		await page.isVisible('text=Publish a publication', { timeout: 2000 }),
	).toBeTruthy();

	await page.fill(
		'input[name="title"]',
		'Convolutional Neural Networks TEST',
		{
			timeout: 2000,
		},
	);
	await page.fill('textarea[name="description"]', 'This is a description');
	await page.fill(
		'input[name="learning_objective_input"]',
		'Understand CNNs',
		{ timeout: 2000 },
	);

	await page.locator('button[name="add_lo"]').click();

	expect(
		await page.isVisible('text=Understand CNNs', {
			timeout: 2000,
		}),
	).toBeTruthy();

	await page.getByRole('button', { name: 'Publish' }).click();

	expect(
		await page.isVisible('text=Successfully submitted!', { timeout: 2000 }),
	).toBeTruthy();

	await page.getByRole('link', { name: 'Browse Materials' }).click();

	expect(
		page.getByRole('heading', {
			name: 'Convolutional Neural Networks TEST',
			exact: true,
		}),
	).toBeTruthy();
});
