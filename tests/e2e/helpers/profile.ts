import { expect, type Page } from '@playwright/test';

// Click a profile tab (scoped to the owner tab strip) and assert a publication
// card is listed under it.
export async function expectCardInTab(page: Page, tabName: string, title: string) {
    const tabs = page.getByTestId('tab-group');
    const card = page.getByRole('link', { name: title });
    await expect(async () => {
        await tabs.getByText(tabName).click();
        await expect(card).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 20_000 });
}