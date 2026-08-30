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

// Opens a DropdownSelect (left rail on /browse) by its title and clicks an option.
// Call only after a hydration barrier (e.g. a seed card is visible) - the
// dropdown is a client-side toggle.
export async function selectDropdownOption(page: Page, dropdown: string, option: string) {
    await page.getByRole('button', { name: dropdown, exact: true }).click();
    await page.getByRole('listbox').getByRole('button', { name: option, exact: true }).click();
}

export async function registerFreshAccount(page: Page) {
    const email = `e2e-auth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.org`;
    const password = 'e2e-auth-password';

    await page.goto('/register');
    await page.getByLabel('First Name').fill('E2E');
    await page.getByLabel('Last Name').fill('Auth');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    // autoconfirm stack: signUp mints a live session, action redirects to '/'
    await expect(page).toHaveURL('/', { timeout: 30_000 });

    await answerEmailVisibilityPrompt(page);

    return { email, password };
}

// Signs out via the header avatar menu. The popup is click-triggered (named
// popupHover) and staging hydrates slowly, so the first click can hit an
// un-hydrated listener - retry opening until the menu shows, then click Log out.
export async function logoutViaHeader(page: Page) {
    // UserMenu wraps signOut in confirm() on some URLs - accept it if it appears
    page.on('dialog', (dialog) => dialog.accept());

    const logout = page
        .locator('[data-popup="popupHover"]')
        .getByRole('button', { name: 'Log out' });
    await expect(async () => {
        if (!(await logout.isVisible())) {
            await page.getByTestId('profile-picture').click();
        }
        await expect(logout).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 15_000 });
    await logout.click();
}