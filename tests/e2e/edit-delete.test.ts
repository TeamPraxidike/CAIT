import { test, expect, type Page } from '@playwright/test';
import fs from 'fs';
import { createMaterial } from './helpers/api';

const AUTHOR_STATE = 'tests/e2e/storage/author.json';
const VISITOR_STATE = 'tests/e2e/storage/visitor.json';
const { author } = JSON.parse(fs.readFileSync('tests/e2e/storage/personas.json', 'utf-8'));

// The edit stepper renders inside an `{#await files}` block that only resolves onMount
async function openEditStepper(page: Page, editUrl: string) {
    await page.goto(editUrl);
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible({ timeout: 20_000 });
}

test.describe('EDIT - owner edits and deletes own content', () => {
    test.use({storageState: AUTHOR_STATE});

    test('EDIT-01: author edits title and description via the edit stepper', async ({page}) => {
        const original = await createMaterial(page, author.username, {title: `e2e-edit-01-${Date.now()}`});
        const pubUrl = `/${author.username}/${original.id}`;
        const newTitle = `${original.title}-edited`;
        const newDescription = `Edited description ${Date.now()}`;

        await openEditStepper(page, `${pubUrl}/edit/material`);

        // step 2 title
        await page.getByRole('button', {name: 'Next'}).click();
        const titleInput = page.getByPlaceholder('Title');
        await expect(titleInput).toBeVisible();
        await titleInput.fill(newTitle);

        // step 3 meta info
        await page.getByRole('button', {name: 'Next'}).click();
        const descInput = page.getByPlaceholder('Additional Description...');
        await expect(descInput).toBeVisible();
        await descInput.fill(newDescription);

        // step 4 review
        await page.getByRole('button', {name: 'Next'}).click();
        const complete = page.getByRole('button', {name: 'Complete'});
        await expect(complete).toBeVisible();

        // Submit and wait for the success screen
        await complete.click();
        await expect(page.getByText('Publication updated successfully')).toBeVisible({timeout: 15_000});

        // Persisted on the publication page
        await page.goto(pubUrl);
        await expect(page.getByRole('heading', {name: newTitle})).toBeVisible();
        await expect(page.getByText(newDescription)).toBeVisible();
    });

    test('EDIT-02: author deletes own publication', async ({ page }) => {
        const { id, title } = await createMaterial(page, author.username, { title: `e2e-edit-02-${Date.now()}` });
        const pubUrl = `/${author.username}/${id}`;
        await page.goto(pubUrl);

        // Hydration-safe: retry opening the confirm modal until it appears.
        await expect(async () => {
            await page.getByTestId('delete-publication').click();
            await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible({ timeout: 2_000 });
        }).toPass({ timeout: 15_000 });

        const deleted = page.waitForResponse(
            (r) => r.url().includes(`/api/material/${id}`) && r.request().method() === 'DELETE',
        );
        await page.getByRole('button', { name: 'Confirm' }).click();
        expect((await deleted).status()).toBe(200);

        // Redirected to browse, the card is gone
        await expect(page).toHaveURL('/browse');
        await expect(page.getByRole('link', { name: title })).toHaveCount(0);

        // The direct URL now errors
        const resp = await page.goto(pubUrl);
        expect(resp?.status()).toBeGreaterThanOrEqual(400);
        await expect(page.getByRole('heading', { name: title })).toHaveCount(0);
    });
});

test.describe('EDIT-07 - non-owner is kept out', () => {
    test.use({ storageState: VISITOR_STATE });

    let pubUrl: string;
    let pubId: number;

    test.beforeAll(async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: AUTHOR_STATE });
        const page = await ctx.newPage();
        const { id } = await createMaterial(page, author.username, { title: `e2e-edit-07-${Date.now()}` });
        pubId = id;
        pubUrl = `/${author.username}/${id}`;
        await ctx.close();
    });

    test('EDIT-07: visitor cannot open the edit page and cannot mutate via the API', async ({ page }) => {
        // Page-level guard: the edit URL redirects a non-owner back to the view page
        await page.goto(`${pubUrl}/edit/material`);
        await expect(page).toHaveURL(pubUrl);
        await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(0);

        // Endpoint guard: DELETE without ownership -> 401
        const del = await page.request.delete(`/api/material/${pubId}`);
        expect(del.status()).toBe(401);

        // Endpoint guard: PUT with a foreign userId is rejected by verifyAuth
        const put = await page.request.put(`/api/material/${pubId}`, {
            data: { userId: '00000000-0000-0000-0000-000000000000', metaData: { tags: [], maintainers: [] } },
        });
        expect(put.status()).toBe(401);
    });
});

test.describe('EDIT-12 - anonymous user is walled out', () => {
    test.use({ storageState: { cookies: [], origins: [] } }); // no session

    let pubUrl: string;
    let pubId: number;

    test.beforeAll(async ({ browser }) => {
        const ctx = await browser.newContext({ storageState: AUTHOR_STATE });
        const page = await ctx.newPage();
        const { id } = await createMaterial(page, author.username, { title: `e2e-edit-12-${Date.now()}` });
        pubId = id;
        pubUrl = `/${author.username}/${id}`;
        await ctx.close();
    });

    test('EDIT-12: anonymous user is redirected to sign-in and endpoints reject them', async ({ page }) => {
        // Login wall (parent layout) bounces anon before the edit guard even runs
        await page.goto(`${pubUrl}/edit/material`);
        await expect(page).toHaveURL('/signin');

        // Endpoints reject the null session -> 401
        expect((await page.request.delete(`/api/material/${pubId}`)).status()).toBe(401);
        const put = await page.request.put(`/api/material/${pubId}`, {
            data: { userId: '00000000-0000-0000-0000-000000000000', metaData: { tags: [], maintainers: [] } },
        });
        expect(put.status()).toBe(401);
    });
});