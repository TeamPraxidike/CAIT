import { test, expect, type Page } from '@playwright/test';
import { registerFreshAccount, logoutViaHeader } from './helpers/ui';
import { createMaterial } from './helpers/api';
import {ANON_STATE, AUTHOR_STATE, readPersonas, VISITOR_STATE, withContext} from "./helpers/personas";
import { SEED_MATERIAL, SEED_CIRCUIT, CIRCUIT_MEMBERS } from './helpers/seed';

// Publication pages are login-walled (the [user] layout guard), so every view
// test runs as the visitor persona. Anonymous access redirects to /signin and
// is covered by the layout guard / AUTH-08, not here.
test.use({ storageState: VISITOR_STATE });

// Open a seed publication by clicking its card in /browse
// A visible card is a hydration barrier
// the pub page's <h2> title confirms arrival.
async function openSeed(page: Page, title: string, type: 'materials' | 'circuits') {
    await page.goto(`/browse?type=${type}`);
    const search = page.getByPlaceholder(`Browse ${type}`);
    const card = page.getByRole('link', { name: title });
    await expect(async () => {
        await search.fill(title);
        await search.press('Enter');
        await expect(card).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 20_000 });
    await card.click();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
}

test('PUB-01: material page shows its metadata', async ({ page }) => {
    await openSeed(page, SEED_MATERIAL, 'materials');
    await expect(page.getByText(/A worked walkthrough of batch, stochastic/)).toBeVisible();
    await expect(page.getByText('Explain how gradient descent minimises a loss function.')).toBeVisible();
    await expect(page.getByText('Basic calculus')).toBeVisible();
    await expect(page.getByText('optimization', { exact: true })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Cover' })).toBeVisible();
});

test('PUB-02: circuit page renders its member nodes', async ({ page }) => {
    await openSeed(page, SEED_CIRCUIT, 'circuits');
    // Materials tab (default) renders the SvelteFlow graph; nodes carry the
    // member titles as text
    for (const member of CIRCUIT_MEMBERS) {
        await expect(page.getByText(member).first()).toBeVisible();
    }
});

test('PUB-03: discussion / related / activity tabs render', async ({ page }) => {
    await openSeed(page, SEED_MATERIAL, 'materials');

    // hydration barrier: the Materials tab streams its files client-side, so
    // this text only appears once the page has hydrated
    await expect(page.getByText('This publication has no files')).toBeVisible();

    await page.getByRole('tab', { name: 'Discussion' }).click();
    await expect(page.getByPlaceholder('Start a discussion...')).toBeVisible();

    await page.getByRole('tab', { name: 'Related' }).click(); // streamed; must not crash

    await page.getByRole('tab', { name: 'Activity Log' }).click();
    await expect(page.getByText('No activity recorded yet.')).toBeVisible();
});

test('PUB-04: clicking a tag chip filters browse by that tag', async ({ page }) => {
    await openSeed(page, SEED_MATERIAL, 'materials');

    // hydration barrier: the Materials tab streams its files client-side, so
    // this text only appears once the page has hydrated
    await expect(page.getByText('This publication has no files')).toBeVisible();

    await page.getByText('optimization', { exact: true }).click();
    await expect(page).toHaveURL(/\/browse\?type=materials&tags=optimization/);
    await expect(page.getByRole('link', { name: SEED_MATERIAL })).toBeVisible();
});

test('PUB-09: visitor sees no owner controls', async ({ page }) => {
    await openSeed(page, SEED_MATERIAL, 'materials');
    await expect(page.getByTestId('edit-publication')).toBeHidden();
    await expect(page.getByTestId('delete-publication')).toBeHidden();
});

test.describe('owner controls', () => {
    test.use({ storageState: AUTHOR_STATE });

    test('PUB-10: author sees edit + delete on own material; visitor does not', async ({ page, browser }) => {
        const { author } = readPersonas();
        const { id, title } = await createMaterial(page, author.username);
        const url = `/${author.username}/${id}`;

        // author (owner) sees the controls
        await page.goto(url);
        await expect(page.getByRole('heading', { name: title })).toBeVisible();
        await expect(page.getByTestId('edit-publication')).toBeVisible();
        await expect(page.getByTestId('delete-publication')).toBeVisible();

        // visitor (non-owner) sees neither
        await withContext(browser, VISITOR_STATE, async (vPage) => {
            await vPage.goto(url);
            await expect(vPage.getByRole('heading', { name: title })).toBeVisible();
            await expect(vPage.getByTestId('edit-publication')).toBeHidden();
            await expect(vPage.getByTestId('delete-publication')).toBeHidden();
        });
    });
});

test.describe('anonymous', () => {
    test.use({ storageState: ANON_STATE });

    test('PUB-13: anonymous user cannot open a publication', async ({ page }) => {
        // browse is public; the card href is in the anonymous HTML - read it
        // without a session, then try to open it directly
        await page.goto('/browse');
        const search = page.getByPlaceholder('Browse materials');
        const card = page.getByRole('link', { name: SEED_MATERIAL });
        await expect(async () => {
            await search.fill(SEED_MATERIAL);
            await search.press('Enter');
            await expect(card).toBeVisible({ timeout: 3_000 });
        }).toPass({ timeout: 20_000 });
        const href = await card.getAttribute('href');
        const target = new URL(href!, page.url()).pathname;

        await page.goto(target);
        await expect(page).toHaveURL(/\/signin/);
    });
});

test.describe('fresh disposable account', () => {
    test.use({ storageState: ANON_STATE });

    test('PUB-14: logging out while viewing a publication redirects to /signin', async ({ page }) => {
        // disposable account: signOut revokes refresh tokens, so never the shared
        // visitor persona. Any logged-in user can view a seed publication.
        await registerFreshAccount(page);
        await openSeed(page, SEED_MATERIAL, 'materials');

        // the publication page is session-heavy (reads session.user.id); this pins
        // that it survives the session vanishing - the [user] guard reruns via
        // depends('supabase:auth') and bounces to /signin without crashing
        await logoutViaHeader(page);
        await expect(page).toHaveURL(/\/signin/);
        await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
    });
});

