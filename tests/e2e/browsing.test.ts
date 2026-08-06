import { test, expect, type Page } from '@playwright/test';
import { selectDropdownOption } from './helpers/ui';

// TODO: link with seedTestData.ts
// Browsing is anonymous: no storageState, fresh context per test.
// All read-only assertions run against [SEED] fixtures.

const SEED_MATERIALS = [
    '[SEED] Gradient Descent by Hand',
    '[SEED] Decision Trees and Information Gain',
    '[SEED] Attention and the Transformer Block',
];
const SEED_CIRCUITS = [
    '[SEED] From Optimisation to Transformers',
    '[SEED] Deep Learning Shortcut',
];
const SEED_COURSES = [
    '[SEED] Foundations of Machine Learning',
    '[SEED] Deep Learning for Sequences',
];

// Cards render exclusively client-side (onMount + streamed promises), so a
// visible seed card is also a HYDRATION BARRIER: once it shows, client JS has
// run and subsequent clicks can't fall into the hydration gap
async function openBrowseMaterials(page: Page) {
    await page.goto('/browse');
    await expect(page.getByRole('link', { name: SEED_MATERIALS[0] })).toBeVisible();
}

test('BRW-01: /browse lists all seed materials', async ({ page }) => {
    await openBrowseMaterials(page);
    await expect(page.getByLabel('Select Amount')).toBeVisible();
    for (const title of SEED_MATERIALS) {
        await expect(page.getByRole('link', { name: title })).toBeVisible();
    }
});

test('BRW-02: switching Type to circuits shows seed circuits', async ({ page }) => {
    await openBrowseMaterials(page);
    await selectDropdownOption(page, 'Type', 'circuits');
    await expect(page).toHaveURL(/\?type=circuits/);
    for (const title of SEED_CIRCUITS) {
        await expect(page.getByRole('link', { name: title })).toBeVisible();
    }
});

test('BRW-03: switching Type to people shows Seed Author with a post count', async ({ page }) => {
    await openBrowseMaterials(page);
    await selectDropdownOption(page, 'Type', 'people');
    await expect(page).toHaveURL(/\?type=people/);
    await expect(page.getByText('S. Author')).toBeVisible();
    await expect(page.getByText(/Posts: \d+/).first()).toBeVisible();
    await expect(page.getByLabel('Select Amount')).toBeHidden();
});

test('BRW-04: switching Type to courses shows seed courses', async ({ page }) => {
    await openBrowseMaterials(page);
    await selectDropdownOption(page, 'Type', 'courses');
    await expect(page).toHaveURL(/\?type=courses/);
    for (const title of SEED_COURSES) {
        await expect(page.getByText(title)).toBeVisible();
    }
    await expect(page.getByLabel('Select Amount')).toBeVisible();
});

test('BRW-05: keyword search narrows materials to the match', async ({ page }) => {
    await openBrowseMaterials(page);
    // semantic search must be OFF by default - keyword search depends on it
    await expect(page.getByRole('switch')).not.toBeChecked();
    const search = page.getByPlaceholder('Browse materials');
    const searchBtn = page.getByRole('button', {
        name: 'Search publications with the selected query',
    });

    // Fuse fuzzy search (threshold 0.6) keeps/ranks rather than strictly
    // filtering, so assert the match is RETAINED, not that others vanish
    await search.fill('Gradient');
    await searchBtn.click();
    await expect(page.getByRole('link', { name: SEED_MATERIALS[0] })).toBeVisible();

    // a nonsense query matches nothing -> empty grid (proves search executes)
    await search.fill('praxidike');
    await searchBtn.click();
    await expect(page.getByTestId('publication-card-profile-img')).toHaveCount(0);
});

test('BRW-06: tag filter narrows materials to the tagged one', async ({ page }) => {
    await openBrowseMaterials(page);
    await selectDropdownOption(page, 'Tags', 'transformers');
    // the left-rail Search button is disabled until a filter changes -
    // selecting the tag above is what enables it
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByRole('link', { name: SEED_MATERIALS[2] })).toBeVisible();
    await expect(page.getByTestId('publication-card-profile-img')).toHaveCount(1);
});

test.describe('as visitor persona', () => {
    test.use({ storageState: 'tests/e2e/storage/visitor.json' });

    test('BRW-12: clicking a material card opens its publication page', async ({ page }) => {
        await openBrowseMaterials(page);
        const card = page.getByRole('link', { name: SEED_MATERIALS[0] });
        // card href is authored ../{username}/{id} - resolve to absolute and
        // demand the click lands exactly there
        const href = await card.getAttribute('href');
        const target = new URL(href!, page.url()).pathname;
        await card.click();
        await expect(page).toHaveURL(target);
    });
});

test('BRW-13: deep link ?type=circuits renders circuits directly', async ({ page }) => {
    await page.goto('/browse?type=circuits');
    for (const title of SEED_CIRCUITS) {
        await expect(page.getByRole('link', { name: title })).toBeVisible();
    }
    await expect(page.getByRole('link', { name: SEED_MATERIALS[0] })).toBeHidden();
});