import { expect, type Page } from '@playwright/test';

// Atomic interactions with the shared material publish/edit stepper
// (PublishWorkflow -> PublishStepper).

export const nextStep = (page: Page) =>
    page.getByRole('button', { name: 'Next' }).click();

export async function setTitle(page: Page, title: string) {
    const input = page.getByPlaceholder('Title');
    await expect(input).toBeVisible();
    await input.fill(title);
}

export async function setDescription(page: Page, description: string) {
    const input = page.getByPlaceholder('Additional Description...');
    await expect(input).toBeVisible();
    await input.fill(description);
}

export const pickMaterialType = (page: Page, label = 'Lecture Notes') =>
    page.getByRole('button', { name: label }).click();

export async function addLearningObjective(page: Page, text: string) {
    await page.locator('#learningObjective').fill(text);
    await page.locator('button[name="add_LO"]').click();
}

export const setSelfMade = (page: Page, madeIt = true) =>
    page.getByRole('button', {
        name: madeIt ? 'Yes, I made it' : 'No, someone else made it',
    }).click();

export async function addTag(page: Page, tag: string) {
    const field = page.locator('.input-chip-field');
    await field.fill(tag);
    await field.press('Enter');
    await expect(page.locator('.input-chip-list')).toContainText(tag);
}

// Review-step "Save as a draft" toggle
export const draftToggle = (page: Page) =>
    page.locator('input[type="checkbox"].toggle');

export async function setDraft(page: Page, on: boolean) {
    const t = draftToggle(page);
    if (on) await t.check(); else await t.uncheck();
}

// Click Complete and wait for the success screen. The stepper may still be
// flushing a TUS upload, so retry the click until the message shows.
// mode selects the headline copy: 'publish' (fresh) vs 'update' (edit).
export async function completeStepper(page: Page, mode: 'publish' | 'update') {
    const message = mode === 'publish'
        ? 'Publication uploaded successfully'
        : 'Publication updated successfully';
    const success = page.getByText(message);
    const button = page.getByRole('button', { name: 'Complete' });
    await expect(async () => {
        if (!(await success.isVisible())) await button.click();
        await expect(success).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 45_000 });
}