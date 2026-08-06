import { test as setup, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const STORAGE_DIR = 'tests/e2e/storage'

type Persona = {
    email: string,
    password: string,
    username: string
}

async function registerPersona(page: Page, name: 'author' | 'visitor'): Promise<Persona> {
    const email = `${name}-${Date.now()}@example.org`;
    const password = `e2e-${name}-password`;

    await page.goto('/register');
    await page.getByLabel('First Name').fill('E2E');
    await page.getByLabel('Last Name').fill(name);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    // autoconfirm is on: registration creates a live session and redirects to '/'
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: 'Publish' })).toBeVisible();

    // answer the first-login email-visibility prompt now, or it will sit on top
    // of every page and intercept clicks in all logged-in tests
    const prompt = page.getByRole('dialog', { name: 'Display your email address?' });
    await expect(prompt).toBeVisible();
    // Click Save, and if the dialog
    // is still up after 5s, click it again like a user would.
    await expect(async () => {
        if (await prompt.isVisible()) {
            await prompt.getByRole('button', { name: 'Save' }).click();
        }
        await expect(prompt).toBeHidden({ timeout: 5_000 });
    }).toPass({ timeout: 30_000 });

    // the user menu markup is attached (hidden) in the header popup - read the
    // generated username from its profile link without hover choreography
    const href = await page.locator('[data-popup="popupHover"] a[href^="/"]').first().getAttribute('href');
    const username = decodeURIComponent((href ?? '').replace(/^\//, '').split('/')[0]);
    expect(username).not.toBe('');

    await page.context().storageState({ path: path.join(STORAGE_DIR, `${name}.json`) });
    return { email, password, username };
}

setup('register author and visitor personas', async ({ browser }) => {
    setup.setTimeout(60_000);
    fs.mkdirSync(STORAGE_DIR, { recursive: true });

    const personas: Record<string, Persona> = {};
    for (const name of ['author', 'visitor'] as const) {
        // separate context per persona
        const context = await browser.newContext();
        personas[name] = await registerPersona(await context.newPage(), name);
        await context.close();
    }

    fs.writeFileSync(path.join(STORAGE_DIR, 'personas.json'), JSON.stringify(personas, null, '\t'));
});