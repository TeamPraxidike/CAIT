import { test, expect } from '@playwright/test';
import { AUTHOR_STATE, VISITOR_STATE, type Persona, readPersonas } from './helpers/personas';
import { createMaterial } from './helpers/api';
import { expectCardInTab } from './helpers/profile';

test.describe('PROF - author views own profile', () => {
    test.use({ storageState: AUTHOR_STATE });

    let author: Persona;
    test.beforeAll(() => { author = readPersonas().author; });

    test('PROF-01: own profile shows three tabs; publications and drafts land in the right ones', async ({ page }) => {
        const pub = await createMaterial(page, author.username, { title: `e2e-prof-01-pub-${Date.now()}` });
        const draft = await createMaterial(page, author.username, { title: `e2e-prof-01-draft-${Date.now()}`, isDraft: true });

        await page.goto(`/${author.username}`);

        // owner sees all three tabs
        const tabs = page.getByTestId('tab-group');
        await expect(tabs).toBeVisible();
        await expect(tabs.getByText('Saved Publications')).toBeVisible();
        await expect(tabs.getByText('Your Publications')).toBeVisible();
        await expect(tabs.getByText('Draft Publications')).toBeVisible();

        // Your Publications: the published material shows, the draft does not
        await expectCardInTab(page, 'Your Publications', pub.title);
        await expect(page.getByRole('link', { name: draft.title })).toHaveCount(0);

        // Draft Publications: the draft shows here
        await expectCardInTab(page, 'Draft Publications', draft.title);
    });
});

test.describe('PROF - visitor views another user profile', () => {
    test.use({ storageState: VISITOR_STATE });

    let author: Persona;
    let pubTitle: string;
    let draftTitle: string;

    test.beforeAll(async ({ browser }) => {
        author = readPersonas().author;
        // seed the author's content from an author context (visitor can't create it)
        const ctx = await browser.newContext({ storageState: AUTHOR_STATE });
        const p = await ctx.newPage();
        pubTitle = (await createMaterial(p, author.username, { title: `e2e-prof-02-pub-${Date.now()}` })).title;
        draftTitle = (await createMaterial(p, author.username, { title: `e2e-prof-02-draft-${Date.now()}`, isDraft: true })).title;
        await ctx.close();
    });

    test('PROF-02: visitor sees only the author\'s published items - no tabs, no drafts', async ({ page }) => {
        await page.goto(`/${author.username}`);

        // no owner tab strip for a non-owner
        await expect(page.getByTestId('tab-group')).toHaveCount(0);

        // the author's published material is shown
        await expect(page.getByRole('link', { name: pubTitle })).toBeVisible();

        // the author's draft is never exposed to a visitor
        await expect(page.getByRole('link', { name: draftTitle })).toHaveCount(0);
    });
});