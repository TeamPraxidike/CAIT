import { test, expect, type Page } from '@playwright/test';
import { AUTHOR_STATE, type Persona, readPersonas } from './helpers/personas';
import { nextStep, setTitle, addLearningObjective, addTag, completeStepper } from './helpers/stepper';

const SEED_A = '[SEED] Gradient Descent by Hand';
const SEED_B = '[SEED] Decision Trees and Information Gain';

async function startCircuitPublish(page: Page) {
    await page.goto('/publish');
    await page.getByTestId('goto_publish_circuit').click();
    await expect(page).toHaveURL(/\/publish\/circuit/);
    await expect(page.locator('.svelte-flow')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Insert Publications' })).toBeVisible();
}

// Add a publication as a node: Insert Publications -> search (ranks it onto page
// 1; q ranks, doesn't filter) -> Select on the matching card -> Done.
async function addNodeByTitle(page: Page, title: string) {
    await page.getByRole('button', { name: 'Insert Publications' }).click();

    const search = page.getByPlaceholder('Browse materials');
    await expect(search).toBeVisible();
    await search.fill(title);
    await search.press('Enter');

    const card = page.locator('div.rounded-lg.shadow-md').filter({ hasText: title });
    await expect(async () => {
        await expect(card.getByRole('button', { name: 'Select' })).toBeVisible({ timeout: 3_000 });
    }).toPass({ timeout: 15_000 });
    await card.getByRole('button', { name: 'Select' }).click();

    await page.getByRole('button', { name: 'Done' }).click();
}

// Draw an edge from `fromTitle`'s node to `toTitle`'s node.
// A connection MUST go source->target,
async function connectNodes(page: Page, fromTitle: string, toTitle: string) {
    const nodes = page.locator('.svelte-flow__node');
    await expect(nodes).toHaveCount(2);

    const sourceHandle = nodes.filter({ hasText: fromTitle }).locator('.svelte-flow__handle[data-handlepos="bottom"]');
    const targetHandle = nodes.filter({ hasText: toTitle }).locator('.svelte-flow__handle[data-handlepos="top"]');
    const edges = page.locator('.svelte-flow__edge');

    await expect(async () => {
        if (await edges.count() === 0) {
            const s = await sourceHandle.boundingBox();
            const t = await targetHandle.boundingBox();
            if (!s || !t) throw new Error('circuit handles not found for edge drag');
            const sx = s.x + s.width / 2, sy = s.y + s.height / 2;
            const tx = t.x + t.width / 2, ty = t.y + t.height / 2;

            await sourceHandle.hover();
            await page.mouse.move(sx, sy);
            await page.mouse.down();
            await page.mouse.move((sx + tx) / 2, (sy + ty) / 2);
            await page.mouse.move(tx, ty, { steps: 8 });
            await page.mouse.up();
        }
        await expect(edges).toHaveCount(1, { timeout: 2_000 });
    }).toPass({ timeout: 20_000 });
}

test.describe('PCIR - publish a circuit', () => {
    test.use({ storageState: AUTHOR_STATE });

    let author: Persona;
    test.beforeAll(() => { author = readPersonas().author; });

    test('PCIR-01: build a circuit from two seed materials with one edge, publish, and verify', async ({ page }) => {
        const title = `e2e-pcir-01-${Date.now()}`;

        await startCircuitPublish(page);
        await addNodeByTitle(page, SEED_A);
        await addNodeByTitle(page, SEED_B);
        await connectNodes(page, SEED_A, SEED_B);

        await nextStep(page);                                   // canvas -> title
        await setTitle(page, title);
        await nextStep(page);                                   // title -> meta
        await addLearningObjective(page, 'Follow the suggested learning order.');
        await addTag(page, 'machine learning');                 // existing seed tag
        await nextStep(page);                                   // meta -> review
        await completeStepper(page, 'publish');                 // draft toggle defaults off

        // view page: circuit title heading + both member node labels on the canvas
        await page.getByRole('button', { name: 'View publication' }).click();
        await expect(page).toHaveURL(new RegExp(`/${author.username}/\\d+$`));
        await expect(page.getByRole('heading', { name: title })).toBeVisible();
        await expect(page.getByText(SEED_A).first()).toBeVisible();
        await expect(page.getByText(SEED_B).first()).toBeVisible();

        // appears in browse circuits
        await page.goto('/browse?type=circuits');
        const search = page.getByPlaceholder('Browse circuits');
        const card = page.getByRole('link', { name: title });
        await expect(async () => {
            await search.fill(title);
            await search.press('Enter');
            await expect(card).toBeVisible({ timeout: 3_000 });
        }).toPass({ timeout: 20_000 });
    });

    test('PCIR-04: publishing an empty circuit is forced to a draft', async ({ page }) => {
        const title = `e2e-pcir-04-${Date.now()}`;

        await startCircuitPublish(page);
        // no nodes added
        await nextStep(page);
        await setTitle(page, title);
        await nextStep(page);
        await addLearningObjective(page, 'Empty circuit should be a draft.');
        await addTag(page, 'machine learning');
        await nextStep(page);
        await completeStepper(page, 'publish');

        // forced to a draft despite the "publish" path
        await expect(page.getByText('Your publication has been saved as a draft - only you can see it')).toBeVisible();

        // absent from browse circuits
        await page.goto('/browse?type=circuits');
        const search = page.getByPlaceholder('Browse circuits');
        await search.fill(title);
        await search.press('Enter');
        await expect(page.getByRole('link', { name: title })).toHaveCount(0);

        // confirm it lands in the author's Draft Publications
        await page.goto(`/${author.username}`);
        const tabs = page.getByTestId('tab-group');
        await expect(async () => {
            await tabs.getByText('Draft Publications').click();
            await expect(page.getByRole('link', { name: title })).toBeVisible({ timeout: 3_000 });
        }).toPass({ timeout: 20_000 });
    });
});

