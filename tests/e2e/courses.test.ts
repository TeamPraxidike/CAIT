import { test, expect } from '@playwright/test';
import { AUTHOR_STATE, type Persona, readPersonas } from './helpers/personas';
import { createCourseWithMaterial } from './helpers/api';
import { SEED_COURSE } from './helpers/seed';

test.describe('CRS - courses', () => {
    test.use({storageState: AUTHOR_STATE});

    let author: Persona;
    test.beforeAll(() => {
        author = readPersonas().author;
    });

    test('CRS-01: a seed course page renders name, level, LOs, prerequisites and an empty state', async ({page}) => {
        await page.goto(`/courses/${encodeURIComponent(SEED_COURSE)}`);

        await expect(page.getByRole('heading', {name: SEED_COURSE})).toBeVisible();
        await expect(page.getByText('Learning Objectives')).toBeVisible();
        await expect(
            page.getByText('Frame a problem as supervised or unsupervised learning.'),
        ).toBeVisible();
        await expect(page.getByText('Programming in python')).toBeVisible();
        await expect(page.getByText('Bachelor')).toBeVisible();

        // seed courses have no linked publications - empty state, not an error
        await expect(page.getByText('This course is Empty')).toBeVisible();
    });

    test('CRS-02: a material linked to a course appears on the course page and links to the publication', async ({page}) => {
        const {course, material} = await createCourseWithMaterial(page, author.username, {
            materialTitle: `e2e-crs-02-${Date.now()}`,
        });

        await page.goto(`/courses/${encodeURIComponent(course.courseName)}`);

        const card = page.getByRole('link', {name: material.title}).first();
        await expect(card).toBeVisible();

        await card.click();
        await page.waitForURL(`**/${author.username}/${material.id}`);
        await expect(page.getByRole('heading', {name: material.title})).toBeVisible();
    });
});