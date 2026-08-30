import { test, expect, type Page } from '@playwright/test';
import { AUTHOR_STATE, type Persona, readPersonas } from './helpers/personas';
import { SMALL_PDF, LARGE_PDF, ensureFixtures } from './helpers/fixtures';
import {
    addLearningObjective,
    nextStep,
    pickMaterialType,
    setDescription,
    setSelfMade,
    setTitle,
    addTag,
    completeStepper,
    setDraft
} from "./helpers/stepper";
import { expectCardInTab } from './helpers/profile';
import {expectAbsentFromBrowse, findOnBrowse} from "./helpers/browse";

const RESUMABLE = '/storage/v1/upload/resumable'; // Supabase TUS endpoint

async function startMaterialPublish(page: Page) {
    await page.goto('/publish');
    await page.getByTestId('goto_publish_material').click();
    await expect(page).toHaveURL(/\/publish\/materials/);
    await expect(page.locator('input[type="file"]')).toBeAttached(); // dropzone ready
}

// Step 2 (title): fill title + pick a content type, advance to meta.
async function fillTitleStep(page: Page, title: string) {
    await setTitle(page, title);
    await pickMaterialType(page);
    await nextStep(page);
}

// Step 3 (meta): description, one LO, "made it yourself?", an existing tag.
// All of these are required for a *published* (non-draft) material.
async function fillMetaStep(page: Page, description = 'E2E published material.') {
    await setDescription(page, description);
    await addLearningObjective(page, 'Understand the E2E publish flow.');
    await setSelfMade(page, true);
    await addTag(page, 'machine learning');
    await nextStep(page);
}

test.describe('PMAT - publish a material', () => {
    test.use({storageState: AUTHOR_STATE});

    let author: Persona;

    test.beforeAll(() => {
        ensureFixtures();
        author = readPersonas().author;
    });

    test('PMAT-01: publish a material end-to-end - upload, preview, complete, then verify in browse, profile, and download', async ({page}) => {
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
            await expect(previewFrame).toBeVisible({timeout: 3_000});
        }).toPass({timeout: 15_000});
        await page.locator('.modal').getByRole('button', {name: 'Close'}).click();
        await expect(previewFrame).toHaveCount(0);

        await nextStep(page);
        await fillTitleStep(page, title);
        await fillMetaStep(page, description);
        await completeStepper(page, 'publish')

        // --- view page ---
        await page.getByRole('button', {name: 'View publication'}).click();
        await expect(page).toHaveURL(new RegExp(`/${author.username}/\\d+$`));
        const pubPath = new URL(page.url()).pathname;

        await expect(page.getByRole('heading', {name: title})).toBeVisible();
        await expect(page.getByText(description)).toBeVisible();
        await expect(page.getByText('Understand the E2E publish flow.')).toBeVisible();
        await expect(page.getByText('sample.pdf').first()).toBeVisible();

        // --- appears in browse ---
        await findOnBrowse(page, 'materials', title);

        // --- appears in author's "Your Publications" ---
        await page.goto(`/${author.username}`);
        await expectCardInTab(page, 'Your Publications', title);

        // --- download all files as zip ---
        await page.goto(pubPath);
        await expect(page.getByText('sample.pdf').first()).toBeVisible(); // files streamed
        const download = page.waitForEvent('download');
        await page.getByTestId('download-publication').click();
        expect((await download).suggestedFilename()).toBe(`${title}.zip`);
    });

    test('PMAT-11: a file over 6MB is uploaded in chunks (multi-request TUS)', async ({page}) => {
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
        await nextStep(page);
        await fillTitleStep(page, title);
        await fillMetaStep(page);
        await completeStepper(page, 'publish')

        expect(patchCount).toBeGreaterThanOrEqual(1);
    });

    test('PMAT-02: publish a material with an external file URL (no upload)', async ({page}) => {
        const title = `e2e-pmat-02-${Date.now()}`;
        const fileUrl = `https://example.com/e2e-${Date.now()}.pdf`;

        await startMaterialPublish(page);
        await page.locator('#urlInput').fill(fileUrl);
        await page.getByRole('button', {name: 'Add'}).click();
        await expect(page.getByText(fileUrl)).toBeVisible(); // URL row added

        await nextStep(page);
        await fillTitleStep(page, title);
        await fillMetaStep(page);
        await completeStepper(page, 'publish')

        await page.getByRole('button', {name: 'View publication'}).click();
        await expect(page).toHaveURL(new RegExp(`/${author.username}/\\d+$`));
        await expect(page.getByRole('heading', {name: title})).toBeVisible();
        await expect(page.getByText(fileUrl)).toBeVisible(); // URL listed in the files tab
    });

    test('PMAT-03: complete the stepper marked as a draft', async ({page}) => {
        const title = `e2e-pmat-03-${Date.now()}`;
        const fileUrl = `https://example.com/e2e-${Date.now()}.pdf`;

        await startMaterialPublish(page);
        await page.locator('#urlInput').fill(fileUrl);
        await page.getByRole('button', {name: 'Add'}).click();
        await expect(page.getByText(fileUrl)).toBeVisible();

        await nextStep(page);
        await fillTitleStep(page, title);
        await fillMetaStep(page);

        // On Review, flip "Save as a draft"
        await setDraft(page, true);
        await completeStepper(page, 'publish')
        await expect(page.getByText('Your publication has been saved as a draft - only you can see it')).toBeVisible();

        // view page: draft badge present
        await page.getByRole('button', {name: 'View publication'}).click();
        await expect(page.getByText('Draft', {exact: true})).toBeVisible();

        // excluded from /browse
        await expectAbsentFromBrowse(page, 'materials', title);

        // present in the author's "Draft Publications" tab
        await page.goto(`/${author.username}`);
        await expectCardInTab(page, 'Draft Publications', title);
    });
});