import { test, expect, type Page } from '@playwright/test';
import { answerEmailVisibilityPrompt } from './helpers/ui'
import fs from 'node:fs';

// Auth flows start anonymous by default; tests that need a session either use
// the visitor persona's storageState (see describe below) or mint their own
// disposable account. NO module-level state is shared between tests: Playwright
// replaces the worker process after any failure, which re-imports this file and
// resets module variables - anything shared must live on disk (personas.json).
test.use({ storageState: { cookies: [], origins: [] } });

const VISITOR_STORAGE = 'tests/e2e/storage/visitor.json';

function readPersonas() {
    return JSON.parse(fs.readFileSync('tests/e2e/storage/personas.json', 'utf-8'));
}

async function registerFreshAccount(page: Page) {
    const email = `e2e-auth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.org`;
    const password = 'e2e-auth-password';

    await page.goto('/register');
    await page.getByLabel('First Name').fill('E2E');
    await page.getByLabel('Last Name').fill('Auth');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();

    // autoconfirm stack: signUp mints a live session, action redirects to '/'
    await expect(page).toHaveURL('/');

    await answerEmailVisibilityPrompt(page);

    return { email, password };
}

async function login(page: Page, creds: { email: string; password: string }) {
    await page.goto('/signin');
    const emailField = page.getByLabel('Email');
    await expect(async () => {
        if (!(await emailField.isVisible())) {
            await page.getByRole('button', { name: 'Email & Password' }).click();
        }
        await expect(emailField).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 15_000 });
    await page.getByLabel('Email').fill(creds.email);
    await page.getByLabel('Password').fill(creds.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL('/browse');
}

test('AUTH-01: register a new user lands them on / logged in', async ({ page }) => {
    await registerFreshAccount(page);
    await expect(page.getByRole('link', { name: 'Publish' })).toBeVisible();
    await expect(page.getByTestId('profile-picture')).toBeVisible();
});

test('AUTH-02: sign in with email & password redirects to /browse', async ({ page }) => {
    // the visitor persona's credentials are file-backed (written by auth.setup.ts),
    // so this works regardless of worker restarts; logging in mints an extra
    // session for the visitor, which is harmless - only signOut revokes tokens
    const { visitor } = readPersonas();
    await login(page, visitor);
    await expect(page.getByRole('link', { name: 'Publish' })).toBeVisible();
    await expect(page.getByTestId('profile-picture')).toBeVisible();
});

test('AUTH-06: sign out from an auth-dependent page', async ({ page }) => {
    // own disposable account: signOut revokes the user's refresh tokens, so this
    // must never run as a shared persona
    await registerFreshAccount(page);
    await page.goto('/publish');

    // UserMenu wraps signOut in confirm() on some URLs - accept it if it appears
    page.on('dialog', (dialog) => dialog.accept());

    // NOTE: staging hydrates slowly: a click ~20ms after goto lands on server-rendered
    // DOM whose use:popup listener isn't attached yet and silently does nothing
    // (trace-verified). Retry opening until the menu is actually showing
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

    // onAuthStateChange → invalidate('supabase:auth') → publish guard reruns
    // with no session → bounced to /signin. Pins graceful handling of a
    // mid-page session loss on a protected page.
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
});

test('AUTH-07: anonymous /publish is redirected to /signin', async ({ page }) => {
    await page.goto('/publish');
    await expect(page).toHaveURL(/\/signin/);
});

test('AUTH-08: anonymous access to another user\'s settings and edit pages is denied', async ({ page }) => {
    const { author } = readPersonas();

    await page.goto(`/${author.username}/settings`);
    await expect(page).toHaveURL(/\/signin/);

    await page.goto(`/${author.username}/edit`);
    await expect(page).toHaveURL(/\/signin/);
});

// These three need "logged in as someone who isn't the author" and never sign out
test.describe('as visitor persona', () => {
    test.use({ storageState: VISITOR_STORAGE });

    test('AUTH-10: opening another user\'s settings or edit page bounces to that profile', async ({ page }) => {
        const { author } = readPersonas();

        await page.goto(`/${author.username}/settings`);
        await expect(page).toHaveURL(`/${author.username}`);

        await page.goto(`/${author.username}/edit`);
        await expect(page).toHaveURL(`/${author.username}`);
    });

    test('AUTH-11: logged-in user is redirected away from /signin and /register', async ({ page }) => {
        await page.goto('/signin');
        await expect(page).toHaveURL('/browse');

        await page.goto('/register');
        await expect(page).toHaveURL('/browse');
    });

    test('AUTH-12: API rejects a write to another user\'s data (verifyAuth)', async ({ page }) => {
        const { author } = readPersonas();

        // resolve the author's id, then try to edit THEM. page.request shares
        // the page's cookie jar, so the PUT carries the visitor's real session -
        // the same IDOR attempt AUTH-10 makes via the UI, but at the API layer,
        // which integration tests never exercise (verifyAuth short-circuits
        // under NODE_ENV=test)
        const who = await page.request.get(`/api/user/username/${author.username}`);
        expect(who.ok()).toBeTruthy();
        const authorId = (await who.json()).user.id;

        const res = await page.request.put(`/api/user/${authorId}`, {
            data: {
                metaData: { firstName: 'X', lastName: 'X', email: 'x@x.x', aboutMe: '' },
                profilePic: null,
            },
        });
        expect(res.status()).toBe(401);
    });
});
