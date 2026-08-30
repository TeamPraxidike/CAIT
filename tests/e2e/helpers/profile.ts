import { expect, type Page } from '@playwright/test';

export async function openTab(page: Page, tabName: string) {
    const tab = page.getByRole('tab', { name: tabName });
    await expect(async () => {
        if ((await tab.getAttribute('aria-selected')) !== 'true') await tab.click();
        await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 2_000 });
    }).toPass({ timeout: 15_000 });
}

// Click a profile tab and assert a publication
// card is listed under it.
export async function expectCardInTab(page: Page, tabName: string, title: string) {
    await openTab(page, tabName);
    await expect(page.getByRole('link', { name: title })).toBeVisible();
}