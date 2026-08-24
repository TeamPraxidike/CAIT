import { test, expect, type Page } from '@playwright/test';
import { AUTHOR_STATE, type Persona, readPersonas } from './helpers/personas';
import { SMALL_PDF, LARGE_PDF, ensureFixtures } from './helpers/fixtures';

const RESUMABLE = '/storage/v1/upload/resumable'; // Supabase TUS endpoint

async function startMaterialPublish(page: Page) {
    await page.goto('/publish');
    await page.getByTestId('goto_publish_material').click();
    await expect(page).toHaveURL(/\/publish\/materials/);
    await expect(page.locator('input[type="file"]')).toBeAttached(); // dropzone ready
}

// Step 2 (title): fill title + pick a content type, advance to meta.
async function fillTitleStep(page: Page, title: string) {
    await page.getByPlaceholder('Title').fill(title);
    await page.getByRole('button', { name: 'Lecture Notes' }).click(); // materialType
    await page.getByRole('button', { name: 'Next →' }).click();
}

// Step 3 (meta): description, one LO, "made it yourself?", an existing tag.
// All of these are required for a *published* (non-draft) material.
async function fillMetaStep(page: Page, description = 'E2E published material.') {
    await page.getByPlaceholder('Additional Description...').fill(description);
    await page.locator('#learningObjective').fill('Understand the E2E publish flow.');
    await page.locator('button[name="add_LO"]').click();
    await page.getByRole('button', { name: 'Yes, I made it' }).click();

    const tagInput = page.locator('.input-chip-field');
    await tagInput.fill('machine learning');
    await tagInput.press('Enter');
    await expect(page.locator('.input-chip-list')).toContainText('machine learning');

    await page.getByRole('button', { name: 'Next →' }).click();
}

async function completePublication(page: Page) {
    const success = page.getByText('Publication uploaded successfully');
    const complete = page.getByRole('button', { name: 'Complete' });
    await expect(async () => {
        if (!(await success.isVisible())) await complete.click();
        await expect(success).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 45_000 });
}

test.describe('PMAT - publish a material', () => {
    test.use({ storageState: AUTHOR_STATE });

    let author: Persona;

    test.beforeAll(() => {
        ensureFixtures();
        author = readPersonas().author;
    });

    test('PMAT-01: publish a material end-to-end - upload, preview, complete, then verify in browse, profile, and download', async ({ page }) => {
        const title = `e2e-pmat-01-${Date.now()}`;
        const description = `Published by the PMAT-01 flagship ${Date.now()}.`;

        // --- publish: files step ---
        await startMaterialPublish(page);
        await page.locator('input[type="file"]').setInputFiles(SMALL_PDF);
        await expect(page.getByText('sample.pdf').first()).toBeVisible();

        // preview: clicking the file row opens the Render modal (an <iframe>)
        const previewFrame = page.locator('iframe[title="sample.pdf"]');
        await expect(async () => {
            await page.getByText('sample.pdf').first().click();
            await expect(previewFrame).toBeVisible({ timeout: 3_000 });
        }).toPass({ timeout: 15_000 });
        await page.locator('.modal').getByRole('button', { name: 'Close' }).click();
        await expect(previewFrame).toHaveCount(0);

        await page.getByRole('button', { name: 'Next →' }).click();
        await fillTitleStep(page, title);
        await fillMetaStep(page, description);
        await completePublication(page);

        // --- view page ---
        await page.getByRole('button', { name: 'View publication' }).click();
        await expect(page).toHaveURL(new RegExp(`/${author.username}/\\d+$`));
        const pubPath = new URL(page.url()).pathname;

        await expect(page.getByRole('heading', { name: title })).toBeVisible();
        await expect(page.getByText(description)).toBeVisible();
        await expect(page.getByText('Understand the E2E publish flow.')).toBeVisible();
        await expect(page.getByText('sample.pdf').first()).toBeVisible();

        // --- appears in browse ---
        await page.goto('/browse?type=materials');
        const search = page.getByPlaceholder('Browse materials');
        const browseCard = page.getByRole('link', { name: title });
        await expect(async () => {
            await search.fill(title);
            await search.press('Enter');
            await expect(browseCard).toBeVisible({ timeout: 3_000 });
        }).toPass({ timeout: 20_000 });

        // --- appears in author's "Your Publications" ---
        await page.goto(`/${author.username}`);
        const profileCard = page.getByRole('link', { name: title });
        await expect(async () => {
            await page.getByText('Your Publications').click();
            await expect(profileCard).toBeVisible({ timeout: 3_000 });
        }).toPass({ timeout: 20_000 });

        // --- download all files as zip ---
        await page.goto(pubPath);
        await expect(page.getByText('sample.pdf').first()).toBeVisible(); // files streamed
        const download = page.waitForEvent('download');
        await page.getByTestId('download-publication').click();
        expect((await download).suggestedFilename()).toBe(`${title}.zip`);
    });

    test('PMAT-11: a file over 6MB is uploaded in chunks (multi-request TUS)', async ({ page }) => {
        const title = `e2e-pmat-11-${Date.now()}`;

        // since the file is 10MB, TUS will receive 2 chunks (6MB + 4MB)
        // second chunk request is a PATCH, so we only expect 1 PATCH request

        let patchCount = 0;
        page.on('request', (req) => {
            if (req.method() === 'PATCH' && req.url().includes(RESUMABLE)) patchCount++;
        });

        await startMaterialPublish(page);
        await page.locator('input[type="file"]').setInputFiles(LARGE_PDF);
        await expect(page.getByText('large.pdf')).toBeVisible();
        await page.getByRole('button', { name: 'Next →' }).click();
        await fillTitleStep(page, title);
        await fillMetaStep(page);
        await completePublication(page);

        expect(patchCount).toBeGreaterThanOrEqual(1);
    });
});