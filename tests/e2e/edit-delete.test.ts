import { test, expect, type Page } from '@playwright/test';
import { createMaterial } from './helpers/api';
import {ANON_STATE, AUTHOR_STATE, type Persona, readPersonas, VISITOR_STATE, withContext} from "./helpers/personas";
import { nextStep, setTitle, setDescription, draftToggle, setDraft, completeStepper } from './helpers/stepper';
import { expectCardInTab } from './helpers/profile';

// The edit stepper renders inside an `{#await files}` block that only resolves onMount
async function openEditStepper(page: Page, editUrl: string) {
    await page.goto(editUrl);
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible({ timeout: 20_000 });
}

async function editTitleAndDescription(page: Page, editUrl: string) {
    const newTitle = `edited-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newDescription = `Edited description ${Date.now()}`;

    await openEditStepper(page, editUrl);

    await nextStep(page);                       // files -> title
    await setTitle(page, newTitle);
    await nextStep(page);                       // title -> meta
    await setDescription(page, newDescription);
    await nextStep(page);                       // meta -> review
    await completeStepper(page, 'update');

    return { newTitle, newDescription };
}

async function promoteDraftViaEdit(page: Page, editUrl: string) {
    await openEditStepper(page, editUrl);

    await nextStep(page); // files -> title
    await expect(page.getByPlaceholder('Title')).toBeVisible();
    await nextStep(page); // title -> meta
    await expect(page.getByPlaceholder('Additional Description...')).toBeVisible();
    await nextStep(page); // meta -> review

    await expect(draftToggle(page)).toBeChecked();
    await setDraft(page, false);
    await completeStepper(page, 'update');
}

async function deleteViaModal(page: Page, pubUrl: string, id: number) {
    await page.goto(pubUrl);
    await expect(async () => {
        await page.getByTestId('delete-publication').click();
        await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 15_000 });

    const deleted = page.waitForResponse(
        (r) => r.url().includes(`/api/material/${id}`) && r.request().method() === 'DELETE',
    );
    await page.getByRole('button', { name: 'Confirm' }).click();
    expect((await deleted).status()).toBe(200);
    await expect(page).toHaveURL('/browse');
}

test.describe('EDIT - owner edits and deletes own content', () => {
    test.use({storageState: AUTHOR_STATE});

    let author: Persona;

    test.beforeAll(async () => {
        const personas = readPersonas();
        author = personas.author;
    })

    test('EDIT-01: author edits title and description via the edit stepper', async ({ page }) => {
        const { id } = await createMaterial(page, author.username, { title: `e2e-edit-01-${Date.now()}` });
        const pubUrl = `/${author.username}/${id}`;
        const { newTitle, newDescription } = await editTitleAndDescription(page, `${pubUrl}/edit/material`);
        await page.goto(pubUrl);
        await expect(page.getByRole('heading', { name: newTitle })).toBeVisible();
        await expect(page.getByText(newDescription)).toBeVisible();
    });

    test('EDIT-02: author deletes own publication', async ({ page }) => {
        const { id, title } = await createMaterial(page, author.username, { title: `e2e-edit-02-${Date.now()}` });
        const pubUrl = `/${author.username}/${id}`;
        await deleteViaModal(page, pubUrl, id);
        await expect(page.getByRole('link', { name: title })).toHaveCount(0);
        const resp = await page.goto(pubUrl);
        expect(resp?.status()).toBeGreaterThanOrEqual(400);
        await expect(page.getByRole('heading', { name: title })).toHaveCount(0);
    });

    test('EDIT-03: cancelling the delete modal leaves the publication intact', async ({ page }) => {
        const { id, title } = await createMaterial(page, author.username, { title: `e2e-edit-03-${Date.now()}` });
        const pubUrl = `/${author.username}/${id}`;
        await page.goto(pubUrl);

        const modalBody = page.getByText('Are you sure you want to delete this publication?');
        await expect(async () => {
            await page.getByTestId('delete-publication').click();
            await expect(modalBody).toBeVisible({ timeout: 2_000 });
        }).toPass({ timeout: 15_000 });

        await page.locator('.modal').getByRole('button', { name: 'Cancel' }).click();
        await expect(modalBody).toBeHidden();

        await expect(page).toHaveURL(pubUrl); // no redirect to /browse
        await page.reload();
        await expect(page.getByRole('heading', { name: title })).toBeVisible();
    });
});

test.describe('EDIT - access control as non-owner vs maintainer (visitor)', () => {
    test.use({storageState: VISITOR_STATE});

    let foreignUrl: string; let foreignId: number;
    let maintainedEditUrl: string;
    let maintainedDeleteUrl: string; let maintainedDeleteId: number;

    test.beforeAll(async ({ browser }) => {
        const { author, visitor } = readPersonas();

        await withContext(browser, AUTHOR_STATE, async (page) => {
            const who = await page.request.get(`/api/user/username/${visitor.username}`);
            const visitorId = (await who.json()).user.id;

            const foreign = await createMaterial(page, author.username, { title: `e2e-edit-07-${Date.now()}` });
            foreignId = foreign.id;
            foreignUrl = `/${author.username}/${foreign.id}`;

            const mEdit = await createMaterial(page, author.username, { title: `e2e-edit-09-${Date.now()}`, maintainers: [visitorId] });
            maintainedEditUrl = `/${author.username}/${mEdit.id}`;

            const mDel = await createMaterial(page, author.username, { title: `e2e-edit-13-${Date.now()}`, maintainers: [visitorId] });
            maintainedDeleteId = mDel.id;
            maintainedDeleteUrl = `/${author.username}/${mDel.id}`;
        });
    });

    test('EDIT-07: non-owner is blocked from the edit page and the mutation endpoints', async ({ page }) => {
        await page.goto(`${foreignUrl}/edit/material`);
        await expect(page).toHaveURL(foreignUrl);
        await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(0);
        expect((await page.request.delete(`/api/material/${foreignId}`)).status()).toBe(401);
        const put = await page.request.put(`/api/material/${foreignId}`, {
            data: { userId: '00000000-0000-0000-0000-000000000000', metaData: { tags: [], maintainers: [] } },
        });
        expect(put.status()).toBe(401);
    });

    test('EDIT-09: maintainer can edit title and description (EDIT allow-path, end-to-end)', async ({ page }) => {
        const { newTitle, newDescription } = await editTitleAndDescription(page, `${maintainedEditUrl}/edit/material`);
        await page.goto(maintainedEditUrl);
        await expect(page.getByRole('heading', { name: newTitle })).toBeVisible();
        await expect(page.getByText(newDescription)).toBeVisible();
    });

    test('EDIT-13: maintainer can delete (REMOVE allow-path)', async ({ page }) => {
        await deleteViaModal(page, maintainedDeleteUrl, maintainedDeleteId);
        const resp = await page.goto(maintainedDeleteUrl);
        expect(resp?.status()).toBeGreaterThanOrEqual(400);
    });
});

test.describe('EDIT - anonymous user is walled out', () => {
    test.use({ storageState: ANON_STATE });

    let pubUrl: string;
    let pubId: number;

    test.beforeAll(async ({ browser }) => {
        const { author } = readPersonas();

        await withContext(browser, AUTHOR_STATE, async (page) => {
            const { id } = await createMaterial(page, author.username, { title: `e2e-edit-12-${Date.now()}` });
            pubId = id;
            pubUrl = `/${author.username}/${id}`;
        });
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

test.describe('EDIT - author promotes a draft', () => {
    test.use({storageState: AUTHOR_STATE});

    let author: Persona;
    test.beforeAll(() => {
        author = readPersonas().author;
    });

    test('EDIT-04: editing a draft and completing publishes it', async ({page}) => {
        const {id, title} = await createMaterial(page, author.username, {
            title: `e2e-edit-04-${Date.now()}`,
            isDraft: true,
        });
        const pubUrl = `/${author.username}/${id}`;

        // precondition: it starts as a draft
        await page.goto(pubUrl);
        await expect(page.getByText('Draft', {exact: true})).toBeVisible();

        // promote it through the edit stepper
        await promoteDraftViaEdit(page, `${pubUrl}/edit/material`);

        // published now: no draft badge on the view page
        await page.goto(pubUrl);
        await expect(page.getByText('Draft', {exact: true})).toHaveCount(0);

        // profile: moved into Your Publications, gone from Draft Publications
        await page.goto(`/${author.username}`);
        await expectCardInTab(page, 'Your Publications', title);
        await page.getByTestId('tab-group').getByText('Draft Publications').click();
        await expect(page.getByRole('link', {name: title})).toHaveCount(0);
    });
});