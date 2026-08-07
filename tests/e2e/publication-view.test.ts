import { test, expect, type Page } from '@playwright/test';

// Publication pages are login-walled (the [user] layout guard), so every view
// test runs as the visitor persona. Anonymous access redirects to /signin and
// is covered by the layout guard / AUTH-08, not here.
test.use({ storageState: 'tests/e2e/storage/visitor.json' });

const SEED_MATERIAL = '[SEED] Gradient Descent by Hand';
const SEED_CIRCUIT = '[SEED] From Optimisation to Transformers';
const CIRCUIT_MEMBERS = [
    '[SEED] Gradient Descent by Hand',
    '[SEED] Decision Trees and Information Gain',
    '[SEED] Attention and the Transformer Block',
];

// Open a seed publication by clicking its card in /browse
// A visible card is a hydration barrier
// the pub page's <h2> title confirms arrival.
async function openSeed(page: Page, title: string, type: 'materials' | 'circuits') {
    await page.goto(`/browse?type=${type}`);
    const card = page.getByRole('link', { name: title });
    await expect(card).toBeVisible();
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