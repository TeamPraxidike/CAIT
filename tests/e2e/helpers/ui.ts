import { expect, type Page } from '@playwright/test';

export async function answerEmailVisibilityPrompt(page: Page) {
    const prompt = page.getByRole('dialog', { name: 'Display your email address?' });
    await expect(prompt).toBeVisible();
    await expect(async () => {
        if (await prompt.isVisible()) {
            await prompt.getByRole('button', { name: 'Save' }).click();
        }
        await expect(prompt).toBeHidden({ timeout: 5_000 });
    }).toPass({ timeout: 30_000 });
}