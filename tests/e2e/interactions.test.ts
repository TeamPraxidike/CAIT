import { test, expect, type Page } from '@playwright/test';
import { createMaterial } from './helpers/api';
import {AUTHOR_STATE, readPersonas, VISITOR_STATE, withContext} from "./helpers/personas";

// visitor interacts with a publication the AUTHOR owns - never [SEED] content,
// since likes/comments mutate shared state
test.use({ storageState: VISITOR_STATE });

let pubUrl: string;
let pubTitle: string;

test.beforeAll(async ({ browser }) => {
    const { author } = readPersonas();
    await withContext(browser, AUTHOR_STATE, async (page) => {
        const { id, title } = await createMaterial(page, author.username, { title: `e2e-int-${Date.now()}` });
        pubUrl = `/${author.username}/${id}`;
        pubTitle = title;
    });
});

// Hydration barrier: retry opening the Discussion tab until its client-rendered
// comment box appears - proves the page JS has attached before we click the
// action-bar buttons (SSR but inert until hydrated).
async function openDiscussion(page: Page) {
    const box = page.getByPlaceholder('Start a discussion...');
    await expect(async () => {
        if (!(await box.isVisible())) {
            await page.getByRole('tab', { name: 'Discussion' }).click();
        }
        await expect(box).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 15_000 });
}

// Opens the profile "Saved Publications" tab. Barrier via aria-selected (Skeleton
// sets it) - content-independent, so it works whether the tab is empty or not.
async function openSavedTab(page: Page) {
    const tab = page.getByRole('tab', { name: 'Saved Publications' });
    await expect(async () => {
        if ((await tab.getAttribute('aria-selected')) !== 'true') {
            await tab.click();
        }
        await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 2_000 });
    }).toPass({ timeout: 15_000 });
}

async function openForInteraction(page: Page, url: string) {
    await page.goto(url);
    await openDiscussion(page);
}

test('INT-01/02: like toggles both directions and persists each way', async ({ page }) => {
    await openForInteraction(page, pubUrl); // hydration barrier
    const like = page.getByTestId('like-button');
    await expect(like).toContainText('0');

    // like - persists
    let resp = page.waitForResponse('**/liked/**');
    await like.click();
    await resp;
    await expect(like).toContainText('1');
    await page.reload();
    await expect(page.getByTestId('like-button')).toContainText('1');

    // unlike - persists. reload reset hydration, so re-establish the barrier
    // before clicking the toggle again
    await openDiscussion(page);
    resp = page.waitForResponse('**/liked/**');
    await page.getByTestId('like-button').click();
    await resp;
    await expect(page.getByTestId('like-button')).toContainText('0');
    await page.reload();
    await expect(page.getByTestId('like-button')).toContainText('0');
});

test('INT-03: save shows in the profile Saved tab; unsave removes it', async ({ page }) => {
    const { visitor } = readPersonas();
    const profileUrl = `/${visitor.username}`;
    const card = page.getByRole('link', { name: pubTitle });

    // save on the publication (wait for the write before navigating away)
    await openForInteraction(page, pubUrl);
    let resp = page.waitForResponse('**/saved/**');
    await page.getByTestId('save-button').click();
    await resp;

    // it appears in the visitor's own profile Saved tab
    await page.goto(profileUrl);
    await openSavedTab(page);
    await expect(card).toBeVisible();

    // unsave
    await openForInteraction(page, pubUrl);
    resp = page.waitForResponse('**/saved/**');
    await page.getByTestId('save-button').click();
    await resp;

    // and it's gone from the Saved tab
    await page.goto(profileUrl);
    await openSavedTab(page);
    await expect(card).toBeHidden();
});

test('INT-04: visitor posts a comment; persists after reload', async ({ page }) => {
    await openForInteraction(page, pubUrl);
    const text = `e2e-int-comment-${Date.now()}`;

    await page.getByPlaceholder('Start a discussion...').fill(text);
    // the "Comment" submit button only appears once the textarea is focused
    await page.getByRole('button', { name: 'Comment' }).click();
    await expect(page.getByText(text)).toBeVisible();

    // check if it persists on page reload (i.e. also recorded in the db)
    await page.reload();
    await openDiscussion(page);
    await expect(page.getByText(text)).toBeVisible();
});