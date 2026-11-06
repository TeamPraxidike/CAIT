import { expect, type Locator, type Page } from '@playwright/test';

// Browse search RANKS rather than filters (Fuse fuzzy),
// and cards render client-side, so we retry fill+Enter until the card shows
export async function findOnBrowse(
    page: Page,
    type: 'materials' | 'circuits',
    title: string,
): Promise<Locator> {
    await page.goto(`/browse?type=${type}`);
    const search = page.getByPlaceholder(`Browse ${type}`);
    const card = page.getByRole('link', { name: title });
    await expect(async () => {
        await search.fill(title);
        await search.press('Enter');
        await expect(card).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 20_000 });
    return card;
}

// Inverse of findOnBrowse: search /browse for a title and assert no card matches
// for drafts/deleted items that must not surface publicly.
export async function expectAbsentFromBrowse(
    page: Page,
    type: 'materials' | 'circuits',
    title: string,
): Promise<void> {
    await page.goto(`/browse?type=${type}`);
    const search = page.getByPlaceholder(`Browse ${type}`);
    await search.fill(title);
    await search.press('Enter');
    await expect(page.getByRole('link', { name: title })).toHaveCount(0);
}